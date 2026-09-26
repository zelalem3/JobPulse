from datetime import datetime
from common.models import JobListing
from common.validation import validate_job, valid_url


def _job(**kwargs):
    defaults = {
        "title": "Senior Laravel Developer",
        "company": "Acme PLC",
        "location": "Addis Ababa",
        "url": "https://example.com/jobs/1",
        "description": "x" * 80,
        "requirements": "y" * 40,
        "responsibilities": "z" * 40,
        "source": "Test",
    }
    defaults.update(kwargs)
    return JobListing(**defaults)


def test_valid_job_passes():
    result = validate_job(_job())
    assert result.valid is True
    assert result.errors == []


def test_missing_title_fails():
    result = validate_job(_job(title=""))
    assert result.valid is False
    assert any("title" in e.lower() for e in result.errors)


def test_short_title_fails():
    result = validate_job(_job(title="AB"))
    assert result.valid is False


def test_invalid_url_fails():
    result = validate_job(_job(url="not-a-url"))
    assert result.valid is False
    assert any("url" in e.lower() for e in result.errors)


def test_generic_title_fails():
    result = validate_job(_job(title="Vacancy"))
    assert result.valid is False


def test_too_little_content_fails():
    result = validate_job(
        _job(description="short", requirements="", responsibilities="")
    )
    assert result.valid is False
    assert any("content" in e.lower() for e in result.errors)


def test_valid_url_helper():
    assert valid_url("https://ethiojobs.net/job/1") is True
    assert valid_url("ftp://x") is True  # has scheme + netloc
    assert valid_url("nope") is False
    assert valid_url("") is False