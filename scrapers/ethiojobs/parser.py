import re
from datetime import datetime

from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright


def parse_job(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto(
            url,
            wait_until="networkidle",
            timeout=60000
        )

        page.wait_for_timeout(3000)

        soup = BeautifulSoup(
            page.content(),
            "lxml"
        )

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
        date_string = match.group(1)

        date_string = re.sub(
            r"(st|nd|rd|th)",
            "",
            date_string
        )

        deadline = datetime.strptime(
            date_string,
            "%B %d, %Y"
        ).date()

    description = None
    requirements = None

    if "About the Job" in text:
        parts = text.split("About the Job")

        if len(parts) > 1:
            description = parts[1]

            if "About You" in description:
                description = description.split(
                    "About You"
                )[0]

            description = description.strip()

    if "About You" in text:
        requirements = text.split("About You")[1]

        if "Requirement Skill" in requirements:
            requirements = requirements.split(
                "Requirement Skill"
            )[0]

        requirements = requirements.strip()

    skills = []

    if "Requirement Skill" in text:
        skill_text = text.split(
            "Requirement Skill"
        )[1]

        if "How To Apply" in skill_text:
            skill_text = skill_text.split(
                "How To Apply"
            )[0]

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
        "source": "EthioJobs",
        "url": url,
    }