from addskill import (
    _smart_local_extraction,
    canonical_skill,
    job_hash,
    amharic_ratio,
)


def test_local_extraction_finds_common_skills():
    text = """
    We need a developer experienced with Python, Django, and PostgreSQL.
    Docker and Redis experience is a plus.
    """
    skills = _smart_local_extraction(text, job_title="Backend Developer")
    skills_lower = [s.lower() for s in skills]

    assert any("python" in s for s in skills_lower)
    # taxonomy may use exact names — at least some skills found
    assert len(skills) >= 1


def test_local_extraction_empty_text():
    assert _smart_local_extraction("") == []
    assert _smart_local_extraction(None or "") == []


def test_frontend_title_fallback():
    skills = _smart_local_extraction(
        "Join our team.",  # no skill keywords in body
        job_title="Frontend Engineer",
    )
    skills_lower = [s.lower() for s in skills]
    assert any(s in skills_lower for s in ["javascript", "html", "css", "react"])


def test_job_hash_stable():
    h1 = job_hash("Engineer", "Build APIs with Laravel")
    h2 = job_hash("Engineer", "Build APIs with Laravel")
    h3 = job_hash("Engineer", "Different description")
    assert h1 == h2
    assert h1 != h3
    assert len(h1) == 64


def test_amharic_ratio():
    assert amharic_ratio("Hello world") == 0
    assert amharic_ratio("ሥራ አስፈላጊ ነው") > 0.5
    assert amharic_ratio("") == 0


def test_canonical_skill_passthrough():
    # unknown skill returns as-is (or alias if configured)
    result = canonical_skill("Laravel")
    assert isinstance(result, str)
    assert len(result) > 0