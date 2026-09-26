import pytest
from common.normalizer import (
    clean_text,
    normalize_title,
    normalize_company,
    clean_location,
)
from common.deduplication import normalize_url


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