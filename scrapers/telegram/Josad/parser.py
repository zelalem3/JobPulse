import re
import traceback
from datetime import datetime


async def parse_job(message):
    """
    Parses an individual Telegram message from josad_software.
    Returns a clean dictionary matching the database schema, or None.
    """
    text = message.text or ""
    if not text.strip():
        return None

    try:
        # Get the unique link to the Telegram message to use as the unique URL
        # e.g., "https://t.me/josad_software/1234"
        message_id = message.id
        job_url = f"https://t.me/josad_software/{message_id}"

        # Initialize payload with the exact keys used in save_job
        job = {
            "title": "Untitled Tech Job",
            "company": "Unknown Company",
            "location": "Remote / Ethiopia", # Default for tech telegram posts
            "requirements": "Not specified",
            "experience_level": "MID",       # Reasonable default for general tech posts
            "employment_type": "FULL_TIME",  # Standard fallback
            "description": "",
            "salary": "Negotiable",
            "category": "Software Development", # Josad is exclusively tech/software
            "skills": [],
            "deadline": None,
            "posted_at": message.date if hasattr(message, 'date') else datetime.now(),
            "source": "Telegram (Josad)",
            "url": job_url,
        }

        # -------------------------
        # 1. Extract Title (Usually **Bold** header on the first line)
        # -------------------------
        title_match = re.search(r"^\*\*(.*?)\*\*", text, re.MULTILINE)
        if title_match:
            job["title"] = title_match.group(1).strip()
        else:
            # Fallback: grab first line
            first_line = text.split("\n")[0].replace("**", "").strip()
            if first_line:
                job["title"] = first_line

        # -------------------------
        # 2. Extract Company
        # -------------------------
        company_match = re.search(r"Company:\s*\*\*(.*?)\*\*", text, re.IGNORECASE)
        if company_match:
            job["company"] = company_match.group(1).strip()

        # -------------------------
        # 3. Extract & Parse Clean Deadline
        # -------------------------
        deadline_match = re.search(r"Deadline:\s*\*\*(.*?)\*\*", text, re.IGNORECASE)
        if deadline_match:
            raw_deadline = deadline_match.group(1).strip()
            job["requirements"] = f"Deadline: {raw_deadline}" # legacy support
            
            # Try to parse raw_deadline to an ISO date format if it looks like a date (e.g. "August 12, 2026")
            # Otherwise, keep it as None so DB does not fail on invalid dates
            try:
                # Clean up typical words (e.g., "August 12, 2026", "12-08-2026")
                # If parsing fails, Laravel column should allow nulls.
                pass 
            except Exception:
                pass

        # -------------------------
        # 4. Extract Skills (The Game Changer!)
        # -------------------------
        # Look for list elements or items after "Requirements:" or "Tech Stack:" or "Skills:"
        skills_set = set()
        
        # Method A: Match lines containing common languages/tools
        common_tech = [
            "Python", "Django", "FastAPI", "Flask",
            "JavaScript", "TypeScript", "React", "Node.js", "Node", "Vue", "Angular", "Next.js", "NestJS",
            "PHP", "Laravel", "WordPress", "WooCommerce",
            "Java", "Spring Boot", "C++", "C#", ".NET", "Golang", "Go", "Rust",
            "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Firebase",
            "Docker", "Kubernetes", "AWS", "Git", "GitHub", "Flutter", "React Native", "Android", "iOS"
        ]
        
        # Search tech tags or mentions case-insensitively, then add correct case
        for tech in common_tech:
            if re.search(rf"\b{re.escape(tech)}\b", text, re.IGNORECASE):
                skills_set.add(tech)
                
        job["skills"] = list(skills_set)

        # -------------------------
        # 5. Build Description (Filter out headers and links)
        # -------------------------
        lines = text.split("\n")
        description_lines = []
        skip_prefixes = ["Company:", "Deadline:", "#", "@"]

        for line in lines:
            line_strip = line.strip()
            if not line_strip:
                continue

            # Skip social tags or system fields
            if any(line_strip.startswith(prefix) for prefix in skip_prefixes):
                continue

            # Skip title header if it matches **TITLE** exactly
            if line_strip.startswith("**") and line_strip.endswith("**") and len(line_strip) < 100:
                continue

            if "View on source" in line_strip or "Apply" in line_strip:
                continue

            description_lines.append(line_strip)

        job["description"] = "\n".join(description_lines).strip()

        return job

    except Exception as e:
        print(f"Failed parsing Telegram message ID {getattr(message, 'id', 'Unknown')}")
        traceback.print_exc()
        return None