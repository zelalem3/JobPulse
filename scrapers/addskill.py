import hashlib
import json
import logging
import os
import re
import time
from dotenv import load_dotenv
from google import genai
from openai import OpenAI, RateLimitError, APITimeoutError, APIConnectionError

load_dotenv(
    os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        ".env",
    )
)

logger = logging.getLogger(__name__)

CONFIG_DIR = os.path.join(os.path.dirname(__file__), "config")
TAXONOMY_PATH = os.path.join(CONFIG_DIR, "skills_taxonomy.json")
ALIASES_PATH = os.path.join(CONFIG_DIR, "skill_aliases.json")
CACHE_PATH = os.path.join(CONFIG_DIR, "skill_cache.json")

# ---------------------------------------------------------------------------
# Clients
# ---------------------------------------------------------------------------
groq_client = (
    OpenAI(
        api_key=os.environ["GROQ_API_KEY"],
        base_url="https://api.groq.com/openai/v1",
        max_retries=0,
        timeout=45.0,
    )
    if os.getenv("GROQ_API_KEY")
    else None
)

openrouter_client = (
    OpenAI(
        api_key=os.environ["OPENROUTER_API_KEY"],
        base_url="https://openrouter.ai/api/v1",
        max_retries=0,
        timeout=45.0,
    )
    if os.getenv("OPENROUTER_API_KEY")
    else None
)

GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "openrouter/free")

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

CACHE_SAVE_INTERVAL = 20
cache_changes = 0

GEMINI_DISABLED_UNTIL = 0.0
GROQ_DISABLED_UNTIL = 0.0
GEMINI_COOLDOWN = 300
GROQ_COOLDOWN = 90

# ---------------------------------------------------------------------------
# Taxonomy & aliases
# ---------------------------------------------------------------------------
try:
    with open(TAXONOMY_PATH, "r", encoding="utf-8") as f:
        SKILLS_TAXONOMY = json.load(f)
except Exception as e:
    logger.error(f"[Config Error] Could not load skills_taxonomy.json: {e}")
    SKILLS_TAXONOMY = {}

FLATTENED_SKILLS = sorted(
    [
        skill
        for category_skills in SKILLS_TAXONOMY.values()
        for skill in category_skills
    ],
    key=lambda x: len(x),
    reverse=True,
)

try:
    with open(ALIASES_PATH, "r", encoding="utf-8") as f:
        SKILL_ALIASES = json.load(f)
except Exception as e:
    logger.warning(f"[Config Warning] Could not load skill_aliases.json: {e}")
    SKILL_ALIASES = {}

ALIASES = {k.lower(): v for k, v in SKILL_ALIASES.items()}


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
    normalized = re.sub(r"\s+", " ", f"{title} {description}".lower().strip())
    return hashlib.sha256(normalized.encode("utf-8")).hexdigest()


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
    "assessment", "project", "client", "team", "leader", "manager",
    "officer", "specialist", "expert", "and", "or", "tax",
}


def _smart_local_extraction(
    text: str,
    job_title: str = "",
    boost_weights: bool = False,
    blacklist: set[str] = DEFAULT_BLACKLIST,
) -> list:
    if not text:
        return []

    found_skills = set()
    combined_text = f"{job_title} {text}".lower()
    combined_text = re.sub(r"\s+", " ", combined_text)
    paragraphs = text.split("\n") if boost_weights else [text]

    for skill in FLATTENED_SKILLS:
        if skill.lower() in blacklist:
            continue

        matched = False
        for variant in get_variants(skill):
            if any(c in variant for c in [".", "+", "#", "-"]):
                pattern = r"(?<!\w)" + re.escape(variant) + r"(?!\w)"
            else:
                pattern = r"\b" + re.escape(variant) + r"\b"

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

    if not found_skills:
        title_lower = job_title.lower()
        if "frontend" in title_lower or "front-end" in title_lower:
            found_skills.update(["JavaScript", "HTML", "CSS", "React"])
        elif "backend" in title_lower or "back-end" in title_lower:
            found_skills.update(["REST API", "Node.js"])
        elif "fullstack" in title_lower or "full stack" in title_lower:
            found_skills.update(["JavaScript", "REST API"])
        elif "network" in title_lower:
            found_skills.update(["Networking", "TCP/IP", "Cisco", "Firewall"])
        elif "support" in title_lower or "helpdesk" in title_lower:
            found_skills.update(["Troubleshooting", "Windows", "Active Directory"])

    return sorted(list(found_skills))


def _parse_skill_array(raw_response: str) -> list[str]:
    if not raw_response or not raw_response.strip():
        raise ValueError("AI returned an empty response")

    text = raw_response.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE | re.MULTILINE)
    text = re.sub(r"\s*```$", "", text, flags=re.MULTILINE).strip()

    try:
        parsed = json.loads(text)
        if isinstance(parsed, list) and all(isinstance(x, str) for x in parsed):
            return [s.strip() for s in parsed if s.strip()]
    except json.JSONDecodeError:
        pass

    decoder = json.JSONDecoder()
    for i, ch in enumerate(text):
        if ch != "[":
            continue
        try:
            parsed, _ = decoder.raw_decode(text[i:])
            if isinstance(parsed, list) and all(isinstance(x, str) for x in parsed):
                return [s.strip() for s in parsed if s.strip()]
        except json.JSONDecodeError:
            continue

    strings = re.findall(r'["\']([^"\']+)["\']', text)
    if strings:
        return [s.strip() for s in strings if s.strip()]

    raise ValueError(f"AI did not return a valid JSON array of strings. Got: {text[:200]!r}")


def _call_chat_provider(provider_name: str, provider_client, model: str, prompt: str) -> list[str]:
    global GROQ_DISABLED_UNTIL

    last_error = None
    for attempt in range(2):
        try:
            messages = [
                {
                    "role": "system",
                    "content": "Return only a JSON array of strings. Nothing else."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]

            kwargs = {
                "model": model,
                "messages": messages,
                "temperature": 0,
                "max_tokens": 250,
            }

            # Only valid values: low / medium / high
            if "gpt-oss" in model:
                kwargs["reasoning_effort"] = "low"

            response = provider_client.chat.completions.create(**kwargs)

            choice = response.choices[0]
            raw = (choice.message.content or "").strip()
            finish = getattr(choice, "finish_reason", None)

            logger.debug(f"{provider_name} raw: {raw[:300]!r} | finish={finish}")

            if not raw:
                raise ValueError(f"{provider_name} empty content (finish_reason={finish})")

            return _parse_skill_array(raw)

        except RateLimitError as e:
            last_error = e
            if provider_name == "Groq":
                GROQ_DISABLED_UNTIL = time.time() + GROQ_COOLDOWN
                logger.warning(f"[Skill Extraction] Groq rate-limited → cooling down {GROQ_COOLDOWN}s")
                raise
            if attempt == 0:
                time.sleep(4)
                continue
            raise

        except Exception as e:
            last_error = e
            if attempt == 0:
                time.sleep(2)
                continue
            raise

    raise RuntimeError(f"{provider_name} failed after retries: {last_error}")


def call_gemini(prompt: str):
    global GEMINI_DISABLED_UNTIL
    if time.time() < GEMINI_DISABLED_UNTIL:
        raise RuntimeError("Gemini in cooldown")

    try:
        return client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
    except Exception as e:
        GEMINI_DISABLED_UNTIL = time.time() + GEMINI_COOLDOWN
        raise RuntimeError(f"Gemini failed: {e}")


def amharic_ratio(text: str) -> float:
    if not text:
        return 0.0
    return sum(1 for c in text if "\u1200" <= c <= "\u137F") / len(text)


def extract_skills(
    job_description_text: str = "",
    job_title: str = "",
    boost_weights: bool = False,
) -> list:
    global cache_changes

    raw_text = job_description_text or ""
    clean_desc = re.sub(r"https?://\S+|www\.\S+", "", raw_text)
    clean_desc = re.sub(r"[\*_#`]", " ", clean_desc)
    sanitized_description = clean_desc.strip()
    sanitized_title = re.sub(r"[\*_#`]", "", job_title or "").strip()

    if len(sanitized_description) < 5:
        return []

    local_skills = _smart_local_extraction(
        sanitized_description, sanitized_title, boost_weights=boost_weights
    )

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

    if score >= 1 and not is_amharic:          # prefer local more often
        return local_skills

    h_id = job_hash(sanitized_title, sanitized_description)
    if h_id in SKILL_CACHE:
        return sorted(set(local_skills).union(SKILL_CACHE[h_id]))

    trimmed = sanitized_description[:800]

    prompt = f"""Title: {sanitized_title}
Already found: {', '.join(local_skills) if local_skills else 'None'}
Text: {trimmed}

Return only a JSON array of additional technical skills.
"""

    providers = []

    if client and time.time() >= GEMINI_DISABLED_UNTIL:
        providers.append(("Gemini", lambda: _parse_skill_array(call_gemini(prompt).text.strip())))

    if groq_client and time.time() >= GROQ_DISABLED_UNTIL:
        providers.append(
            ("Groq", lambda: _call_chat_provider("Groq", groq_client, GROQ_MODEL, prompt))
        )

    if openrouter_client and OPENROUTER_MODEL:
        providers.append(
            (
                "OpenRouter",
                lambda: _call_chat_provider(
                    "OpenRouter", openrouter_client, OPENROUTER_MODEL, prompt
                ),
            )
        )

    if not providers:
        logger.warning("[Skill Extraction] No providers available → local only")
        return local_skills

    for name, fn in providers:
        try:
            ai_skills = fn()
            normalized = {canonical_skill(s) for s in ai_skills if s.strip()}
            final = sorted(set(local_skills).union(normalized))

            SKILL_CACHE[h_id] = final
            cache_changes += 1
            if cache_changes >= CACHE_SAVE_INTERVAL:
                save_cache(SKILL_CACHE)
                cache_changes = 0

            logger.info(f"[Skill Extraction] {name} OK → {len(final)} skills for '{sanitized_title}'")
            time.sleep(2.0)          # stay under free-tier TPM
            return final

        except Exception as exc:
            logger.warning(f"[Skill Extraction] {name} failed: {exc}")
            continue

    logger.warning(f"[Skill Extraction] All AI failed → local for: {sanitized_title}")
    return local_skills