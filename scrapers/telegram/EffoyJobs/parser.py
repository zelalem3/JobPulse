import re

async def parse_job(message):
    print("started parsing")
    
    text = message.text or ""
    if not text:
        return None

    job = {
        "title": None,
        "location": None,
        "requirements": None,
        "description": text.strip(), # Default raw fallback for description
        "employment_type": None,
        "experience_level": None,
        "salary": None,
        "category": None,
        "skills": "[]",
        "deadline": None,
        "posted_at": getattr(message, 'date', None),
        "source": "Effoy Jobs",
        "url": None
    }

   
    url_match = re.search(r"https?://[^\s/$.?#].[^\s]*", text)
    if url_match:
        
        urls = re.findall(r"https?://[^\s]+", text)
        specific_urls = [u for u in urls if "t.me" not in u]
        if specific_urls:
            job["url"] = specific_urls[0].strip()
        else:
            job["url"] = url_match.group(0).strip()

  
    lines = [line.strip() for line in text.split("\n") if line.strip()]

    if lines:
      
        raw_title = lines[0]
      
        clean_title = re.sub(r"^[★📌✨♦✅\s•\-\s]+", "", raw_title)
        job["title"] = clean_title[:250].strip()

    
    deadline_match = re.search(r"(?:Deadline|የማመልከቻ ማብቂያ ቀን):\s*([^\n]+)", text, re.IGNORECASE)
    if deadline_match:
        job["deadline"] = deadline_match.group(1).strip()

    # 4. Handle simple patterns for Salaries
    salary_match = re.search(r"(?:ደመወዝ|Salary):\s*([^\n]+)", text, re.IGNORECASE)
    if salary_match:
        job["salary"] = salary_match.group(1).strip()

    return job