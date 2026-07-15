import re


async def parse_job(message):
    """
    Parse ETcareers Telegram posts.

    Returns:
        List[dict]
    """

    text = message.text or ""

    base_job = {
        "company": None,
        "title": None,
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
        "source": "ETcareers Telegram",
        "url": None,
    }

    # -----------------------------
    # URL
    # -----------------------------
    url = re.search(r"https?://\S+", text)
    if url:
        base_job["url"] = url.group()

    # -----------------------------
    # Deadline
    # -----------------------------
    deadline = re.search(
        r"Deadline\s*:?\s*(.+)",
        text,
        re.IGNORECASE,
    )

    if deadline:
        base_job["deadline"] = deadline.group(1).strip()

    # -----------------------------
    # Location
    # -----------------------------
    location = re.search(
        r"📍\s*(.+)",
        text
    )

    if location:
        base_job["location"] = location.group(1).strip()

    # -----------------------------
    # Experience
    # -----------------------------
    exp = re.search(
        r"💼\s*(.+)",
        text
    )

    if exp:
        base_job["experience_level"] = exp.group(1).strip()

    # -----------------------------
    # Qualification
    # -----------------------------
    qual = re.search(
        r"🎓\s*(.+)",
        text
    )

    if qual:
        base_job["requirements"] = qual.group(1).strip()

    # -----------------------------
    # Company
    # -----------------------------
    company = None

    for line in text.splitlines():

        line = line.strip()

        if (
            line.startswith("🏦")
            or line.startswith("🏢")
            or line.startswith("🌍")
            or line.startswith("🚀")
            or line.startswith("🏥")
            or line.startswith("📡")
            or line.startswith("🌱")
            or line.startswith("💼")
        ):

            company = (
                line.replace("🏦", "")
                .replace("🏢", "")
                .replace("🌍", "")
                .replace("🚀", "")
                .replace("🏥", "")
                .replace("📡", "")
                .replace("🌱", "")
                .replace("💼", "")
                .replace("is Hiring!", "")
                .strip()
            )

            break

    base_job["company"] = company

    # -----------------------------
    # Positions
    # -----------------------------
    positions = []

    for line in text.splitlines():

        line = line.strip()

        if line.startswith("•"):
            positions.append(line[1:].strip())

        elif re.match(r"^\d️⃣", line):
            line = re.sub(r"^\d️⃣\s*", "", line)
            positions.append(line)

        elif line.startswith("📌"):
            positions.append(
                line.replace("📌", "").strip()
            )

    if not positions:
        positions = ["General Vacancy"]

    jobs = []

    for position in positions:

        job = base_job.copy()

        job["title"] = position

        jobs.append(job)

    return jobs