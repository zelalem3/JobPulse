from datetime import datetime, timezone


def quality_score(job):

    score = 0
    reasons = []

    # ========================================================
    # Title
    # ========================================================

    if job.title and len(job.title.strip()) >= 5:
        score += 10
    else:
        reasons.append("Weak title")

    # ========================================================
    # Company
    # ========================================================

    if job.company and job.company.strip():
        score += 10
    else:
        reasons.append("No company")

    # ========================================================
    # Description
    # ========================================================

    description = job.description or ""
    description_length = len(description.strip())

    if description_length >= 500:
        score += 15

    elif description_length >= 300:
        score += 12

    elif description_length >= 100:
        score += 8

    else:
        reasons.append("Short description")

    # ========================================================
    # Requirements
    # ========================================================

    requirements = job.requirements or ""

    if len(requirements.strip()) >= 50:
        score += 10

    elif requirements.strip():
        score += 5

    else:
        reasons.append("No requirements")

    # ========================================================
    # Responsibilities
    # ========================================================

    responsibilities = job.responsibilities or ""

    if len(responsibilities.strip()) >= 50:
        score += 10

    elif responsibilities.strip():
        score += 5

    else:
        reasons.append("No responsibilities")

    # ========================================================
    # Skills
    # ========================================================

    skills = job.skills or []

    if len(skills) >= 5:
        score += 10

    elif len(skills) >= 3:
        score += 7

    elif len(skills) >= 1:
        score += 4

    else:
        reasons.append("No skills")

    # ========================================================
    # Deadline
    # ========================================================

    if job.deadline:
        score += 10

    else:
        reasons.append("No deadline")

    # ========================================================
    # Employment Type
    # ========================================================

    if job.employment_type:
        score += 5

    else:
        reasons.append("No employment type")

    # ========================================================
    # Experience
    # ========================================================

    if job.experience_level:
        score += 5

    else:
        reasons.append("No experience level")

    # ========================================================
    # Salary
    # ========================================================

    salary = job.salary or ""

    if salary and salary.lower() not in {
        "negotiable",
        "competitive",
        "attractive",
    }:
        score += 10

    else:
        reasons.append("No salary information")

    # ========================================================
    # Freshness
    # ========================================================

    if job.posted_at:

        now = datetime.now(
            job.posted_at.tzinfo
            or timezone.utc
        )

        age = (
            now - job.posted_at
        ).days

        if age <= 3:
            score += 5

        elif age <= 7:
            score += 3

        else:
            reasons.append("Old job")

    else:
        reasons.append("No posting date")

    # ========================================================
    # Normalize score
    # ========================================================

    score = min(score, 100)

    return score, reasons