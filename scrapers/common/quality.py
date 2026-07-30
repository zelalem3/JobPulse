from datetime import datetime


def quality_score(job):

    score = 0

    reasons = []

    # --------------------------------------------------------
    # Title
    # --------------------------------------------------------

    if job.title:

        score += 10

    else:

        reasons.append("No title")

    # --------------------------------------------------------
    # Company
    # --------------------------------------------------------

    if job.company:

        score += 10

    else:

        reasons.append("No company")

    # --------------------------------------------------------
    # Description
    # --------------------------------------------------------

    description = job.description or ""

    if len(description) > 300:

        score += 15

    elif len(description) > 100:

        score += 8

    else:

        reasons.append("Short description")

    # --------------------------------------------------------
    # Requirements
    # --------------------------------------------------------

    if job.requirements:

        score += 10

    # --------------------------------------------------------
    # Responsibilities
    # --------------------------------------------------------

    if job.responsibilities:

        score += 10

    # --------------------------------------------------------
    # Skills
    # --------------------------------------------------------

    if job.skills:

        score += min(
            len(job.skills),
            10
        )

    # --------------------------------------------------------
    # Deadline
    # --------------------------------------------------------

    if job.deadline:

        score += 10

    # --------------------------------------------------------
    # Employment Type
    # --------------------------------------------------------

    if job.employment_type:

        score += 5

    # --------------------------------------------------------
    # Experience
    # --------------------------------------------------------

    if job.experience_level:

        score += 5

    # --------------------------------------------------------
    # Salary
    # --------------------------------------------------------

    if (
        job.salary and
        job.salary.lower() != "negotiable"
    ):

        score += 10

    # --------------------------------------------------------
    # Freshness
    # --------------------------------------------------------

    if job.posted_at:

        age = (
            datetime.now(job.posted_at.tzinfo)
            - job.posted_at
        ).days

        if age <= 7:

            score += 5

    return score, reasons