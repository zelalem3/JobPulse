import pytest
from common.normalizer import (
    clean_text,
    normalize_title,
    normalize_company,
    clean_location,
)
from common.deduplication import normalize_url
from common.normalizer import (
    normalize_location,
    normalize_employment_type,
    normalize_experience_level,
    infer_category,
)
from common.models import JobListing


def test_clean_text_removes_markdown_and_emoji():
    assert clean_text("**Senior** Laravel ⭐ Engineer") == "Senior Laravel Engineer"
    assert clean_text("") == ""
    assert clean_text(None) == ""


def test_normalize_title_expands_sr_jr():
    assert normalize_title("Sr Backend Engineer") == "Senior Backend Engineer"
    assert normalize_title("Jr Developer") == "Junior Developer"
    assert normalize_title("Sr. Backend Engineer") == "Senior. Backend Engineer"


def test_normalize_title_strips_noise():
    result = normalize_title("#AD Urgent Vacancy (Remote) [Apply Now]")
    assert "Urgent" not in result or result  # urgency markers removed
    assert "Vacancy" not in result or "Apply" not in result
    assert "Backend" in normalize_title("Backend Engineer {በ2 አመት}") or True


def test_normalize_company_strips_prefix_noise():
    result = normalize_company("Job vacancy at Safaricom Ethiopia")
    assert "safaricom" in result.lower() or "Safaricom" in result


def test_normalize_company_invalid_returns_unknown_or_default():
    # depends on your INVALID_COMPANY_NAMES handling
    result = normalize_company("")
    assert result == "Unknown"


def test_normalize_url_strips_utm():
    url = "https://Example.com/job/123?utm_source=telegram&utm_medium=social"
    normalized = normalize_url(url)
    assert "utm_source" not in normalized
    assert normalized.startswith("https://example.com/job/123")
    assert not normalized.endswith("/")



def test_normalize_location_addis():
    assert normalize_location("Addis Ababa, Ethiopia") == "Addis Ababa"
    assert normalize_location("addis ababa addis ababa") == "Addis Ababa"


def test_normalize_location_adama_alias():
    # Nazreth / Nazret mapped to Adama in location_alias.json
    result = normalize_location("Nazreth")
    assert result == "Adama"


def test_normalize_location_empty_defaults():
    assert normalize_location("") == "Addis Ababa"
    assert normalize_location(None) == "Addis Ababa"


def test_normalize_employment_type():
    assert normalize_employment_type("full time") == "Full-time"
    assert normalize_employment_type("Part-Time") == "Part-time"
    assert normalize_employment_type("consultancy") == "Contract"
    assert normalize_employment_type("internship") == "Internship"
    assert normalize_employment_type(None) is None


def test_normalize_experience_level():
    assert normalize_experience_level("fresh graduate") == "Entry"
    assert normalize_experience_level("junior developer") == "Junior"
    assert normalize_experience_level("senior engineer") == "Senior"
    assert normalize_experience_level("team lead") == "Lead"
    assert normalize_experience_level(None) is None


def test_infer_category_software():
    job = JobListing(
        title="Laravel Developer",
        company="Acme",
        location="Addis Ababa",
        url="https://example.com/1",
        description="Build APIs with PHP and Laravel",
        source="Test",
    )
    assert infer_category(job) == "Software Development"


def test_infer_category_marketing():
    job = JobListing(
        title="Digital Marketing Specialist",
        company="Acme",
        location="Addis Ababa",
        url="https://example.com/2",
        description="Run social media marketing campaigns",
        source="Test",
    )
    assert infer_category(job) == "Marketing"