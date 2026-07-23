import os
from google import genai
from google.genai import types
import json

# Initialize the client using your key (or set it as an env variable GEMINI_API_KEY)
client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

def extract_skills(job_description_text):
    prompt = f"""
    Analyze the following job description and extract a list of required technical, professional, or soft skills.
    Return the response STRICTLY as a valid JSON array of strings containing canonical skill names (e.g., ["Python", "HR Management", "Communication"]). 
    Do not include any markdown formatting, code blocks, or extra text—just the raw JSON array. If none are found, return [].

    Description:
    {job_description_text}
    """

    response = client.models.generate_content(
        model='gemini-2.5-flash', # Or gemini-2.5-flash
        contents=prompt,
    )

    try:
        # Clean up text just in case it included backticks
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean_text)
    except Exception as e:
        print("Error parsing AI skill response:", e)
        return []