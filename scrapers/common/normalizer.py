import re
from urllib.parse import urlparse
import json
from pathlib import Path

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

INVALID_COMPANY_NAMES = {
    "position",
    "positions",
    "available positions",
    "vacancies",
    "full time",
    "part time",
    "employment type",
    "employment type full time",
    "experience",
    "management",
    "education",
    "engineering",
    "customer service",
    "sales",
    "sales and marketing",
    "human resource and recruitment",
    "private company",
    "private client",
    "not specified",
    "all",
}

COMPANY_ALIAS_PATH = (
    Path(__file__).resolve().parent / "company_aliases.json"
)

with open(COMPANY_ALIAS_PATH, "r", encoding="utf-8") as f:
    COMPANY_ALIASES = json.load(f)


# Build alias -> canonical name
COMPANY_ALIAS_MAP = {}

for canonical, aliases in COMPANY_ALIASES.items():

    COMPANY_ALIAS_MAP[canonical.lower()] = canonical

    for alias in aliases:
        COMPANY_ALIAS_MAP[alias.lower()] = canonical


# ============================================================
# LEGAL SUFFIXES
# ============================================================

COMPANY_SUFFIXES = {
    "plc",
    "p.l.c",
    "p l c",
    "ltd",
    "limited",
    "inc",
    "incorporated",
    "llc",
    "corp",
    "corporation",
    "s c",
    "s.c",
    "share company",
}


# ============================================================
# COMPANY NOISE
# ============================================================

COMPANY_PREFIX_PATTERNS = [

    r"^\s*job\s+vacanc(?:y|ies)\s+(?:at|for)\s+",

    r"^\s*job\s+opportunities\s+(?:at|with|for)\s+",

    r"^\s*jobs?\s+(?:at|with|for)\s+",

    r"^\s*careers?\s+(?:at|with|for)\s+",

    r"^\s*employment\s+(?:opportunit(?:y|ies))?\s*(?:at|with|for)\s+",

    r"^\s*vacanc(?:y|ies)\s+(?:at|for)\s+",

    r"^\s*position\s+(?:at|with|for)\s+",

    r"^\s*hiring\s+(?:at|with|for)\s+",

    r"^\s*company\s*:\s*",

    r"^\s*organization\s*:\s*",

]


COMPANY_NOISE_PATTERNS = [

    r"\s+job\s+vacanc(?:y|ies).*$",

    r"\s+job\s+opportunit(?:y|ies).*$",

    r"\s+career\s+opportunit(?:y|ies).*$",

    r"\s+is\s+hiring.*$",

    r"\s+is\s+inviting.*$",

    r"\s+invites?\s+qualified.*$",

    r"\s+is\s+looking\s+for.*$",

    r"\s+announces?.*$",

    r"\s+recruiting.*$",

]


# ====================================================
# CHECK IF JOB IS INVALID
# =====================================================
def is_invalid_company(company):

    normalized = normalize_company(company)

    return normalized in INVALID_COMPANY_NAMES


# ============================================================
# CLEAN COMPANY TEXT
# ============================================================

def clean_company_text(company):
    if not company:
        return ""

    company = str(company).strip()

    # --------------------------------------------------------
    # Remove Markdown / Telegram formatting
    # --------------------------------------------------------
    company = re.sub(r"[*_~`]+", "", company)

    # --------------------------------------------------------
    # Remove decorative symbols
    # --------------------------------------------------------
    company = re.sub(
        r"[★☆⭐✨📌♦️♦✅☑️✔️🔹🔸▪️▫️]",
        " ",
        company,
    )

    # --------------------------------------------------------
    # Normalize whitespace
    # --------------------------------------------------------
    company = re.sub(r"\s+", " ", company)

    return company.strip()

# ============================================================
# MAIN COMPANY NORMALIZER
# ============================================================

def normalize_company(company, default="Unknown"):
    """
    Clean, strip noise, match aliases, and normalize company names.
    """
    if not company:
        return default

    original = str(company)

    # --------------------------------------------------------
    # 1. Basic text cleanup (symbols, markdown, extra spaces)
    # --------------------------------------------------------
    cleaned = clean_company_text(original)
    if not cleaned:
        return default

    text_lower = cleaned.lower()

    # --------------------------------------------------------
    # 2. Check exact or alias map match first
    # --------------------------------------------------------
    if text_lower in COMPANY_ALIAS_MAP:
        return COMPANY_ALIAS_MAP[text_lower]

    # --------------------------------------------------------
    # 3. Strip prefix noise patterns (e.g., "Job vacancy at...")
    # --------------------------------------------------------
    for pattern in COMPANY_PREFIX_PATTERNS:
        text_lower = re.sub(pattern, "", text_lower, flags=re.IGNORECASE)
        cleaned = re.sub(pattern, "", cleaned, flags=re.IGNORECASE)

    # --------------------------------------------------------
    # 4. Strip suffix noise patterns (e.g., "...is hiring")
    # --------------------------------------------------------
    for pattern in COMPANY_NOISE_PATTERNS:
        text_lower = re.sub(pattern, "", text_lower, flags=re.IGNORECASE)
        cleaned = re.sub(pattern, "", cleaned, flags=re.IGNORECASE)

    cleaned = cleaned.strip()
    text_lower = cleaned.lower()

    # Check alias map again after stripping prefix/suffix noise
    if text_lower in COMPANY_ALIAS_MAP:
        return COMPANY_ALIAS_MAP[text_lower]

    # --------------------------------------------------------
    # 5. Clean and format legal suffixes if present
    # --------------------------------------------------------
    words = cleaned.split()
    if words:
        # Title case standard company names
        formatted = " ".join(w.capitalize() for w in words)
        return formatted

    return default

# ============================================================
# LOCATION NORMALIZATION
# ============================================================

LOCATION_CONFIG_PATH = (
    Path(__file__).resolve().parent / "location_alias.json"
)


with open(LOCATION_CONFIG_PATH, "r", encoding="utf-8") as f:
    LOCATION_CONFIG = json.load(f)




LOCATION_MAP = {}

for city, aliases in LOCATION_CONFIG["mappings"].items():
    for alias in aliases:
        LOCATION_MAP[alias.lower()] = city




for city in LOCATION_CONFIG["mappings"]:
    LOCATION_MAP[city.lower()] = city


# ============================================================
# NORMALIZATION HELPERS
# ============================================================

def clean_location(location):
    """
    Basic text normalization.

    Example:
        "Bole, Addis-Ababa, Ethiopia"
        ->
        "bole addis ababa ethiopia"
    """

    if not location:
        return ""

    location = str(location).strip().lower()

    # Replace punctuation with spaces
    location = re.sub(r"[^\w\s]", " ", location)

    # Collapse whitespace
    location = re.sub(r"\s+", " ", location)

    return location.strip()


def remove_noise(location):
    """
    Remove generic location labels.

    Example:
        "Work Location: Bole"
        ->
        "bole"
    """

    for pattern in LOCATION_CONFIG.get("noise_patterns", []):
        location = re.sub(
            pattern,
            " ",
            location,
            flags=re.IGNORECASE,
        )

    location = re.sub(r"\s+", " ", location)

    return location.strip()


def remove_country(location):
    """
    Ethiopia is not useful once we know the city.

    Example:
        "bole ethiopia"
        ->
        "bole"
    """

    location = re.sub(
        r"\beth{i}opia\b",
        " ",
        location,
        flags=re.IGNORECASE,
    )

    location = re.sub(r"\s+", " ", location)

    return location.strip()


def collapse_duplicate_phrases(location):
    """
    Removes repeated location phrases.

    Examples:

        "addis ababa addis ababa"
            ->
        "addis ababa"

        "bole bole"
            ->
        "bole"
    """

    words = location.split()

    if not words:
        return ""

    # Look for repeated halves/phrases.
    for size in range(len(words) // 2, 0, -1):

        first = words[:size]
        second = words[size:size * 2]

        if first == second:
            remaining = words[size * 2:]

            location = first + remaining
            words = location

    return " ".join(words)


# ============================================================
# FIND LOCATION ALIASES
# ============================================================

def find_location_aliases(location):
    """
    Find known cities/neighborhoods inside the text.

    Returns:
        [
            ("addis ababa", "Addis Ababa"),
            ("bole", "Addis Ababa"),
        ]

    Longer aliases are preferred.
    """

    matches = []

    for alias, city in LOCATION_MAP.items():

        pattern = rf"\b{re.escape(alias)}\b"

        if re.search(pattern, location):
            matches.append(
                (alias, city)
            )

    # Longest aliases first.
    matches.sort(
        key=lambda item: len(item[0]),
        reverse=True,
    )

    return matches


# ============================================================
# MAIN NORMALIZER
# ============================================================

def normalize_location(location, default="Addis Ababa"):
    """
    Normalize a scraped job location while preserving
    useful neighborhood information.

    Examples:

        Bole
            -> Bole, Addis Ababa


        Bole, Addis Ababa
            -> Bole, Addis Ababa

        Addis Ababa Ethiopia
            -> Addis Ababa

        addis ababa addis ababa
            -> Addis Ababa

        Nazret
            -> Adama

        Awasa
            -> Hawassa
    """

    if not location:
        return default

    original = str(location)

    # --------------------------------------------------------
    # Clean
    # --------------------------------------------------------

    location = clean_location(original)

    if not location:
        return default

    # --------------------------------------------------------
    # Remove noise
    # --------------------------------------------------------

    location = remove_noise(location)

    # --------------------------------------------------------
    # Remove Ethiopia
    # --------------------------------------------------------

    location = remove_country(location)

    # --------------------------------------------------------
    # Collapse duplicated phrases
    # --------------------------------------------------------

    location = collapse_duplicate_phrases(location)

    if not location:
        return default

    # --------------------------------------------------------
    # Find known aliases
    # --------------------------------------------------------

    matches = find_location_aliases(location)

    if not matches:
        return default

    # --------------------------------------------------------
    # Determine city
    # --------------------------------------------------------

    cities = []

    for alias, city in matches:
        if city not in cities:
            cities.append(city)

    # Prefer the first/longest recognized city.
    city = cities[0]

    # --------------------------------------------------------
    # Determine whether a neighborhood exists
    # --------------------------------------------------------

    neighborhoods = []

    for alias, alias_city in matches:

        # If the alias itself is the city,
        # it isn't a neighborhood.
        if alias == alias_city.lower():
            continue

        # Only preserve aliases belonging to the
        # detected city.
        if alias_city != city:
            continue

        neighborhoods.append(alias)

    # --------------------------------------------------------
    # If neighborhood exists, preserve it.
    # --------------------------------------------------------

    if neighborhoods:

        # Longest/specific neighborhood first.
        neighborhood = neighborhoods[0]

        return f"{neighborhood.title()}, {city}"

    # --------------------------------------------------------
    # Otherwise return city only.
    # --------------------------------------------------------

    return city

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

# Fixed list users can filter by
CANONICAL_CATEGORIES = [
    "Software Development",
    "Data & AI",
    "Cybersecurity",
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
    "Customer Service",
    "Logistics",
    "Legal",
    "Administration",
    "Other",
]

# Map messy source labels → canonical (Expanded for tech/CS/SE variations)
CATEGORY_ALIASES = {
    "it": "Software Development",
    "ict": "Software Development",
    "it & telecom": "Software Development",
    "information technology": "Software Development",
    "information systems": "Software Development",
    "computer science": "Software Development",
    "software engineering": "Software Development",
    "software": "Software Development",
    "tech": "Software Development",
    "technology": "Software Development",
    "computer": "Software Development",
    "general": None,  # force re-infer
    "other": None,
    "healthcare": "Healthcare",
    "health": "Healthcare",
    "medical": "Healthcare",
    "finance": "Finance",
    "banking": "Finance",
    "accounting": "Accounting",
    "marketing": "Marketing",
    "sales": "Sales",
    "hr": "Human Resources",
    "human resources": "Human Resources",
    "education": "Education",
    "ngo": "NGO",
    "non profit": "NGO",
    "nonprofit": "NGO",
    "customer service": "Customer Service",
    "logistics": "Logistics",
    "legal": "Legal",
    "admin": "Administration",
    "administration": "Administration",
}

# Broadened and expanded keywords for high-accuracy identification
CATEGORY_KEYWORDS = {
    "Software Development": [
        "software engineer", "software developer", "software engineering",
        "computer scientist", "computer science", "programmer", "coding",
        "web developer", "mobile developer", "full stack", "full-stack", "fullstack",
        "backend", "back-end", "front end", "frontend", "front-end",
        "laravel", "django", "react", "node.js", "angular", "vue", "flutter",
        "react native", "android developer", "ios developer", "python developer",
        "java developer", "php developer", ".net developer", "c++ developer",
        "devops", "site reliability", "sre", "qa engineer", "quality assurance",
        "test engineer", "systems analyst", "system analyst", "it support",
        "it specialist", "it officer", "information technology", "tech support",
        "software architect", "application developer"
    ],
    "Data & AI": [
        "data scientist", "data engineer", "data analyst", "machine learning",
        "artificial intelligence", "ml engineer", "ai engineer", "deep learning",
        "business intelligence", "power bi", "tableau", "data science", "big data",
        "nlp", "computer vision", "analytics engineer"
    ],
    "Cybersecurity": [
        "cybersecurity", "cyber security", "information security", "infosec",
        "soc analyst", "penetration test", "pentester", "security engineer",
        "security analyst", "cyber threat", "vulnerability assessor"
    ],
    "Networking": [
        "network engineer", "network administrator", "system administrator",
        "systems administrator", "network admin", "sysadmin", "infrastructure engineer",
        "network specialist", "cloud architect", "cloud engineer"
    ],
    "Engineering": [
        "civil engineer", "mechanical engineer", "electrical engineer",
        "construction engineer", "site engineer", "chemical engineer",
        "structural engineer", "industrial engineer"
    ],
    "Healthcare": [
        "nurse", "doctor", "physician", "pharmacist", "clinical",
        "healthcare", "health care", "medical officer", "midwife",
        "surgeon", "dentist", "public health", "biomedical"
    ],
    "Finance": [
        "finance", "financial analyst", "banker", "banking", "fintech",
        "microfinance", "loan officer", "treasury", "investment analyst",
        "risk manager", "portfolio manager"
    ],
    "Accounting": [
        "accountant", "accounting", "auditor", "audit", "bookkeeper",
        "financial controller", "tax accountant", "cpa"
    ],
    "Marketing": [
        "marketing", "digital marketing", "brand manager", "seo",
        "social media manager", "content marketing", "growth marketer",
        "copywriter", "public relations", "communications officer"
    ],
    "Sales": [
        "sales", "business development", "account manager",
        "sales representative", "sales executive", "account executive",
        "channel partner", "telesales"
    ],
    "Human Resources": [
        "human resource", "human resources", "recruitment", "recruiter",
        "talent acquisition", "hr manager", "hr officer", "people operations",
        "compensation and benefits"
    ],
    "Education": [
        "teacher", "lecturer", "instructor", "trainer", "principal",
        "education officer", "tutor", "professor", "academic coordinator"
    ],
    "NGO": [
        "ngo", "non-governmental", "humanitarian", "project officer",
        "program officer", "international development", "community mobilizer",
        "grant writer", "civil society"
    ],
    "Customer Service": [
        "customer service", "call center", "customer support",
        "help desk", "client service", "customer success", "support specialist"
    ],
    "Logistics": [
        "logistics", "supply chain", "warehouse", "procurement",
        "fleet", "transport", "shipping", "inventory manager", "purchasing"
    ],
    "Legal": [
        "lawyer", "legal officer", "attorney", "legal advisor", "counsel",
        "paralegal", "compliance officer"
    ],
    "Administration": [
        "administrative", "office administrator", "executive assistant",
        "secretary", "office manager", "admin assistant", "receptionist",
        "front desk"
    ],
}

# Priority order for disambiguation
CATEGORY_PRIORITY = [
    "Cybersecurity",
    "Data & AI",
    "Software Development",
    "Networking",
    "Engineering",
    "Healthcare",
    "Legal",
    "Accounting",
    "Finance",
    "Marketing",
    "Sales",
    "Human Resources",
    "Education",
    "NGO",
    "Customer Service",
    "Logistics",
    "Administration",
]


def _contains_phrase(text: str, phrase: str) -> bool:
    """Robust word-boundary match that handles internal dots/symbols correctly."""
    phrase = phrase.lower().strip()
    # Using \b handles word boundaries securely while supporting dots/symbols (like node.js)
    pattern = r"\b" + re.escape(phrase) + r"\b"
    return re.search(pattern, text) is not None


def normalize_category(value: str | None) -> str | None:
    """Map source labels into canonical categories, or None to re-infer."""
    if not value:
        return None
    key = str(value).strip().lower()
    if key in CATEGORY_ALIASES:
        return CATEGORY_ALIASES[key]
    # Already canonical?
    for cat in CANONICAL_CATEGORIES:
        if cat.lower() == key:
            return cat
    return None  # unknown → let inference decide


def infer_category(job) -> str:
    title = (getattr(job, "title", "") or "").lower()
    body = " ".join(
        filter(
            None,
            [
                getattr(job, "description", "") or "",
                getattr(job, "requirements", "") or "",
                getattr(job, "responsibilities", "") or "",
            ],
        )
    ).lower()

    # 1) Title matches first (highest signal)
    for category in CATEGORY_PRIORITY:
        for keyword in CATEGORY_KEYWORDS.get(category, []):
            if _contains_phrase(title, keyword):
                return category

    # 2) Then body
    for category in CATEGORY_PRIORITY:
        for keyword in CATEGORY_KEYWORDS.get(category, []):
            if _contains_phrase(body, keyword):
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

    mapped = normalize_category(getattr(job, "category", None))
    if mapped:
        job.category = mapped
    else:
        job.category = infer_category(job)

    return job

