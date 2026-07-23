import os
import re
import json
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None

# Load taxonomy dynamically from the config file
config_path = os.path.join(os.path.dirname(__file__), "config", "skills_taxonomy.json")
try:
    with open(config_path, "r", encoding="utf-8") as f:
        SKILLS_TAXONOMY = json.load(f)
except Exception as e:
    print(f"[Config Error] Could not load skills_taxonomy.json: {e}")
    SKILLS_TAXONOMY = {}

FLATTENED_SKILLS = sorted(
    [skill for category_skills in SKILLS_TAXONOMY.values() for skill in category_skills],
    key=lambda x: len(x),
    reverse=True
)

def _smart_local_extraction(text: str, job_title: str = "") -> list:
    if not text:
        return []
    found_skills = set()
    combined_text = f"{job_title} {text}".lower()
    normalized_text = re.sub(r'[/,._\-()]', ' ', combined_text)
    
    for skill in FLATTENED_SKILLS:
        skill_lower = skill.lower()
        if " " in skill_lower or "+" in skill_lower or "." in skill_lower:
            pattern = r'(?:^|\s)' + re.escape(skill_lower) + r'(?:$|\s|[.,!?;:])'
        else:
            pattern = r'\b' + re.escape(skill_lower) + r'\b'
            
        if re.search(pattern, normalized_text):
            found_skills.add(skill)
            
    return list(found_skills)

def extract_skills(job_description_text="", job_title=""):
    """
    Extracts skills using Gemini AI after stripping out noise, 
    with robust error logging and context-aware fallback matching.
    """

    raw_text = job_description_text or ""
    clean_desc = re.sub(r'https?://\S+|www\.\S+', '', raw_text)
    clean_desc = re.sub(r'[*_#`]', ' ', clean_desc) 
    
    sanitized_description = clean_desc.strip()
    sanitized_title = re.sub(r'[*_#`]', '', job_title or "").strip()

    if not sanitized_description or len(sanitized_description) < 5:
        return []

    if not client:
        return _smart_local_extraction(sanitized_description, sanitized_title)

    prompt = f"""
    You are an expert technical and professional recruiter. Analyze the job title and description below and extract a list of relevant required professional, technical, or domain skills (e.g., Python, React, Fullstack Development, Accounting, Healthcare, etc.).
    
    Job Title: {sanitized_title}
    Description: {sanitized_description}

    Return the response STRICTLY as a valid JSON array of strings containing standard industry skill names from your knowledge. 
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
        skills = json.loads(clean_text)
        
        if isinstance(skills, list) and len(skills) > 0:
            return skills
            
        return _smart_local_extraction(sanitized_description, sanitized_title)
        
    except Exception as e:
        print(f"[AI Fallback Notice] Error: {e}. Using smart local parser.")
        return _smart_local_extraction(sanitized_description, sanitized_title)