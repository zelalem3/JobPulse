import re


async def parse_job(message):
    """
    Parse Embassy & NGO Jobs Telegram message.
    """

    text = message.text or ""

    job = {
        "title": None,
        "company": None,
        "location": None,
        "requirements": None,
        "description": text,
        "employment_type": None,
        "experience_level": None,
        "salary": None,
        "category": None,
        "skills": [],
        "deadline": None,
        "posted_at": message.date,
        "source": "Telegram - Embassy & NGO Jobs",
        "url": None,
    }

    # -----------------------------
    # URL
    # -----------------------------
    url = re.search(r"https?://\S+", text)
    if url:
        job["url"] = url.group()

    # -----------------------------
    # Deadline
    # -----------------------------
    deadline = re.search(
        r"(Deadline|Closing Date)\s*:\s*(.+)",
        text,
        re.IGNORECASE,
    )

    if deadline:
        job["deadline"] = deadline.group(2).strip()

    # -----------------------------
    # Location
    # -----------------------------
    location = re.search(
        r"Location\s*:?\s*(.+)",
        text,
        re.IGNORECASE,
    )

    if location:
        job["location"] = location.group(1).strip()

    # -----------------------------
    # Qualification
    # -----------------------------
    qualification = re.search(
        r"Qualification\s*:?\s*(.+?)(?:Experience|Salary|Location|How to Apply|🌀|🌐|🔻)",
        text,
        re.IGNORECASE | re.DOTALL,
    )

    if qualification:
        job["requirements"] = " ".join(
            qualification.group(1).split()
        )

    # -----------------------------
    # Experience
    # -----------------------------
    experience = re.search(
        r"Experience\s*:?\s*(.+?)(?:Location|Salary|How to Apply|🌀|🌐)",
        text,
        re.IGNORECASE | re.DOTALL,
    )

    if experience:
        job["experience_level"] = " ".join(
            experience.group(1).split()
        )

    # -----------------------------
    # Positions
    # -----------------------------
    positions = re.findall(
        r"Position\s*\d*\s*:?\s*(.+)",
        text,
        re.IGNORECASE,
    )

    if positions:
        job["title"] = positions[0].strip()

    # -----------------------------
    # Company
    # -----------------------------
    company = None

    for line in text.splitlines():

        line = line.strip()

        if "አዲስ የስራ ማስታወቂያ" in line:
            company = (
                line.replace("★", "")
                .replace("⭐️", "")
                .replace("🔽", "")
                .replace("✔️", "")
                .replace("✔", "")
                .replace("አዲስ የስራ ማስታወቂያ", "")
                .strip()
            )
            break

    job["company"] = company

    return job