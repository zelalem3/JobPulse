import re
from urllib.parse import urlparse


# ============================================================
# COMMON TEXT CLEANING
# ============================================================

def clean_text(value):
    """
    General-purpose text cleanup.

    Removes:
    - Markdown emphasis markers
    - Telegram decorative characters
    - excessive whitespace
    """

    if not value:
        return ""

    value = str(value)

    # Remove Markdown emphasis
    value = re.sub(r"\*{1,}", "", value)
    value = re.sub(r"_{1,}", "", value)

    # Remove common Telegram decoration
    value = re.sub(
        r"[★☆⭐✨📌♦️♦✅☑️✔️🔹🔸▪️▫️]",
        " ",
        value,
    )

    # Normalize whitespace
    value = re.sub(r"\s+", " ", value)

    return value.strip()


# ============================================================
# TITLE NORMALIZATION
# ============================================================

TITLE_REPLACEMENTS = {
    r"\bsr\.\b": "senior",
    r"\bsr\b": "senior",
    r"\bjr\.\b": "junior",
    r"\bjr\b": "junior",
}


def normalize_title(title):

    if not title:
        return ""

    title = str(title).strip()

    # --------------------------------------------------------
    # Remove Markdown / Telegram formatting
    # --------------------------------------------------------

    title = re.sub(r"\*+", "", title)

    title = re.sub(
        r"[★☆⭐✨📌♦️♦✅☑️✔️🔹🔸▪️▫️]",
        " ",
        title,
    )

    # --------------------------------------------------------
    # Remove promotional markers
    # --------------------------------------------------------

    title = re.sub(
        r"^\s*#AD\s*",
        "",
        title,
        flags=re.IGNORECASE,
    )

    title = re.sub(
        r"\b#ad\b",
        "",
        title,
        flags=re.IGNORECASE,
    )

    # --------------------------------------------------------
    # Remove Ethiopian experience decorations
    #
    # Examples:
    # {በ0 አመት}
    # {በ1 አመት}
    # {በልምድ}
    # --------------------------------------------------------

    title = re.sub(
        r"\{[^{}]*\}",
        " ",
        title,
    )

    # --------------------------------------------------------
    # Remove bracketed noise
    # --------------------------------------------------------

    title = re.sub(
        r"\([^)]*\)",
        " ",
        title,
    )

    title = re.sub(
        r"\[[^\]]*\]",
        " ",
        title,
    )

    # --------------------------------------------------------
    # Remove urgency / generic vacancy markers
    # --------------------------------------------------------

    title = re.sub(
        r"\b(urgent|urgently needed|vacancy)\b",
        "",
        title,
        flags=re.IGNORECASE,
    )

    # --------------------------------------------------------
    # Remove leading decorative punctuation
    # --------------------------------------------------------

    title = re.sub(
        r"^[\s\-–—:|•·#]+",
        "",
        title,
    )

    # --------------------------------------------------------
    # Normalize whitespace
    # --------------------------------------------------------

    title = re.sub(
        r"\s+",
        " ",
        title,
    ).strip()

    # --------------------------------------------------------
    # Normalize senior / junior abbreviations
    # --------------------------------------------------------

    title = title.lower()

    for pattern, replacement in TITLE_REPLACEMENTS.items():

        title = re.sub(
            pattern,
            replacement,
            title,
            flags=re.IGNORECASE,
        )

    title = re.sub(
        r"\s+",
        " ",
        title,
    ).strip()

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

    # Remove Markdown / Telegram formatting
    company = re.sub(r"\*+", "", company)

    # Remove decorative symbols
    company = re.sub(
        r"[★☆⭐✨📌♦️♦✅☑️✔️🔹🔸▪️▫️]",
        " ",
        company,
    )

    # Remove punctuation
    company = re.sub(
        r"[^\w\s]",
        " ",
        company,
    )

    company = company.lower()

    words = company.split()

    # Remove legal suffixes
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
    "addis ababa": "Addis Ababa",
    "addis ababa ethiopia": "Addis Ababa",

    "adama": "Adama",
    "adama ethiopia": "Adama",

    "hawassa": "Hawassa",
    "hawassa ethiopia": "Hawassa",

    "dire dawa": "Dire Dawa",
    "dire dawa ethiopia": "Dire Dawa",

    "bahir dar": "Bahir Dar",
    "bahir dar ethiopia": "Bahir Dar",

    "mekelle": "Mekelle",
    "mekelle ethiopia": "Mekelle",

    "ethiopia": "Ethiopia",
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
        "fulltime",
        "permanent",
    ],

    "Part-time": [
        "part time",
        "part-time",
        "parttime",
    ],

    "Contract": [
        "contract",
        "contractual",
        "consultancy",
        "consultant",
    ],

    "Internship": [
        "intern",
        "internship",
        "trainee",
        "training program",
    ],

    "Temporary": [
        "temporary",
        "short term",
        "short-term",
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
        "internship",
        "trainee",
    ],

    "Entry": [
        "entry level",
        "entry-level",
        "0 year",
        "0 years",
        "0-1",
        "0 – 1",
        "0 to 1",
        "fresh graduate",
        "fresh graduates",
        "new graduate",
        "graduate trainee",
        "no experience",
        "without experience",
        "በ0 አመት",
        "በ0 ዓመት",
        "ልምድ የሌለው",
    ],

    "Junior": [
        "junior",
        "1 year",
        "1 years",
        "1-2",
        "1 – 2",
        "1 to 2",
        "2 year",
        "2 years",
        "2-3",
        "2 – 3",
        "2 to 3",
    ],

    "Mid": [
        "mid level",
        "mid-level",
        "3 year",
        "3 years",
        "3-4",
        "3 – 4",
        "3 to 4",
        "4 year",
        "4 years",
        "4-5",
        "4 – 5",
        "4 to 5",
        "5 year",
        "5 years",
    ],

    "Senior": [
        "senior",
        "6 year",
        "6 years",
        "7 year",
        "7 years",
        "8 year",
        "8 years",
        "9 year",
        "9 years",
        "10 year",
        "10 years",
    ],

    "Lead": [
        "lead",
        "team lead",
        "principal",
        "chief",
    ],

    "Manager": [
        "manager",
        "management",
        "director",
    ],
}


def normalize_experience_level(value):

    if not value:
        return None

    value = str(value).lower()

    # --------------------------------------------------------
    # Check more specific levels first
    # --------------------------------------------------------

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
        "development",
        "programmer",
        "backend",
        "back end",
        "frontend",
        "front end",
        "full stack",
        "full-stack",
        "web developer",
        "mobile developer",
        "laravel",
        "django",
        "flask",
        "react",
        "next.js",
        "node.js",
        "typescript",
        "javascript",
        "python",
        "java",
        "php",
        "flutter",
    ],

    "Data & AI": [
        "data",
        "data science",
        "data scientist",
        "machine learning",
        "artificial intelligence",
        "ai ",
        " ai",
        "analyst",
        "analytics",
    ],

    "Networking": [
        "network",
        "networking",
        "system administrator",
        "systems administrator",
        "network administrator",
        "network engineer",
    ],

    "Cybersecurity": [
        "security",
        "cybersecurity",
        "cyber security",
        "information security",
        "soc analyst",
    ],

    "Finance": [
        "finance",
        "financial",
        "bank",
        "banking",
        "fintech",
        "microfinance",
        "micro-finance",
        "sacco",
    ],

    "Accounting": [
        "accountant",
        "accounting",
        "auditor",
        "audit",
    ],

    "Marketing": [
        "marketing",
        "digital marketing",
        "social media marketing",
        "brand marketing",
    ],

    "Sales": [
        "sales",
        "business development",
        "business developer",
        "sales representative",
    ],

    "Human Resources": [
        "hr",
        "human resource",
        "human resources",
        "recruitment",
        "recruiter",
        "talent acquisition",
    ],

    "Engineering": [
        "engineer",
        "engineering",
        "electrical engineer",
        "mechanical engineer",
        "civil engineer",
    ],

    "Healthcare": [
        "doctor",
        "nurse",
        "medical",
        "healthcare",
        "health care",
        "clinical",
        "pharmacist",
    ],

    "Education": [
        "teacher",
        "teaching",
        "lecturer",
        "education",
        "school",
        "instructor",
        "trainer",
    ],

    "NGO": [
        "ngo",
        "non-governmental",
        "humanitarian",
        "development organization",
        "international development",
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
                getattr(job, "responsibilities", ""),
            ],
        )
    ).lower()

    # --------------------------------------------------------
    # Category priority
    #
    # More specific categories should be checked before
    # broader categories.
    # --------------------------------------------------------

    category_priority = [
        "Cybersecurity",
        "Data & AI",
        "Software Development",
        "Networking",
        "Engineering",
        "Healthcare",
        "Finance",
        "Accounting",
        "Marketing",
        "Sales",
        "Human Resources",
        "Education",
        "NGO",
    ]

    for category in category_priority:

        keywords = CATEGORY_KEYWORDS.get(
            category,
            [],
        )

        for keyword in keywords:

            if keyword in text:
                return category

    return "Other"


# ============================================================
# SALARY EXTRACTION
# ============================================================

SALARY_REGEX = re.compile(
    r"([\d,]+(?:\.\d+)?)\s*(etb|birr|usd|\$)?",
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
        "depends on experience",
        "depending on experience",
    }:
        return "Negotiable"

    match = SALARY_REGEX.search(value)

    if match:

        amount = match.group(1)

        currency = (
            match.group(2)
            or "ETB"
        )

        if currency == "$":
            currency = "USD"

        return (
            f"{amount} "
            f"{currency.upper()}"
        )

    return value


# ============================================================
# URL NORMALIZATION
# ============================================================

def normalize_url(url):

    if not url:
        return ""

    url = str(url).strip()

    # --------------------------------------------------------
    # Remove Markdown formatting
    # --------------------------------------------------------

    url = url.replace("****", "")
    url = url.replace("**", "")
    url = url.replace("*", "")

    # --------------------------------------------------------
    # Remove wrapping brackets
    # --------------------------------------------------------

    url = url.strip(
        " <>[](){}"
    )

    # --------------------------------------------------------
    # Remove trailing punctuation accidentally captured
    # --------------------------------------------------------

    url = url.rstrip(
        ".,;:!?)]}"
    )

    # --------------------------------------------------------
    # Validate basic URL structure
    # --------------------------------------------------------

    try:

        parsed = urlparse(url)

        if not parsed.scheme or not parsed.netloc:
            return url

    except Exception:
        return url

    return url


# ============================================================
# PROMOTIONAL / NON-JOB DETECTION
# ============================================================

PROMOTIONAL_PATTERNS = [

    r"^\s*#ad\b",

    r"don't miss",
    r"do not miss",

    r"right opportunities",

    r"fully and partially funded",

    r"scholarship",

    r"education opportunities",

    r"study abroad",

    r"join our channel",

    r"subscribe",

]


def is_promotional_title(title):

    if not title:
        return False

    title_lower = title.lower()

    for pattern in PROMOTIONAL_PATTERNS:

        if re.search(
            pattern,
            title_lower,
            flags=re.IGNORECASE,
        ):
            return True

    return False


# ============================================================
# MAIN ENTRY POINT
# ============================================================

def normalize_job(job):

    # --------------------------------------------------------
    # Title
    # --------------------------------------------------------

    job.title = normalize_title(
        job.title
    )

    # --------------------------------------------------------
    # Company
    # --------------------------------------------------------

    job.company = normalize_company(
        job.company
    )

    # --------------------------------------------------------
    # Location
    # --------------------------------------------------------

    job.location = normalize_location(
        job.location
    )

    # --------------------------------------------------------
    # Employment Type
    # --------------------------------------------------------

    job.employment_type = (
        normalize_employment_type(
            job.employment_type
        )
    )

    # --------------------------------------------------------
    # Experience
    # --------------------------------------------------------

    job.experience_level = (
        normalize_experience_level(
            job.experience_level
        )
    )

    # --------------------------------------------------------
    # Salary
    # --------------------------------------------------------

    job.salary = normalize_salary(
        job.salary
    )

    # --------------------------------------------------------
    # URL
    # --------------------------------------------------------

    job.url = normalize_url(
        job.url
    )

    # --------------------------------------------------------
    # Category
    # --------------------------------------------------------

    if not job.category:

        job.category = infer_category(
            job
        )

    return job