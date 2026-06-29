import json
import traceback
from datetime import datetime


def parse_job(job_data):
    """
    Parse an individual Afriwork job safely.
    Returns a clean dictionary or None.
    """

    if not isinstance(job_data, dict):
        print(f"Invalid job data: {job_data}")
        return None

    try:
        job_id = job_data.get("id")

        # -------------------------
        # Skills
        # -------------------------
        skills_array = []
        raw_skills = job_data.get("skill_requirements") or []

        if isinstance(raw_skills, list):
            for entry in raw_skills:
                if not isinstance(entry, dict):
                    continue

                skill = entry.get("skill")

                if isinstance(skill, dict):
                    skill_name = skill.get("name")
                    if skill_name:
                        skills_array.append(str(skill_name))

        # -------------------------
        # Category / Sector
        # -------------------------
        category_name = "Other"

        raw_sectors = job_data.get("sectors") or []

        if (
            isinstance(raw_sectors, list)
            and len(raw_sectors) > 0
            and isinstance(raw_sectors[0], dict)
        ):
            sector = raw_sectors[0].get("sector")

            if isinstance(sector, dict):
                category_name = sector.get("name") or "Other"

        # -------------------------
        # City
        # -------------------------
        location_city = "Addis Ababa"

        city_data = job_data.get("city")

        if isinstance(city_data, dict):
            location_city = city_data.get("name") or "Addis Ababa"

        # -------------------------
        # Company
        # -------------------------
        company_name = "Unknown Company"

        entity_data = job_data.get("entity")

        if isinstance(entity_data, dict):
            company_name = (
                entity_data.get("name")
                or "Unknown Company"
            )

        # -------------------------
        # Salary
        # -------------------------
        salary_text = "Negotiable"

        cents = job_data.get("compensation_amount_cents")
        currency = job_data.get(
            "compensation_currency"
        ) or "ETB"

        if cents is not None:
            try:
                salary_text = (
                    f"{float(cents) / 100:,.2f} "
                    f"{currency}"
                )
            except (TypeError, ValueError):
                pass

        # -------------------------
        # Job site
        # -------------------------
        job_site = job_data.get("job_site")

        location = "ONSITE"

        if isinstance(job_site, dict):
            location = (
                job_site.get("name")
                or "ONSITE"
            )
        elif isinstance(job_site, str):
            location = job_site

        # -------------------------
        # Employment type
        # -------------------------
        employment_type = job_data.get("job_type")

        if isinstance(employment_type, dict):
            employment_type = (
                employment_type.get("name")
            )

        # -------------------------
        # Posted date
        # -------------------------
        posted_at = (
            job_data.get("published_at")
            or job_data.get("created_at")
        )

        try:
            if posted_at:
                posted_at = datetime.fromisoformat(
                    posted_at.replace(
                        "Z",
                        "+00:00"
                    )
                )
        except Exception:
            pass

        # -------------------------
        # Return clean dictionary
        # -------------------------
        return {
            "title":
                job_data.get("title")
                or "Untitled Job",

            "company":
                company_name,

            "location":
                location,

            "specific_address":
                job_data.get("location")
                or location_city,

            "description":
                job_data.get("description")
                or "",

            "requirements":
                job_data.get(
                    "experience_level"
                ),

            "employment_type":
                employment_type,

            "experience_level":
                job_data.get(
                    "experience_level"
                ),

            "salary":
                salary_text,

            "category":
                category_name,

            "skills":
                skills_array,

            "deadline":
                job_data.get("deadline"),

            "posted_at":
                posted_at,

            "source":
                "Afriwork",

            "url":
                f"https://afriworket.com/jobs/{job_id}"
                if job_id
                else "https://afriworket.com/jobs",

            "vacancy_count":
                job_data.get(
                    "vacancy_count",
                    1,
                ),
        }

    except Exception:
        print(
            f"Failed parsing job ID "
            f"{job_data.get('id')}"
        )
        traceback.print_exc()
        print(
            json.dumps(
                job_data,
                indent=2,
                ensure_ascii=False,
            )
        )
        return None