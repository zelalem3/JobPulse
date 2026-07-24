import os
import re
import json
import logging
from google import genai
from dotenv import load_dotenv
import hashlib
import time

load_dotenv()

logger = logging.getLogger(__name__)

CONFIG_DIR = os.path.join(os.path.dirname(__file__), "config")
TAXONOMY_PATH = os.path.join(CONFIG_DIR, "skills_taxonomy.json")
ALIASES_PATH = os.path.join(CONFIG_DIR, "skill_aliases.json")
CACHE_PATH = os.path.join(CONFIG_DIR, "skill_cache.json")

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

CACHE_SAVE_INTERVAL = 20
cache_changes = 0

# Pull in our skill dictionaries and map out aliases
try:
    with open(TAXONOMY_PATH, "r", encoding="utf-8") as f:
        SKILLS_TAXONOMY = json.load(f)
except Exception as e:
    logger.error(f"[Config Error] Could not load skills_taxonomy.json: {e}")
    SKILLS_TAXONOMY = {}

FLATTENED_SKILLS = sorted(
    [skill for category_skills in SKILLS_TAXONOMY.values() for skill in category_skills],
    key=lambda x: len(x),
    reverse=True
)

try:
    with open(ALIASES_PATH, "r", encoding="utf-8") as f:
        SKILL_ALIASES = json.load(f)
except Exception as e:
    logger.warning(f"[Config Warning] Could not load skill_aliases.json: {e}")
    SKILL_ALIASES = {}

ALIASES = {k.lower(): v for k, v in SKILL_ALIASES.items()}

# Load up existing cache if we've got one
def load_cache():
    if os.path.exists(CACHE_PATH):
        try:
            with open(CACHE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_cache(cache_data):
    os.makedirs(os.path.dirname(CACHE_PATH), exist_ok=True)

    temp_path = CACHE_PATH + ".tmp"

    with open(temp_path, "w", encoding="utf-8") as f:
        json.dump(cache_data, f, ensure_ascii=False, indent=2)

    os.replace(temp_path, CACHE_PATH)

SKILL_CACHE = load_cache()

def job_hash(title: str, description: str) -> str:
    # Hash the normalized payload so we don't spam Gemini for identical listings
    normalized = re.sub(
        r"\s+",
        " ",
        f"{title} {description}".lower().strip()
    )

    return hashlib.sha256(
        normalized.encode("utf-8")
    ).hexdigest()

def canonical_skill(skill: str) -> str:
    return ALIASES.get(skill.lower(), skill)

def get_variants(skill: str):
    variants = {skill.lower()}
    for alias, canonical in ALIASES.items():
        if canonical.lower() == skill.lower():
            variants.add(alias)
    return variants

DEFAULT_BLACKLIST = {
    "r", "c", "it", "is", "a", "hr", "sales", "go", "to", "in", "on", 
    "assessment", "project", "client", "team", "leader", 
    "manager", "officer", "specialist", "expert", "and", "or", "tax"
}

def _smart_local_extraction(
    text: str, 
    job_title: str = "", 
    boost_weights: bool = False,
    blacklist: set[str] = DEFAULT_BLACKLIST
) -> list:
    if not text:
        return []
    
    found_skills = set()
    combined_text = f"{job_title} {text}".lower()
    combined_text = re.sub(r'\s+', ' ', combined_text)
    paragraphs = text.split('\n') if boost_weights else [text]

    for skill in FLATTENED_SKILLS:
        if skill.lower() in blacklist:
            continue

        matched = False
        for variant in get_variants(skill):
            if any(c in variant for c in ['.', '+', '#', '-']):
                pattern = r'(?<!\w)' + re.escape(variant) + r'(?!\w)'
            else:
                pattern = r'\b' + re.escape(variant) + r'\b'

            if boost_weights:
                for para in paragraphs:
                    if re.search(pattern, para.lower()):
                        matched = True
                        break
                if matched:
                    break
            else:
                if re.search(pattern, combined_text):
                    matched = True
                    break

        if matched:
            found_skills.add(canonical_skill(skill))
            
    # Fallback to defaults based on title keywords if the text parser came up empty
    if not found_skills:
        title_lower = job_title.lower()
        if "frontend" in title_lower or "front-end" in title_lower:
            found_skills.update(["JavaScript", "HTML", "CSS", "React"])
        elif "backend" in title_lower or "back-end" in title_lower:
            found_skills.update(["REST API", "Node.js"])
        elif "fullstack" in title_lower or "full stack" in title_lower:
            found_skills.update(["JavaScript", "REST API"])

    return sorted(list(found_skills))

def extract_skills(job_description_text: str = "", job_title: str = "", boost_weights: bool = False) -> list:
    global cache_changes
    raw_text = job_description_text or ""
    clean_desc = re.sub(r'https?://\S+|www\.\S+', '', raw_text)
    clean_desc = re.sub(r'[*_#`]', ' ', clean_desc) 
    
    sanitized_description = clean_desc.strip()
    sanitized_title = re.sub(r'[*_#`]', '', job_title or "").strip()

    if not sanitized_description or len(sanitized_description) < 5:
        return []

    # First pass: try to grab everything we can locally
    local_skills = _smart_local_extraction(sanitized_description, sanitized_title, boost_weights=boost_weights)

    # Score our confidence to see if we actually need to pull in Gemini
    score = 0
    if len(local_skills) >= 5:
        score += 2
    elif len(local_skills) >= 3:
        score += 1

    is_amharic = amharic_ratio(sanitized_description) > 0.20

    if is_amharic:
        score -= 2

    if len(sanitized_description) < 200:
        score -= 1

    # Skip out early on clean, high-confidence English posts
    if score >= 2 and not is_amharic:
        return local_skills

    # Bail out if API client isn't set up
    if not client:
        return local_skills

    # Check the cache before making any network calls
    h_id = job_hash(sanitized_title, sanitized_description)
    if h_id in SKILL_CACHE:
        cached_skills = SKILL_CACHE[h_id]
        return sorted(list(set(local_skills).union(cached_skills)))

    # Give Amharic posts more breathing room since they tend to be verbose
    trimmed_description = (
        sanitized_description[:5000]
        if is_amharic
        else sanitized_description[:2000]
    )

    # Prompt layout focusing Gemini strictly on hard technical skills
    prompt = f"""
    You are an expert technical and professional recruiter enhancing a job skill parsing pipeline.
    Job Title: {sanitized_title}
    
    Local parser already detected these baseline skills:
    {", ".join(local_skills) if local_skills else "None"}

    Job Description:
    {trimmed_description}
    
    Only return:
    - Technical skills
    - Software tools
    - Programming languages
    - Frameworks
    - Platforms
    - Databases
    - Cloud technologies

    Do NOT return:
    - Communication
    - Teamwork
    - Leadership
    - Problem solving
    - Time management
    - Interpersonal skills

    Task: Analyze the description and extract ONLY additional missing industry-standard skills that are not covered in the baseline list above. Do not repeat existing skills.
    Return the response STRICTLY as a valid JSON array of strings. If no extra skills are found, return [].
    """

    try:
        response = call_gemini(prompt)
        
        raw_text_ai = response.text.strip()
        
        match = re.search(r"\[[\s\S]*\]", raw_text_ai)

        if match:
            clean_text = match.group(0)
        else:
            clean_text = "[]"

        try:
            ai_skills = json.loads(clean_text)

        except json.JSONDecodeError:
            logger.warning("Gemini returned invalid JSON.")
            ai_skills = []
        
        gemini_skills = []
        if isinstance(ai_skills, list) and len(ai_skills) > 0:
            gemini_skills = [canonical_skill(s) for s in ai_skills]
            
        # Merge local findings with whatever Gemini picked up
        final_skills = set(local_skills)
        final_skills.update(gemini_skills)
        sorted_final = sorted(list(final_skills))

        # Update cache and batch disk writes
        SKILL_CACHE[h_id] = sorted_final
        cache_changes += 1

        if cache_changes >= CACHE_SAVE_INTERVAL:
            save_cache(SKILL_CACHE)
            cache_changes = 0

        return sorted_final
        
    except Exception as e:
        logger.error(f"[AI Fallback Notice] Error: {e}. Returning smart local parser payload.")
        return local_skills

def amharic_ratio(text):
    if not text:
        return 0

    amharic = sum(
        1 for c in text
        if '\u1200' <= c <= '\u137F'
    )

    return amharic / len(text)

def call_gemini(prompt):
    # Retry wrapper with exponential backoff for handling rate limits gracefully
    for attempt in range(5):
        try:
            return client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )

        except Exception as e:
            if "429" in str(e):
                wait = 2 ** attempt
                logger.warning(
                    f"Rate limited. Sleeping {wait}s"
                )
                time.sleep(wait)
                continue

            raise

    raise RuntimeError("Gemini retries exhausted.")