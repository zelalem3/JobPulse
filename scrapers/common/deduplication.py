import hashlib
import re
import json
from difflib import SequenceMatcher
from urllib.parse import (
    urlparse,
    urlunparse,
    parse_qsl,
    urlencode,
)
from pathlib import Path
import psycopg2
from dataclasses import dataclass

@dataclass(frozen=True)
class DedupData:
    url: str
    title: str
    company: str
    location: str
    deadline: str
    description: str
    requirements: str
    responsibilities: str
    dedup_hash: str


seen_url = set()
seen_hashes = set()


# ============================================================
# Configuration
# ============================================================

TRACKING_PARAMS = {
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "fbclid",
    "gclid",
}

# Words that often differ between sources but don't change
# the identity of a job.
GENERIC_TITLE_WORDS = {
    "job",
    "vacancy",
    "position",
    "opening",
    "opportunity",
    "required",
    "wanted",
}

# Common company suffixes that can cause minor differences.
COMPANY_SUFFIXES = {
    "plc",
    "p l c",
    "share",
    "company",
    "co",
    "ltd",
    "limited",
    "corporation",
    "corp",
    "inc",
}


# ============================================================
# Generic object helpers
# ============================================================

def get_value(job, field, default=""):
    """
    Safely retrieve a field from either:

        JobListing(...)
        or
        dict

    This keeps the deduplication code compatible with your
    Pydantic JobListing model.
    """

    if job is None:
        return default

    if isinstance(job, dict):
        return job.get(field, default)

    return getattr(job, field, default)


# ============================================================
# Text normalization
# ============================================================

def normalize_text(value):
    """
    General text normalization.

    Example:

        "Software Engineer!!!"
        "software-engineer"

    become approximately:

        "software engineer"
    """

    if value is None:
        return ""

    value = str(value).lower().strip()

    if not value:
        return ""

    # Normalize ampersands
    value = value.replace("&", " and ")

    # Remove URLs
    value = re.sub(
        r"https?://\S+",
        " ",
        value,
    )

    # Normalize common separators
    value = value.replace("_", " ")
    value = value.replace("-", " ")

    # Remove punctuation
    value = re.sub(
        r"[^\w\s]",
        " ",
        value,
    )

    # Normalize whitespace
    value = re.sub(
        r"\s+",
        " ",
        value,
    )

    return value.strip()


def normalize_title(value):
    """
    More aggressive title normalization.
    """

    value = normalize_text(value)

    if not value:
        return ""

    words = value.split()

    words = [
        word
        for word in words
        if word not in GENERIC_TITLE_WORDS
    ]

    return " ".join(words)


def normalize_company(value):
    """
    Normalize company names.
    """

    value = normalize_text(value)

    if not value:
        return ""

    words = value.split()

    # Remove common company suffixes
    words = [
        word
        for word in words
        if word not in COMPANY_SUFFIXES
    ]

    return " ".join(words)


def load_location_config(filepath=None):
    if filepath is None:
        
        filepath = Path(__file__).resolve().parent / "location.json"
        
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

CONFIG = load_location_config()

def normalize_location(value):
    """
    Normalize location strings using an external configuration map.
    """
    if not value:
        return ""

    # 1. Basic text normalization
    value = value.lower().strip()
    value = re.sub(r'\s+', ' ', value)


    for pattern in CONFIG["noise_patterns"]:
        value = re.sub(pattern, ' ', value)
    
    value = re.sub(r'\s+', ' ', value).strip()


    for standard_location, variations in CONFIG["mappings"].items():
        for variant in variations:
        
            if re.search(r'\b' + re.escape(variant) + r'\b', value):
                return standard_location

  
    return value

# ============================================================
# Job field normalization
# ============================================================

def normalized_title(job):
    return normalize_title(
        get_value(job, "title")
    )


def normalized_company(job):
    return normalize_company(
        get_value(job, "company")
    )


def normalized_location(job):
    return normalize_location(
        get_value(job, "location")
    )


def normalized_description(job):
    return normalize_text(
        get_value(job, "description")
    )


def normalized_requirements(job):
    return normalize_text(
        get_value(job, "requirements")
    )


def normalized_responsibilities(job):
    return normalize_text(
        get_value(job, "responsibilities")
    )


# ============================================================
# URL normalization
# ============================================================

def normalize_url(url):
    """
    Normalize URLs and remove tracking parameters.

    Example:

    https://example.com/job/123?utm_source=telegram

    becomes:

    https://example.com/job/123
    """

    if not url:
        return ""

    try:
        parsed = urlparse(
            str(url).strip()
        )

        query = [
            (key, value)
            for key, value in parse_qsl(
                parsed.query,
                keep_blank_values=True,
            )
            if key.lower() not in TRACKING_PARAMS
        ]

        normalized = parsed._replace(
            query=urlencode(query),
            fragment="",
        )

        result = urlunparse(normalized)

        # Normalize scheme and hostname
        result = result.lower().strip()

        # Remove trailing slash
        result = result.rstrip("/")

        return result

    except Exception:
        return (
            str(url)
            .strip()
            .lower()
            .rstrip("/")
        )


# ============================================================
# Deadline helpers
# ============================================================

def normalize_deadline(deadline):
    """
    Convert deadline to YYYY-MM-DD.

    Handles:

        datetime
        date
        string
    """

    if not deadline:
        return ""

    try:
        return deadline.strftime(
            "%Y-%m-%d"
        )
    except AttributeError:
        return str(deadline)[:10]


def get_deadline(job):
    return get_value(
        job,
        "deadline",
        None,
    )


def same_deadline(job1, job2):
    """
    Returns:

        True  -> same deadline
        False -> different deadlines
        None  -> one/both deadlines missing
    """

    deadline1 = normalize_deadline(
        get_deadline(job1)
    )

    deadline2 = normalize_deadline(
        get_deadline(job2)
    )

    if not deadline1 or not deadline2:
        return None

    return deadline1 == deadline2


# ============================================================
# Similarity
# ============================================================

def text_similarity(text1, text2):
    """
    Returns similarity from 0.0 to 1.0.
    """

    if not text1 or not text2:
        return 0.0

    return SequenceMatcher(
        None,
        text1,
        text2,
    ).ratio()


def token_similarity(text1, text2):
    """
    Compare based on unique words.

    This is useful when the same description has
    different sentence ordering.
    """

    if not text1 or not text2:
        return 0.0

    tokens1 = set(text1.split())
    tokens2 = set(text2.split())

    if not tokens1 or not tokens2:
        return 0.0

    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)

    if not union:
        return 0.0

    return len(intersection) / len(union)


# ============================================================
# Exact URL comparison
# ============================================================

def same_url(job1, job2):
    url1 = normalize_url(
        get_value(job1, "url")
    )

    url2 = normalize_url(
        get_value(job2, "url")
    )

    return bool(
        url1
        and url2
        and url1 == url2
    )


# ============================================================
# Fingerprint
# ============================================================

def generate_dedup_hash(job):
    """
    Generate a stable hash representing the job.

    IMPORTANT:

    We deliberately do NOT include:
        source
        URL

    because the same vacancy can appear on multiple
    websites and Telegram channels.
    """

    title = normalized_title(job)

    company = normalized_company(job)

    location = normalized_location(job)

    deadline = normalize_deadline(
        get_deadline(job)
    )

    description = normalized_description(job)

    requirements = normalized_requirements(job)

    responsibilities = normalized_responsibilities(job)

    # Use meaningful content but don't make the hash
    # dependent on the entire description.
    description_part = description[:2000]

    requirements_part = requirements[:1000]

    responsibilities_part = responsibilities[:1000]

    raw = "|".join([
        title,
        company,
        location,
        deadline,
        description_part,
        requirements_part,
        responsibilities_part,
    ])

    return hashlib.sha256(
        raw.encode("utf-8")
    ).hexdigest()

# ------------------------------------------
#  Normalization
# ------------------------------------------
def prepare_dedup_data(job):
    """
    Precompute all normalized fields used by deduplication.

    This prevents repeatedly normalizing the same job during
    fuzzy duplicate comparisons.
    """

    url = normalize_url(
        get_value(job, "url")
    )

    title = normalized_title(job)

    company = normalized_company(job)

    location = normalized_location(job)

    deadline = normalize_deadline(
        get_deadline(job)
    )

    description = normalized_description(job)

    requirements = normalized_requirements(job)

    responsibilities = normalized_responsibilities(job)

    raw = "|".join([
        title,
        company,
        location,
        deadline,
        description[:2000],
        requirements[:1000],
        responsibilities[:1000],
    ])

    dedup_hash = hashlib.sha256(
        raw.encode("utf-8")
    ).hexdigest()

    return DedupData(
        url=url,
        title=title,
        company=company,
        location=location,
        deadline=deadline,
        description=description,
        requirements=requirements,
        responsibilities=responsibilities,
        dedup_hash=dedup_hash,
    )


# ============================================================
# Strong identity checks
# ============================================================

def same_title_company_location(
    job1,
    job2,
):
    title1 = normalized_title(job1)
    title2 = normalized_title(job2)

    company1 = normalized_company(job1)
    company2 = normalized_company(job2)

    location1 = normalized_location(job1)
    location2 = normalized_location(job2)

    if not title1 or not title2:
        return False

    if not company1 or not company2:
        return False

    title_score = text_similarity(
        title1,
        title2,
    )

    company_score = text_similarity(
        company1,
        company2,
    )

    location_score = text_similarity(
        location1,
        location2,
    )

    return (
        title_score >= 0.95
        and company_score >= 0.95
        and location_score >= 0.90
    )


# ============================================================
# Main duplicate detector
# ============================================================

def is_probable_duplicate(job1, job2):
    """
    Determine whether job1 and job2 probably represent
    the same vacancy.

    Uses precomputed DedupData when available.
    """

    data1 = (
        job1
        if isinstance(job1, DedupData)
        else prepare_dedup_data(job1)
    )

    data2 = (
        job2
        if isinstance(job2, DedupData)
        else prepare_dedup_data(job2)
    )

    # --------------------------------------------------------
    # LEVEL 1
    # Exact normalized URL
    # --------------------------------------------------------

    if (
        data1.url
        and data2.url
        and data1.url == data2.url
    ):
        return True

    # --------------------------------------------------------
    # We need title + company
    # --------------------------------------------------------

    if not data1.title or not data2.title:
        return False

    if not data1.company or not data2.company:
        return False

    # --------------------------------------------------------
    # Similarity scores
    # --------------------------------------------------------

    title_score = text_similarity(
        data1.title,
        data2.title,
    )

    company_score = text_similarity(
        data1.company,
        data2.company,
    )

    location_score = text_similarity(
        data1.location,
        data2.location,
    )

    # --------------------------------------------------------
    # Deadline
    # --------------------------------------------------------

    if (
        data1.deadline
        and data2.deadline
        and data1.deadline != data2.deadline
    ):
        return False

    # --------------------------------------------------------
    # LEVEL 2
    # Strong title + company + location
    # --------------------------------------------------------

    if (
        title_score >= 0.95
        and company_score >= 0.95
        and location_score >= 0.90
    ):
        return True

    # --------------------------------------------------------
    # LEVEL 3
    # Title + company + description
    # --------------------------------------------------------

    if (
        title_score >= 0.90
        and company_score >= 0.90
        and data1.description
        and data2.description
    ):

        description_score = text_similarity(
            data1.description[:5000],
            data2.description[:5000],
        )

        token_score = token_similarity(
            data1.description[:5000],
            data2.description[:5000],
        )

        if (
            description_score >= 0.85
            or token_score >= 0.80
        ):
            return True

    # --------------------------------------------------------
    # LEVEL 4
    # Title + company + requirements
    # --------------------------------------------------------

    if (
        title_score >= 0.90
        and company_score >= 0.90
        and data1.requirements
        and data2.requirements
    ):

        requirements_score = text_similarity(
            data1.requirements[:5000],
            data2.requirements[:5000],
        )

        token_score = token_similarity(
            data1.requirements[:5000],
            data2.requirements[:5000],
        )

        if (
            requirements_score >= 0.85
            or token_score >= 0.80
        ):
            return True

    # --------------------------------------------------------
    # LEVEL 5
    # Title + company + responsibilities
    # --------------------------------------------------------

    if (
        title_score >= 0.90
        and company_score >= 0.90
        and data1.responsibilities
        and data2.responsibilities
    ):

        responsibilities_score = text_similarity(
            data1.responsibilities[:5000],
            data2.responsibilities[:5000],
        )

        token_score = token_similarity(
            data1.responsibilities[:5000],
            data2.responsibilities[:5000],
        )

        if (
            responsibilities_score >= 0.85
            or token_score >= 0.80
        ):
            return True

    return False

# ============================================================
# Duplicate reason
# ============================================================

def duplicate_reason(job1, job2):
    """
    Returns a human-readable reason for debugging.

    Useful for logs such as:

        Duplicate skipped:
        Software Engineer
        Reason: same URL

    """

    # URL
    if same_url(job1, job2):
        return "same URL"

    # Hash
    hash1 = generate_dedup_hash(job1)
    hash2 = generate_dedup_hash(job2)

    if hash1 == hash2:
        return "same deduplication hash"

    title1 = normalized_title(job1)
    title2 = normalized_title(job2)

    company1 = normalized_company(job1)
    company2 = normalized_company(job2)

    location1 = normalized_location(job1)
    location2 = normalized_location(job2)

    title_score = text_similarity(
        title1,
        title2,
    )

    company_score = text_similarity(
        company1,
        company2,
    )

    location_score = text_similarity(
        location1,
        location2,
    )

    deadline_match = same_deadline(
        job1,
        job2,
    )

    if (
        title_score >= 0.95
        and company_score >= 0.95
        and location_score >= 0.90
    ):
        return (
            "same title/company/location"
        )

    description1 = normalized_description(job1)
    description2 = normalized_description(job2)

    if (
        title_score >= 0.90
        and company_score >= 0.90
        and description1
        and description2
    ):
        description_score = text_similarity(
            description1[:5000],
            description2[:5000],
        )

        token_score = token_similarity(
            description1[:5000],
            description2[:5000],
        )

        if (
            description_score >= 0.85
            or token_score >= 0.80
        ):
            return (
                "similar title/company/description"
            )

    requirements1 = normalized_requirements(job1)
    requirements2 = normalized_requirements(job2)

    if (
        title_score >= 0.90
        and company_score >= 0.90
        and requirements1
        and requirements2
    ):
        requirements_score = text_similarity(
            requirements1[:5000],
            requirements2[:5000],
        )

        token_score = token_similarity(
            requirements1[:5000],
            requirements2[:5000],
        )

        if (
            requirements_score >= 0.85
            or token_score >= 0.80
        ):
            return (
                "similar title/company/requirements"
            )

    responsibilities1 = normalized_responsibilities(
        job1
    )

    responsibilities2 = normalized_responsibilities(
        job2
    )

    if (
        title_score >= 0.90
        and company_score >= 0.90
        and responsibilities1
        and responsibilities2
    ):
        responsibilities_score = text_similarity(
            responsibilities1[:5000],
            responsibilities2[:5000],
        )

        token_score = token_similarity(
            responsibilities1[:5000],
            responsibilities2[:5000],
        )

        if (
            responsibilities_score >= 0.85
            or token_score >= 0.80
        ):
            return (
                "similar title/company/responsibilities"
            )

    return "unknown"


# ============================================================
# In-memory deduplication
# ============================================================

def deduplicate_jobs(jobs):
    """
    Deduplicate a list of jobs from the current scraper run.

    Returns:
        unique_jobs
        duplicate_jobs
    """

    unique_jobs = []
    duplicate_jobs = []

    seen_urls = set()
    seen_hashes = set()

    # Cached normalized representations.
    prepared_jobs = []

    for job in jobs:

        dedup_data = prepare_dedup_data(job)

        # ----------------------------------------------------
        # Fast URL check
        # ----------------------------------------------------

        if (
            dedup_data.url
            and dedup_data.url in seen_urls
        ):
            duplicate_jobs.append(
                (job, "same URL")
            )
            continue

        # ----------------------------------------------------
        # Fast hash check
        # ----------------------------------------------------

        if dedup_data.dedup_hash in seen_hashes:

            duplicate_jobs.append(
                (
                    job,
                    "same deduplication hash",
                )
            )

            continue

        # ----------------------------------------------------
        # Fuzzy comparison
        # ----------------------------------------------------

        duplicate = False
        reason = ""

        for existing_job, existing_data in prepared_jobs:

            if is_probable_duplicate(
                dedup_data,
                existing_data,
            ):

                duplicate = True

                reason = duplicate_reason(
                    job,
                    existing_job,
                )

                break

        if duplicate:

            duplicate_jobs.append(
                (job, reason)
            )

            continue

        # ----------------------------------------------------
        # New unique job
        # ----------------------------------------------------

        unique_jobs.append(job)

        prepared_jobs.append(
            (job, dedup_data)
        )

        if dedup_data.url:
            seen_urls.add(
                dedup_data.url
            )

        seen_hashes.add(
            dedup_data.dedup_hash
        )

    return unique_jobs, duplicate_jobs