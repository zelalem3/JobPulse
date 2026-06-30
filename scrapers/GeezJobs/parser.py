import re
from datetime import datetime

from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright


def extract_between(text, start, end=None):
    if start not in text:
        return None

    section = text.split(start, 1)[1]

    if end and end in section:
        section = section.split(end, 1)[0]

    return section.strip()


def parse_job(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=False,
            args=["--disable-blink-features=AutomationControlled"]
        )

        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (X11; Linux x86_64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/138.0.0.0 Safari/537.36"
            )
        )

        page = context.new_page()

        page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
        """)

        try:
            page.goto(
                url,
                wait_until="domcontentloaded",
                timeout=60000
            )

            page.wait_for_timeout(3000)

            soup = BeautifulSoup(
                page.content(),
                "lxml"
            )

        except Exception as e:
            print(f"Failed to parse {url}: {e}")
            browser.close()
            return None

        browser.close()

    text = soup.get_text("\n", strip=True)

    title = soup.find("h1")
    title = title.get_text(strip=True) if title else None

    location = None
    location_match = re.search(
        r"Location\s*Type.*?\n(.*?)\n",
        text,
        re.DOTALL
    )

    if location_match:
        location = location_match.group(1).strip()

    employment_type = None
    match = re.search(
        r"Employment Type\s*:\s*(.+)",
        text
    )

    if match:
        employment_type = match.group(1).strip()

    experience_level = None
    match = re.search(
        r"Career Level\s*:\s*(.+)",
        text
    )

    if match:
        experience_level = match.group(1).strip()

    deadline = None
    match = re.search(
        r"Deadline\s*:\s*([A-Za-z]+\s+\d+\w{2},\s+\d{4})",
        text
    )

    if match:
        try:
            date_string = re.sub(
                r"(st|nd|rd|th)",
                "",
                match.group(1)
            )

            deadline = datetime.strptime(
                date_string,
                "%B %d, %Y"
            ).date()

        except:
            deadline = None

    description = extract_between(
        text,
        "About the Job",
        "About You"
    )

    requirements = extract_between(
        text,
        "About You",
        "Requirement Skill"
    )

    skills = []

    skill_text = extract_between(
        text,
        "Requirement Skill",
        "How To Apply"
    )

    if skill_text:
        skills = [
            s.strip()
            for s in skill_text.splitlines()
            if s.strip()
        ]

    return {
        "title": title,
        "location": location,
        "requirements": requirements,
        "description": description,
        "employment_type": employment_type,
        "experience_level": experience_level,
        "salary": None,
        "category": None,
        "skills": skills,
        "deadline": deadline,
        "posted_at": None,
        "source": "GeezJobs",
        "url": url,
    }