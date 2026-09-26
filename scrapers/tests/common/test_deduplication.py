from common.models import JobListing
from common.deduplication import (
    normalize_url,
    generate_dedup_hash,
    prepare_dedup_data,
    same_url,
)


def _job(**kwargs):
    defaults = {
        "title": "Software Engineer",
        "company": "Acme PLC",
        "location": "Addis Ababa",
        "url": "https://example.com/jobs/1",
        "description": "Build APIs with Laravel and PostgreSQL." * 5,
        "requirements": "PHP, Laravel",
        "responsibilities": "Write code",
        "source": "Test",
    }
    defaults.update(kwargs)
    return JobListing(**defaults)


def test_same_url_after_tracking_params():
    j1 = _job(url="https://example.com/job/1?utm_source=tg")
    j2 = _job(url="https://example.com/job/1")
    assert same_url(j1, j2) is True


def test_different_urls_not_same():
    j1 = _job(url="https://example.com/job/1")
    j2 = _job(url="https://example.com/job/2")
    assert same_url(j1, j2) is False


def test_identical_jobs_same_hash():
    j1 = _job()
    j2 = _job()
    assert generate_dedup_hash(j1) == generate_dedup_hash(j2)


def test_different_titles_different_hash():
    j1 = _job(title="Backend Engineer")
    j2 = _job(title="Frontend Engineer")
    assert generate_dedup_hash(j1) != generate_dedup_hash(j2)


def test_prepare_dedup_data_has_hash():
    data = prepare_dedup_data(_job())
    assert data.dedup_hash
    assert len(data.dedup_hash) == 64  # sha256 hex
    assert data.title
    assert data.company