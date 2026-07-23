import os
from google import genai
from google.genai import types
import json
from dotenv import load_dotenv
load_dotenv()


client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def extract_skills(job_description_text):
    prompt = f"""
    Analyze the following job description and extract a list of required technical, professional, or soft skills.
    Return the response STRICTLY as a valid JSON array of strings containing canonical skill names (e.g., ["Python", "HR Management", "Communication"]). 
    Do not include any markdown formatting, code blocks, or extra text—just the raw JSON array. If none are found, return [].

    Description:
    {job_description_text}
    """

    response = client.models.generate_content(
        model='gemini-2.5-flash', 
        contents=prompt,
    )

    try:
        # Clean up text just in case it included backticks
        clean_text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(clean_text)
    except Exception as e:
        print("Error parsing AI skill response:", e)
        return []