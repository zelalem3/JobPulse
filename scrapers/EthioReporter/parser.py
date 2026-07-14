import re
from datetime import datetime
from bs4 import BeautifulSoup
from playwright.sync_api import Page


def clean(text):
    if not text:
        return None
    return re.sub(r"\s+", " ", text).strip()


def parse_job(page: Page, url: str) -> dict:
    """
    Parses a single job page using an already-active Playwright page instance.
    """
    # Load the page and wait for it to settle
    page.goto(url, wait_until="networkidle", timeout=60000)
    page.wait_for_timeout(2000)

    soup = BeautifulSoup(page.content(), "lxml")

    # ----------------------------
    # Title
    # ----------------------------
    title = None
    h1 = soup.find("h1")
    if h1:
        title = clean(h1.get_text())

    # ----------------------------
    # Whole page text (for metadata fallback searching)
    # ----------------------------
    page_text = soup.get_text("\n", strip=True)

    # ----------------------------
    # Company
    # ----------------------------
    company = None
    match = re.search(r"Company\s*:?\s*(.+)", page_text, re.IGNORECASE)
    if match:
        company = clean(match.group(1))

    # ----------------------------
    # Location
    # ----------------------------
    location = None
    match = re.search(r"Location\s*:?\s*(.+)", page_text, re.IGNORECASE)
    if match:
        location = clean(match.group(1))

    # ----------------------------
    # Employment Type
    # ----------------------------
    employment_type = None
    match = re.search(r"Employment Type\s*:?\s*(.+)", page_text, re.IGNORECASE)
    if match:
        employment_type = clean(match.group(1))

    # ----------------------------
    # Experience
    # ----------------------------
    experience_level = None
    match = re.search(r"Experience\s*:?\s*(.+)", page_text, re.IGNORECASE)
    if match:
        experience_level = clean(match.group(1))

    # ----------------------------
    # Category
    # ----------------------------
    category = None
    match = re.search(r"Category\s*:?\s*(.+)", page_text, re.IGNORECASE)
    if match:
        category = clean(match.group(1))

    # ----------------------------
    # Deadline
    # ----------------------------
    deadline = None
    match = re.search(r"Deadline\s*:?\s*(.+)", page_text, re.IGNORECASE)
    if match:
        value = clean(match.group(1))
        try:
            deadline = datetime.strptime(value, "%B %d, %Y").date()
        except Exception:
            deadline = value

    # ----------------------------
    # Description
    # ----------------------------
    description = None
    article = soup.find("article")
    if article:
        description = clean(article.get_text("\n", strip=True))

    # ----------------------------
    # Requirements
    # ----------------------------
    requirements = description

    # ----------------------------
    # Skills (Updated with secure word-boundary regex checks)
    # ----------------------------
    skills = []
    common_skills = [
        "python", "django", "laravel", "react", "vue", "angular", 
        "flutter", "java", "javascript", "typescript", "php", "mysql", 
        "postgresql", "docker", "git", "linux", "node", "aws", 
        "azure", "kubernetes", "html", "css", "c++", "c#"
    ]

    if description:
        lower_desc = description.lower()
        for skill in common_skills:
            # Escape symbols like ++ or # safely in regex, use word boundaries (\b)
            escaped_skill = re.escape(skill)
            pattern = rf"\b{escaped_skill}\b"
            
            if re.search(pattern, lower_desc):
                skills.append(skill.title())

    return {
        "title": title,
        "company": company,
        "location": location,
        "requirements": requirements,
        "description": description,
        "employment_type": employment_type,
        "experience_level": experience_level,
        "salary": None,
        "category": category,
        "skills": skills,
        "deadline": deadline,
        "posted_at": None,
        "source": "Ethiopian Reporter Jobs",
        "url": url,
    }