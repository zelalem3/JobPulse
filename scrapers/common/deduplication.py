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
from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Union

try:
    from dateutil import parser as date_parser
except ImportError:
    date_parser = None


@dataclass(frozen=True)
class DedupData:
    url: str
    title: str
    company: str
    location: str
    deadline: str
    posted_at: str
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

GENERIC_TITLE_WORDS = {
    "job",
    "vacancy",
    "position",
    "opening",
    "opportunity",
    "required",
    "wanted",
}

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
    """Safely retrieve a field from JobListing or dict."""
    if job is None:
        return default
    if isinstance(job, dict):
        return job.get(field, default)
    return getattr(job, field, default)


# ============================================================
# Posted-at helpers
# ============================================================

def get_posted_at(job):
    """Pull posted_at / posted_date / posted from a raw job."""
    return (
        get_value(job, "posted_at")
        or get_value(job, "posted_date")
        or get_value(job, "posted")
        or None
    )


def normalize_posted_at(value) -> Optional[datetime]:
    """Return a datetime or None. Handles datetime, ISO, YYYY-MM-DD, etc."""
    if value is None:
        return None
    if isinstance(value, datetime):
        return value
    text = str(value).strip()
    if not text:
        return None
    try:
        if date_parser is not None:
            return date_parser.parse(text)
        return datetime.fromisoformat(text[:19])
    except Exception:
        try:
            return datetime.fromisoformat(text[:10])
        except Exception:
            return None


def same_or_close_posted_at(
    job1,
    job2,
    max_days: int = 3,
) -> Optional[bool]:
    """
    Returns:
        True  → posting times within max_days
        False → both have dates but too far apart
        None  → one or both missing
    """
    def _get_ts(obj):
        if isinstance(obj, DedupData):
            return normalize_posted_at(obj.posted_at) if obj.posted_at else None
        return normalize_posted_at(get_posted_at(obj))

    t1 = _get_ts(job1)
    t2 = _get_ts(job2)

    if t1 is None or t2 is None:
        return None

    delta = abs((t1 - t2).days)
    return delta <= max_days


# ============================================================
# Text normalization
# ============================================================

def normalize_text(value):
    if value is None:
        return ""
    value = str(value).lower().strip()
    if not value:
        return ""
    value = value.replace("&", " and ")
    value = re.sub(r"https?://\S+", " ", value)
    value = value.replace("_", " ").replace("-", " ")
    value = re.sub(r"[^\w\s]", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def normalize_title(value):
    value = normalize_text(value)
    if not value:
        return ""
    words = [w for w in value.split() if w not in GENERIC_TITLE_WORDS]
    return " ".join(words)


def normalize_company(value):
    value = normalize_text(value)
    if not value:
        return ""
    words = [w for w in value.split() if w not in COMPANY_SUFFIXES]
    return " ".join(words)


def load_location_config(filepath=None):
    if filepath is None:
        filepath = Path(__file__).resolve().parent / "location.json"
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


CONFIG = load_location_config()


def normalize_location(value):
    if not value:
        return ""
    value = value.lower().strip()
    value = re.sub(r"\s+", " ", value)

    for pattern in CONFIG.get("noise_patterns", []):
        value = re.sub(pattern, " ", value)
    value = re.sub(r"\s+", " ", value).strip()

    for standard_location, variations in CONFIG.get("mappings", {}).items():
        for variant in variations:
            if re.search(r"\b" + re.escape(variant) + r"\b", value):
                return standard_location
    return value


def is_generic_location(loc: str) -> bool:
    if not loc:
        return True
    loc = loc.lower().strip()
    generics = {
        "addis ababa",
        "addis",
        "ethiopia",
        "addis ababa, ethiopia",
        "aa",
        "addis ababa ethiopia",
    }
    return loc in generics or len(loc) < 4


# ============================================================
# Job field normalization
# ============================================================

def normalized_title(job):
    return normalize_title(get_value(job, "title"))


def normalized_company(job):
    return normalize_company(get_value(job, "company"))


def normalized_location(job):
    return normalize_location(get_value(job, "location"))


def normalized_description(job):
    return normalize_text(get_value(job, "description"))


def normalized_requirements(job):
    return normalize_text(get_value(job, "requirements"))


def normalized_responsibilities(job):
    return normalize_text(get_value(job, "responsibilities"))


# ============================================================
# URL normalization
# ============================================================

def normalize_url(url):
    if not url:
        return ""
    try:
        parsed = urlparse(str(url).strip())
        query = [
            (k, v)
            for k, v in parse_qsl(parsed.query, keep_blank_values=True)
            if k.lower() not in TRACKING_PARAMS
        ]
        normalized = parsed._replace(query=urlencode(query), fragment="")
        result = urlunparse(normalized).lower().strip().rstrip("/")
        return result
    except Exception:
        return str(url).strip().lower().rstrip("/")


# ============================================================
# Deadline helpers
# ============================================================

def normalize_deadline(deadline):
    if not deadline:
        return ""
    try:
        return deadline.strftime("%Y-%m-%d")
    except AttributeError:
        return str(deadline)[:10]


def get_deadline(job):
    return get_value(job, "deadline", None)


def same_deadline(job1, job2):
    d1 = normalize_deadline(get_deadline(job1))
    d2 = normalize_deadline(get_deadline(job2))
    if not d1 or not d2:
        return None
    return d1 == d2


# ============================================================
# Similarity
# ============================================================

def text_similarity(text1, text2):
    if not text1 or not text2:
        return 0.0
    return SequenceMatcher(None, text1, text2).ratio()


def token_similarity(text1, text2):
    if not text1 or not text2:
        return 0.0
    tokens1 = set(text1.split())
    tokens2 = set(text2.split())
    if not tokens1 or not tokens2:
        return 0.0
    intersection = tokens1.intersection(tokens2)
    union = tokens1.union(tokens2)
    return len(intersection) / len(union) if union else 0.0


# ============================================================
# Exact URL comparison
# ============================================================

def same_url(job1, job2):
    url1 = normalize_url(get_value(job1, "url"))
    url2 = normalize_url(get_value(job2, "url"))
    return bool(url1 and url2 and url1 == url2)


# ============================================================
# Fingerprint
# ============================================================

def generate_dedup_hash(job):
    """
    Stable content hash.
    Deliberately excludes source and URL so the same vacancy
    from different boards can still collide.
    """
    title = normalized_title(job)
    company = normalized_company(job)
    location = normalized_location(job)
    deadline = normalize_deadline(get_deadline(job))
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
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def prepare_dedup_data(job) -> DedupData:
    """Precompute all normalized fields used by deduplication."""
    url = normalize_url(get_value(job, "url"))
    title = normalized_title(job)
    company = normalized_company(job)
    location = normalized_location(job)
    deadline = normalize_deadline(get_deadline(job))
    description = normalized_description(job)
    requirements = normalized_requirements(job)
    responsibilities = normalized_responsibilities(job)

    posted = normalize_posted_at(get_posted_at(job))
    posted_str = posted.isoformat() if posted else ""

    raw = "|".join([
        title,
        company,
        location,
        deadline,
        description[:2000],
        requirements[:1000],
        responsibilities[:1000],
    ])
    dedup_hash = hashlib.sha256(raw.encode("utf-8")).hexdigest()

    return DedupData(
        url=url,
        title=title,
        company=company,
        location=location,
        deadline=deadline,
        posted_at=posted_str,
        description=description,
        requirements=requirements,
        responsibilities=responsibilities,
        dedup_hash=dedup_hash,
    )


# ============================================================
# Strong identity checks
# ============================================================

def same_title_company_location(job1, job2):
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

    return (
        text_similarity(title1, title2) >= 0.95
        and text_similarity(company1, company2) >= 0.95
        and text_similarity(location1, location2) >= 0.90
    )


# ============================================================
# Main duplicate detector
# ============================================================

def is_probable_duplicate(job1, job2) -> bool:
    """
    Decide whether job1 and job2 probably represent the same vacancy.
    Accepts either raw jobs or already-prepared DedupData.
    """
    data1 = job1 if isinstance(job1, DedupData) else prepare_dedup_data(job1)
    data2 = job2 if isinstance(job2, DedupData) else prepare_dedup_data(job2)

    # LEVEL 1 – exact normalized URL
    if data1.url and data2.url and data1.url == data2.url:
        return True

    if not data1.title or not data2.title:
        return False

    title_score = text_similarity(data1.title, data2.title)

    has_company = bool(data1.company and data2.company)
    company_score = (
        text_similarity(data1.company, data2.company) if has_company else 0.0
    )

    # Treat generic / missing locations as non-penalizing
    loc1 = data1.location or ""
    loc2 = data2.location or ""
    if is_generic_location(loc1) or is_generic_location(loc2):
        location_score = 1.0
    else:
        location_score = text_similarity(loc1, loc2)

    # Deadline hard veto
    if data1.deadline and data2.deadline and data1.deadline != data2.deadline:
        return False

    posted_close = same_or_close_posted_at(data1, data2, max_days=3)

    # LEVEL 2 – classic strong match (title + company + location)
    if (
        has_company
        and title_score >= 0.95
        and company_score >= 0.95
        and location_score >= 0.90
    ):
        return True

    # Soft path: close posting time + good title/company
    if (
        posted_close is True
        and title_score >= 0.92
        and has_company
        and company_score >= 0.90
    ):
        return True

    # LEVEL 3 – title + company + description
    if (
        has_company
        and title_score >= 0.90
        and company_score >= 0.90
        and data1.description
        and data2.description
    ):
        desc_score = text_similarity(
            data1.description[:5000], data2.description[:5000]
        )
        tok_score = token_similarity(
            data1.description[:5000], data2.description[:5000]
        )
        if desc_score >= 0.85 or tok_score >= 0.80:
            return True

    # LEVEL 4 – title + company + requirements
    if (
        has_company
        and title_score >= 0.90
        and company_score >= 0.90
        and data1.requirements
        and data2.requirements
    ):
        req_score = text_similarity(
            data1.requirements[:5000], data2.requirements[:5000]
        )
        tok_score = token_similarity(
            data1.requirements[:5000], data2.requirements[:5000]
        )
        if req_score >= 0.85 or tok_score >= 0.80:
            return True

    # LEVEL 5 – title + company + responsibilities
    if (
        has_company
        and title_score >= 0.90
        and company_score >= 0.90
        and data1.responsibilities
        and data2.responsibilities
    ):
        resp_score = text_similarity(
            data1.responsibilities[:5000], data2.responsibilities[:5000]
        )
        tok_score = token_similarity(
            data1.responsibilities[:5000], data2.responsibilities[:5000]
        )
        if resp_score >= 0.85 or tok_score >= 0.80:
            return True

    # Fallback when company is missing on one or both sides
    # Require stronger title + content + (optional) close posted time
    if not has_company:
        if title_score < 0.92:
            return False

        if data1.description and data2.description:
            desc_score = text_similarity(
                data1.description[:4000], data2.description[:4000]
            )
            tok_score = token_similarity(
                data1.description[:4000], data2.description[:4000]
            )
            if desc_score >= 0.88 or tok_score >= 0.82:
                return True

        if data1.requirements and data2.requirements:
            req_score = text_similarity(
                data1.requirements[:3000], data2.requirements[:3000]
            )
            if req_score >= 0.85:
                return True

        # Extra boost if posting times are close
        if posted_close is True and title_score >= 0.94:
            return True

    return False


# ============================================================
# Duplicate reason (for logging)
# ============================================================

def duplicate_reason(job1, job2) -> str:
    if same_url(job1, job2):
        return "same URL"

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

    title_score = text_similarity(title1, title2)
    company_score = (
        text_similarity(company1, company2) if company1 and company2 else 0.0
    )
    location_score = text_similarity(location1 or "", location2 or "")

    posted_close = same_or_close_posted_at(job1, job2, max_days=3)

    if (
        title_score >= 0.95
        and company_score >= 0.95
        and location_score >= 0.90
    ):
        return "same title/company/location"

    if (
        posted_close is True
        and title_score >= 0.92
        and company_score >= 0.90
    ):
        return "similar title/company + close posting time"

    description1 = normalized_description(job1)
    description2 = normalized_description(job2)
    if (
        title_score >= 0.90
        and company_score >= 0.90
        and description1
        and description2
    ):
        desc_score = text_similarity(description1[:5000], description2[:5000])
        tok_score = token_similarity(description1[:5000], description2[:5000])
        if desc_score >= 0.85 or tok_score >= 0.80:
            return "similar title/company/description"

    requirements1 = normalized_requirements(job1)
    requirements2 = normalized_requirements(job2)
    if (
        title_score >= 0.90
        and company_score >= 0.90
        and requirements1
        and requirements2
    ):
        req_score = text_similarity(requirements1[:5000], requirements2[:5000])
        tok_score = token_similarity(requirements1[:5000], requirements2[:5000])
        if req_score >= 0.85 or tok_score >= 0.80:
            return "similar title/company/requirements"

    responsibilities1 = normalized_responsibilities(job1)
    responsibilities2 = normalized_responsibilities(job2)
    if (
        title_score >= 0.90
        and company_score >= 0.90
        and responsibilities1
        and responsibilities2
    ):
        resp_score = text_similarity(
            responsibilities1[:5000], responsibilities2[:5000]
        )
        tok_score = token_similarity(
            responsibilities1[:5000], responsibilities2[:5000]
        )
        if resp_score >= 0.85 or tok_score >= 0.80:
            return "similar title/company/responsibilities"

    if not (company1 and company2) and title_score >= 0.92:
        return "similar title + content (missing company)"

    return "unknown"


# ============================================================
# In-memory deduplication
# ============================================================

def deduplicate_jobs(jobs):
    """
    Deduplicate a list of jobs from the current scraper run.

    Returns:
        (unique_jobs, duplicate_jobs)
        where duplicate_jobs is a list of (job, reason)
    """
    unique_jobs = []
    duplicate_jobs = []

    seen_urls = set()
    seen_hashes = set()
    prepared_jobs = []

    for job in jobs:
        dedup_data = prepare_dedup_data(job)

        # Fast URL check
        if dedup_data.url and dedup_data.url in seen_urls:
            duplicate_jobs.append((job, "same URL"))
            continue

        # Fast hash check
        if dedup_data.dedup_hash in seen_hashes:
            duplicate_jobs.append((job, "same deduplication hash"))
            continue

        # Fuzzy comparison
        is_dup = False
        reason = ""
        for existing_job, existing_data in prepared_jobs:
            if is_probable_duplicate(dedup_data, existing_data):
                is_dup = True
                reason = duplicate_reason(job, existing_job)
                break

        if is_dup:
            duplicate_jobs.append((job, reason))
            continue

        # New unique job
        unique_jobs.append(job)
        prepared_jobs.append((job, dedup_data))
        if dedup_data.url:
            seen_urls.add(dedup_data.url)
        seen_hashes.add(dedup_data.dedup_hash)

    return unique_jobs, duplicate_jobs