import re


# ============================================================
# TITLE NORMALIZATION
# ============================================================

TITLE_REPLACEMENTS = {
    r"\bsr\b": "senior",
    r"\bsr\.\b": "senior",
    r"\bjr\b": "junior",
    r"\bjr\.\b": "junior",
}


def normalize_title(title):
    if not title:
        return ""

    title = str(title).strip()

    # Remove bracketed noise
    title = re.sub(r"\(.*?\)", "", title)

    # Remove urgency markers
    title = re.sub(
        r"\b(urgent|urgently needed|vacancy)\b",
        "",
        title,
        flags=re.IGNORECASE,
    )

    title = title.lower()

    for pattern, replacement in TITLE_REPLACEMENTS.items():
        title = re.sub(
            pattern,
            replacement,
            title,
            flags=re.IGNORECASE,
        )

    title = re.sub(r"\s+", " ", title).strip()

    return title.title()


# ============================================================
# COMPANY NORMALIZATION
# ============================================================

COMPANY_SUFFIXES = [
    "plc",
    "ltd",
    "limited",
    "inc",
    "llc",
    "corp",
    "corporation",
]


def normalize_company(company):
    if not company:
        return ""

    company = str(company).strip()

    company = re.sub(
        r"[^\w\s]",
        " ",
        company,
    )

    company = company.lower()

    words = company.split()

    while words and words[-1] in COMPANY_SUFFIXES:
        words.pop()

    company = " ".join(words)

    company = re.sub(
        r"\s+",
        " ",
        company,
    ).strip()

    return company.title()


# ============================================================
# LOCATION NORMALIZATION
# ============================================================

LOCATION_MAP = {
    "aa": "Addis Ababa",
    "addis": "Addis Ababa",
    "addis ababa ethiopia": "Addis Ababa",
    "adama ethiopia": "Adama",
    "hawassa ethiopia": "Hawassa",
    "dire dawa ethiopia": "Dire Dawa",
}


def normalize_location(location):
    if not location:
        return ""

    location = str(location).strip().lower()

    location = re.sub(
        r"[^\w\s]",
        " ",
        location,
    )

    location = re.sub(
        r"\s+",
        " ",
        location,
    ).strip()

    return LOCATION_MAP.get(
        location,
        location.title(),
    )


# ============================================================
# EMPLOYMENT TYPE
# ============================================================

EMPLOYMENT_PATTERNS = {
    "Full-time": [
        "full time",
        "full-time",
        "permanent",
    ],
    "Part-time": [
        "part time",
        "part-time",
    ],
    "Contract": [
        "contract",
        "consultancy",
    ],
    "Internship": [
        "intern",
        "internship",
    ],
    "Temporary": [
        "temporary",
    ],
}


def normalize_employment_type(value):
    if not value:
        return None

    value = str(value).lower()

    for normalized, patterns in EMPLOYMENT_PATTERNS.items():

        for pattern in patterns:

            if pattern in value:
                return normalized

    return value.title()


# ============================================================
# EXPERIENCE LEVEL
# ============================================================

EXPERIENCE_PATTERNS = {
    "Intern": [
        "intern",
    ],
    "Entry": [
        "entry",
        "0 year",
        "0-1",
        "fresh graduate",
    ],
    "Junior": [
        "junior",
        "1 year",
        "2 year",
    ],
    "Mid": [
        "mid",
        "3 year",
        "4 year",
        "5 year",
    ],
    "Senior": [
        "senior",
        "6 year",
        "7 year",
        "8 year",
    ],
    "Lead": [
        "lead",
        "principal",
    ],
    "Manager": [
        "manager",
    ],
}


def normalize_experience_level(value):
    if not value:
        return None

    value = str(value).lower()

    for normalized, patterns in EXPERIENCE_PATTERNS.items():

        for pattern in patterns:

            if pattern in value:
                return normalized

    return value.title()


# ============================================================
# CATEGORY
# ============================================================

CATEGORY_KEYWORDS = {
    "Software Development": [
        "software",
        "developer",
        "backend",
        "frontend",
        "full stack",
        "laravel",
        "react",
        "python",
    ],
    "Data & AI": [
        "data",
        "machine learning",
        "ai",
        "analyst",
    ],
    "Networking": [
        "network",
        "system administrator",
    ],
    "Cybersecurity": [
        "security",
        "cyber",
    ],
    "Finance": [
        "finance",
        "financial",
    ],
    "Accounting": [
        "accountant",
        "accounting",
        "auditor",
    ],
    "Marketing": [
        "marketing",
        "digital marketing",
    ],
    "Sales": [
        "sales",
        "business development",
    ],
    "Human Resources": [
        "hr",
        "human resource",
        "recruitment",
    ],
    "NGO": [
        "ngo",
        "humanitarian",
        "development",
    ],
}


def infer_category(job):
    text = " ".join(
        filter(
            None,
            [
                getattr(job, "title", ""),
                getattr(job, "description", ""),
                getattr(job, "requirements", ""),
            ],
        )
    ).lower()

    for category, keywords in CATEGORY_KEYWORDS.items():

        for keyword in keywords:

            if keyword in text:
                return category

    return "Other"


# ============================================================
# SALARY EXTRACTION
# ============================================================

SALARY_REGEX = re.compile(
    r"([\d,]+)\s*(etb|birr|usd)?",
    re.IGNORECASE,
)


def normalize_salary(value):
    if not value:
        return "Negotiable"

    value = str(value).strip()

    if value.lower() in {
        "competitive",
        "negotiable",
        "attractive",
    }:
        return "Negotiable"

    match = SALARY_REGEX.search(value)

    if match:
        amount = match.group(1)
        currency = match.group(2) or "ETB"

        return f"{amount} {currency.upper()}"

    return value


# ============================================================
# MAIN ENTRY POINT
# ============================================================

def normalize_job(job):

    job.title = normalize_title(
        job.title
    )

    job.company = normalize_company(
        job.company
    )

    job.location = normalize_location(
        job.location
    )

    job.employment_type = (
        normalize_employment_type(
            job.employment_type
        )
    )

    job.experience_level = (
        normalize_experience_level(
            job.experience_level
        )
    )

    job.salary = normalize_salary(
        job.salary
    )

    if not job.category:
        job.category = infer_category(
            job
        )

    return job