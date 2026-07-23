import os
import re
import json
import logging
from google import genai
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


CONFIG_DIR = os.path.join(os.path.dirname(__file__), "config")

TAXONOMY_PATH = os.path.join(CONFIG_DIR, "skills_taxonomy.json")
ALIASES_PATH = os.path.join(CONFIG_DIR, "skill_aliases.json")


api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

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


def canonical_skill(skill: str) -> str:
    """
    Returns the canonical name for a skill.
    """
    return ALIASES.get(skill.lower(), skill)


def get_variants(skill: str):
    """
    Returns every searchable form of a skill (itself + any defined aliases pointing to it).
    """
    variants = {skill.lower()}

    for alias, canonical in ALIASES.items():
        if canonical.lower() == skill.lower():
            variants.add(alias)

    return variants


# --- BLACKLIST FOR NOISY / GENERIC MATCHES ---
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

    
    boosting_keywords = ["stack", "requirements", "technologies", "experience with", "qualification", "skills"]
    paragraphs = text.split('\n') if boost_weights else [text]

    for skill in FLATTENED_SKILLS:
        if skill.lower() in blacklist:
            continue

        matched = False

        # Search using canonical skill and all respective alias variants
        for variant in get_variants(skill):
            if any(c in variant for c in ['.', '+', '#', '-']):
                pattern = r'(?<!\w)' + re.escape(variant) + r'(?!\w)'
            else:
                pattern = r'\b' + re.escape(variant) + r'\b'

            if boost_weights:
                for para in paragraphs:
                    para_lower = para.lower()
                    if re.search(pattern, para_lower):
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
            
    # Context-aware fallback: Only inject baseline canonical skills if description yielded nothing
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
    """
    Extracts skills using Gemini AI (with alias awareness/fallback) or local pattern matching 
    with boundary-safe alias mapping to canonical taxonomy records.
    """
    raw_text = job_description_text or ""
    clean_desc = re.sub(r'https?://\S+|www\.\S+', '', raw_text)
    clean_desc = re.sub(r'[*_#`]', ' ', clean_desc) 
    
    sanitized_description = clean_desc.strip()
    sanitized_title = re.sub(r'[*_#`]', '', job_title or "").strip()

    if not sanitized_description or len(sanitized_description) < 5:
        return []

    if not client:
        return _smart_local_extraction(sanitized_description, sanitized_title, boost_weights=boost_weights)

    prompt = f"""
    You are an expert technical and professional recruiter. Analyze the job title and description below and extract a list of relevant required professional, technical, or domain skills strictly matching industry standards from your training data.
    
    Job Title: {sanitized_title}
    Description: {sanitized_description}

    Return the response STRICTLY as a valid JSON array of strings containing standard industry skill names. 
    Do not include any markdown formatting, code blocks, or extra text—just the raw JSON array. If none are found, return [].
    """

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash', 
            contents=prompt,
        )
        
        raw_text_ai = response.text.strip()
        print(f"[AI Extraction Raw Output for '{sanitized_title}']: {raw_text_ai}")
        
        clean_text = raw_text_ai.replace("```json", "").replace("```", "").strip()
        ai_skills = json.loads(clean_text)
        
        if isinstance(ai_skills, list) and len(ai_skills) > 0:
            
            canonicalized_ai_skills = sorted(list(set(canonical_skill(s) for s in ai_skills)))
            return canonicalized_ai_skills
            
        return _smart_local_extraction(sanitized_description, sanitized_title, boost_weights=boost_weights)
        
    except Exception as e:
        print(f"[AI Fallback Notice] Error: {e}. Using smart local parser.")
        return _smart_local_extraction(sanitized_description, sanitized_title, boost_weights=boost_weights)