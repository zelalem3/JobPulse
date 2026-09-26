from datetime import datetime, timezone, timedelta
from common.models import JobListing
from common.quality import quality_score


def _job(**kwargs):
    defaults = {
        "title": "Senior Backend Engineer",
        "company": "Acme",
        "location": "Addis Ababa",
        "url": "https://example.com/1",
        "description": "x" * 400,
        "requirements": "y" * 60,
        "responsibilities": "z" * 60,
        "skills": ["PHP", "Laravel", "PostgreSQL"],
        "deadline": datetime.now(timezone.utc) + timedelta(days=14),
        "posted_at": datetime.now(timezone.utc) - timedelta(days=1),
        "employment_type": "Full-time",
        "experience_level": "Senior",
        "salary": "25000 ETB",
        "source": "Test",
    }
    defaults.update(kwargs)
    return JobListing(**defaults)


def test_complete_job_scores_high():
    score, reasons = quality_score(_job())
    assert score >= 70
    assert score <= 100


def test_empty_job_scores_low():
    score, reasons = quality_score(
        _job(
            title="Job",
            company="",
            description="x",
            requirements="",
            responsibilities="",
            skills=[],
            deadline=None,
            posted_at=None,
            employment_type=None,
            experience_level=None,
            salary="Negotiable",
        )
    )
    assert score < 40
    assert len(reasons) > 0


def test_fresh_job_gets_freshness_bonus():
    score_fresh, _ = quality_score(
        _job(posted_at=datetime.now(timezone.utc) - timedelta(days=1))
    )
    score_old, _ = quality_score(
        _job(posted_at=datetime.now(timezone.utc) - timedelta(days=30))
    )
    assert score_fresh >= score_old