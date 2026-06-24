import re


async def parse_job(message):
    """
    message: Telethon Message object
    """

    text = message.text or ""

    job = {
        "title": None,
        "company": None,
        "location": None,
        "requirements": None,
        "description": None,
        "url": None,
        "source": "Telegram",
    }


    title_match = re.search(
        r"\*\*(.*?)\*\*",
        text,
        re.DOTALL
    )

    if title_match:
        job["title"] = title_match.group(1).strip()

    company_match = re.search(
        r"Company:\s*\*\*(.*?)\*\*",
        text
    )

    if company_match:
        job["company"] = company_match.group(1).strip()


    deadline_match = re.search(
        r"Deadline:\s*\*\*(.*?)\*\*",
        text
    )

    if deadline_match:
        job["requirements"] = (
            f"Deadline: {deadline_match.group(1).strip()}"
        )


    url_match = re.search(
        r"\((https?://.*?)\)",
        text
    )

    if url_match:
        job["url"] = url_match.group(1)


    lines = text.split("\n")

    description_lines = []

    skip_prefixes = [
        "Company:",
        "Deadline:",
        "#",
        "@"
    ]

    for line in lines:
        line = line.strip()

        if not line:
            continue

        if any(
            line.startswith(prefix)
            for prefix in skip_prefixes
        ):
            continue

        if line.startswith("**"):
            continue

        if "View on source" in line:
            continue

        description_lines.append(line)

    job["description"] = "\n".join(
        description_lines
    ).strip()

    return job