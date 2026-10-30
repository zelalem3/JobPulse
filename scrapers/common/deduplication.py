"""
JobPulse deduplication – improved version.

Goals:
- Catch the same vacancy across LinkedIn / Telegram / EthioJobs / GeezJobs etc.
- Tolerate missing company, generic "Addis Ababa", short vs long descriptions
- Use posted_at as a soft signal
- Keep false-positive rate low
"""

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
from typing import Optional, List, Tuple, Any

try:
    from dateutil import parser as date_parser
except ImportError:
    date_parser = None


# ============================================================
# Data container
# ============================================================

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
    "hiring",
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
    "sc",
    "s.c",
    "s c",
}

PLACEHOLDER_COMPANIES = {
    "not specified",
    "not specified.",
    "n/a",
    "na",
    "none",
    "unknown",
    "tbd",
    "to be announced",
    "company name",
    "employer",
    "confidential",
    "private",
    "-",
    "--",
    "nil",
}

GENERIC_LOCATIONS = {
    "addis ababa",
    "addis",
    "ethiopia",
    "addis ababa, ethiopia",
    "addis ababa ethiopia",
    "aa",
    "addis, addis ababa",
    "remote",
    "anywhere",
}


# ============================================================
# Generic helpers
# ============================================================

def get_value(job: Any, field: str, default: Any = "") -> Any:
    if job is None:
        return default
    if isinstance(job, dict):
        return job.get(field, default)
    return getattr(job, field, default)


# ============================================================
# Posted-at helpers
# ============================================================

def get_posted_at(job: Any) -> Any:
    return (
        get_value(job, "posted_at")
        or get_value(job, "posted_date")
        or get_value(job, "posted")
        or None
    )


def normalize_posted_at(value: Any) -> Optional[datetime]:
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
    job1: Any,
    job2: Any,
    max_days: int = 5,
) -> Optional[bool]:
    """
    True  → within max_days
    False → both have dates but too far apart
    None  → one or both missing
    """
    def _ts(obj: Any) -> Optional[datetime]:
        if isinstance(obj, DedupData):
            return normalize_posted_at(obj.posted_at) if obj.posted_at else None
        return normalize_posted_at(get_posted_at(obj))

    t1, t2 = _ts(job1), _ts(job2)
    if t1 is None or t2 is None:
        return None
    return abs((t1 - t2).days) <= max_days


# ============================================================
# Text normalization
# ============================================================

def normalize_text(value: Any) -> str:
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


def normalize_title(value: Any) -> str:
    value = normalize_text(value)
    if not value:
        return ""
    words = [w for w in value.split() if w not in GENERIC_TITLE_WORDS]
    return " ".join(words)


def normalize_company(value: Any) -> str:
    value = normalize_text(value)
    if not value:
        return ""

    value = re.sub(r"\s*\([^)]*\)", " ", value)
    value = re.sub(r"\s+", " ", value).strip()

    words = [w for w in value.split() if w not in COMPANY_SUFFIXES]
    cleaned = " ".join(words)

    if cleaned in PLACEHOLDER_COMPANIES:
        return ""

    return cleaned


def load_location_config(filepath: Optional[Path] = None) -> dict:
    if filepath is None:
        filepath = Path(__file__).resolve().parent / "location.json"
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"noise_patterns": [], "mappings": {}}


CONFIG = load_location_config()


def normalize_location(value: Any) -> str:
    if not value:
        return ""
    value = str(value).lower().strip()
    value = re.sub(r"\s+", " ", value)

    for pattern in CONFIG.get("noise_patterns", []):
        value = re.sub(pattern, " ", value)
    value = re.sub(r"\s+", " ", value).strip()

    for standard, variations in CONFIG.get("mappings", {}).items():
        for variant in variations:
            if re.search(r"\b" + re.escape(variant) + r"\b", value):
                return standard
    return value


def is_generic_location(loc: str) -> bool:
    if not loc:
        return True
    loc = loc.lower().strip()
    if loc in GENERIC_LOCATIONS:
        return True
    if len(loc) < 4:
        return True
    # "addis, addis ababa" style
    if "addis" in loc and "ababa" in loc:
        return True
    return False


# ============================================================
# Field extractors
# ============================================================

def normalized_title(job: Any) -> str:
    return normalize_title(get_value(job, "title"))


def normalized_company(job: Any) -> str:
    return normalize_company(
        get_value(job, "company") or get_value(job, "company_name")
    )


def normalized_location(job: Any) -> str:
    return normalize_location(get_value(job, "location"))


def normalized_description(job: Any) -> str:
    return normalize_text(get_value(job, "description"))


def normalized_requirements(job: Any) -> str:
    return normalize_text(get_value(job, "requirements"))


def normalized_responsibilities(job: Any) -> str:
    return normalize_text(get_value(job, "responsibilities"))


# ============================================================
# URL
# ============================================================

def normalize_url(url: Any) -> str:
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
        return urlunparse(normalized).lower().strip().rstrip("/")
    except Exception:
        return str(url).strip().lower().rstrip("/")


def same_url(job1: Any, job2: Any) -> bool:
    u1 = normalize_url(get_value(job1, "url"))
    u2 = normalize_url(get_value(job2, "url"))
    return bool(u1 and u2 and u1 == u2)


# ============================================================
# Deadline
# ============================================================

def normalize_deadline(deadline: Any) -> str:
    if not deadline:
        return ""
    try:
        return deadline.strftime("%Y-%m-%d")
    except AttributeError:
        return str(deadline)[:10]


def get_deadline(job: Any) -> Any:
    return get_value(job, "deadline", None)


def same_deadline(job1: Any, job2: Any) -> Optional[bool]:
    d1 = normalize_deadline(get_deadline(job1))
    d2 = normalize_deadline(get_deadline(job2))
    if not d1 or not d2:
        return None
    return d1 == d2


# ============================================================
# Similarity
# ============================================================

def text_similarity(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, a, b).ratio()


def token_similarity(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    t1, t2 = set(a.split()), set(b.split())
    if not t1 or not t2:
        return 0.0
    inter = t1.intersection(t2)
    union = t1.union(t2)
    return len(inter) / len(union) if union else 0.0


# ============================================================
# Hash + prepare
# ============================================================

def generate_dedup_hash(job: Any) -> str:
    """
    Content hash. Excludes source & URL so cross-source
    duplicates can still collide.
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


def prepare_dedup_data(job: Any) -> DedupData:
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


def extract_company_from_text(text: str) -> str:
    if not text:
        return ""
    m = re.search(
        r"(?:company|employer)\s*[:\-]\s*([A-Za-z0-9 &.]{3,60})",
        text,
        re.I,
    )
    if m:
        return normalize_company(m.group(1))
    # Fallback: first capitalized-looking chunk near the start
    m = re.search(r"\b([A-Z][A-Za-z0-9&. ]{2,40}(?:PLC|Ltd|Group|S\.?C)?)\b", text[:300])
    if m:
        return normalize_company(m.group(1))
    return ""


# ============================================================
# Core matcher
# ============================================================
def is_probable_duplicate(job1: Any, job2: Any) -> bool:
    """
    Returns True when the two jobs almost certainly represent
    the same vacancy.
    """
    data1 = job1 if isinstance(job1, DedupData) else prepare_dedup_data(job1)
    data2 = job2 if isinstance(job2, DedupData) else prepare_dedup_data(job2)

    # ---------- LEVEL 1: exact URL ----------
    if data1.url and data2.url and data1.url == data2.url:
        return True

    if not data1.title or not data2.title:
        return False

    title_score = text_similarity(data1.title, data2.title)

    has_company = bool(data1.company and data2.company)
    company_score = (
        text_similarity(data1.company, data2.company) if has_company else 0.0
    )

    loc1 = data1.location or ""
    loc2 = data2.location or ""
    if is_generic_location(loc1) or is_generic_location(loc2):
        location_score = 1.0
    else:
        location_score = text_similarity(loc1, loc2)

    # Hard veto on different deadlines
    if data1.deadline and data2.deadline and data1.deadline != data2.deadline:
        return False

    posted_close = same_or_close_posted_at(data1, data2, max_days=5)

    # ---------- LEVEL 2: classic strong match ----------
    if (
        has_company
        and title_score >= 0.95
        and company_score >= 0.95
        and location_score >= 0.90
    ):
        return True

    # ---------- LEVEL 2b: strong title + company + generic location ----------
    if (
        has_company
        and title_score >= 0.95
        and company_score >= 0.92
        and (is_generic_location(loc1) or is_generic_location(loc2))
    ):
        return True

    # ---------- LEVEL 2c: close posted time boost ----------
    if (
        posted_close is True
        and has_company
        and title_score >= 0.92
        and company_score >= 0.90
    ):
        return True

    # ---------- LEVEL 2d: near-identical title + same company is enough ----------
    if (
        has_company
        and title_score >= 0.98
        and company_score >= 0.95
    ):
        return True

    # ---------- LEVEL 3: title + company + description ----------
    if (
        has_company
        and title_score >= 0.90
        and company_score >= 0.90
        and data1.description
        and data2.description
    ):
        desc = text_similarity(data1.description[:5000], data2.description[:5000])
        tok = token_similarity(data1.description[:5000], data2.description[:5000])
        if desc >= 0.85 or tok >= 0.80:
            return True

    # ---------- LEVEL 4: title + company + requirements ----------
    if (
        has_company
        and title_score >= 0.90
        and company_score >= 0.90
        and data1.requirements
        and data2.requirements
    ):
        req = text_similarity(data1.requirements[:5000], data2.requirements[:5000])
        tok = token_similarity(data1.requirements[:5000], data2.requirements[:5000])
        if req >= 0.85 or tok >= 0.80:
            return True

    # ---------- LEVEL 5: title + company + responsibilities ----------
    if (
        has_company
        and title_score >= 0.90
        and company_score >= 0.90
        and data1.responsibilities
        and data2.responsibilities
    ):
        resp = text_similarity(
            data1.responsibilities[:5000], data2.responsibilities[:5000]
        )
        tok = token_similarity(
            data1.responsibilities[:5000], data2.responsibilities[:5000]
        )
        if resp >= 0.85 or tok >= 0.80:
            return True

    # ---------- FALLBACK: company missing on one or both sides ----------
    if not has_company:
        if title_score < 0.93:
            return False

        # Try to recover company from description
        c1 = data1.company or extract_company_from_text(data1.description)
        c2 = data2.company or extract_company_from_text(data2.description)
        if c1 and c2 and text_similarity(c1, c2) >= 0.90:
            return True

        # Prefer description overlap (thresholds relaxed for noisy boards)
        if data1.description and data2.description:
            desc = text_similarity(data1.description[:4000], data2.description[:4000])
            tok = token_similarity(data1.description[:4000], data2.description[:4000])
            if desc >= 0.80 or tok >= 0.75:
                return True

        if data1.requirements and data2.requirements:
            req = text_similarity(data1.requirements[:3000], data2.requirements[:3000])
            if req >= 0.85:
                return True

        if posted_close is True and title_score >= 0.96:
            return True

    return False
# ============================================================
# Human-readable reason
# ============================================================

def duplicate_reason(job1: Any, job2: Any) -> str:
    if same_url(job1, job2):
        return "same URL"

    h1 = generate_dedup_hash(job1)
    h2 = generate_dedup_hash(job2)
    if h1 == h2:
        return "same deduplication hash"

    t1 = normalized_title(job1)
    t2 = normalized_title(job2)
    c1 = normalized_company(job1)
    c2 = normalized_company(job2)
    l1 = normalized_location(job1)
    l2 = normalized_location(job2)

    title_score = text_similarity(t1, t2)
    company_score = text_similarity(c1, c2) if c1 and c2 else 0.0
    location_score = text_similarity(l1 or "", l2 or "")
    posted_close = same_or_close_posted_at(job1, job2, max_days=5)

    if title_score >= 0.95 and company_score >= 0.95 and location_score >= 0.90:
        return "same title/company/location"

    if (
        title_score >= 0.95
        and company_score >= 0.92
        and (is_generic_location(l1) or is_generic_location(l2))
    ):
        return "same title/company (generic location)"

    if posted_close is True and title_score >= 0.92 and company_score >= 0.90:
        return "similar title/company + close posting time"

    d1 = normalized_description(job1)
    d2 = normalized_description(job2)
    if title_score >= 0.90 and company_score >= 0.90 and d1 and d2:
        if (
            text_similarity(d1[:5000], d2[:5000]) >= 0.85
            or token_similarity(d1[:5000], d2[:5000]) >= 0.80
        ):
            return "similar title/company/description"

    r1 = normalized_requirements(job1)
    r2 = normalized_requirements(job2)
    if title_score >= 0.90 and company_score >= 0.90 and r1 and r2:
        if (
            text_similarity(r1[:5000], r2[:5000]) >= 0.85
            or token_similarity(r1[:5000], r2[:5000]) >= 0.80
        ):
            return "similar title/company/requirements"

    if not (c1 and c2) and title_score >= 0.93:
        return "similar title + content (missing company)"

    return "unknown"


# ============================================================
# In-memory batch deduplication (used by scrapers)
# ============================================================

def deduplicate_jobs(jobs: List[Any]) -> Tuple[List[Any], List[Tuple[Any, str]]]:
    """
    Deduplicate a list of jobs from the current scraper run.

    Returns:
        unique_jobs, duplicate_jobs
        where duplicate_jobs is [(job, reason), ...]
    """
    unique_jobs: List[Any] = []
    duplicate_jobs: List[Tuple[Any, str]] = []

    seen_urls = set()
    seen_hashes = set()
    prepared: List[Tuple[Any, DedupData]] = []

    for job in jobs:
        data = prepare_dedup_data(job)

        if data.url and data.url in seen_urls:
            duplicate_jobs.append((job, "same URL"))
            continue

        if data.dedup_hash in seen_hashes:
            duplicate_jobs.append((job, "same deduplication hash"))
            continue

        is_dup = False
        reason = ""
        for existing_job, existing_data in prepared:
            if is_probable_duplicate(data, existing_data):
                is_dup = True
                reason = duplicate_reason(job, existing_job)
                break

        if is_dup:
            duplicate_jobs.append((job, reason))
            continue

        unique_jobs.append(job)
        prepared.append((job, data))
        if data.url:
            seen_urls.add(data.url)
        seen_hashes.add(data.dedup_hash)

    return unique_jobs, duplicate_jobs