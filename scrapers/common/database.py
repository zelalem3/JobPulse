import os
import json
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:Scooponset1@localhost:5432/jobpulse"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


def save_job(job):
    if hasattr(job, "model_dump"):
        job = job.model_dump()
    session = SessionLocal()

    try:
        # 1. Insert/Update the job listing and return its database ID
        job_query = text("""
            INSERT INTO job_listings (
                title,
                location,
                requirements,
                description,
                employment_type,
                experience_level,
                salary,
                category,
                deadline,
                posted_at,
                source,
                url,
                is_active,
                created_at,
                updated_at
            )
            VALUES (
                :title,
                :location,
                :requirements,
                :description,
                :employment_type,
                :experience_level,
                :salary,
                :category,
                :deadline,
                :posted_at,
                :source,
                :url,
                true,
                NOW(),
                NOW()
            )
            ON CONFLICT (url)
            DO UPDATE SET
                title = EXCLUDED.title,
                location = EXCLUDED.location,
                requirements = EXCLUDED.requirements,
                description = EXCLUDED.description,
                employment_type = EXCLUDED.employment_type,
                experience_level = EXCLUDED.experience_level,
                salary = EXCLUDED.salary,
                category = EXCLUDED.category,
                deadline = EXCLUDED.deadline,
                posted_at = EXCLUDED.posted_at,
                updated_at = NOW()
            RETURNING id;
        """)

        job_data = {
            "title": job.get("title"),
            "location": job.get("location"),
            "requirements": job.get("requirements"),
            "description": job.get("description"),
            "employment_type": job.get("employment_type"),
            "experience_level": job.get("experience_level"),
            "salary": job.get("salary"),
            "category": job.get("category"),
            "deadline": job.get("deadline"),
            "posted_at": job.get("posted_at"),
            "source": job.get("source"),
            "url": job.get("url"),
        }

        # Run the insert and grab the primary key of the job
        result = session.execute(job_query, job_data)
        job_id = result.fetchone()[0]

        # 2. Process and map the skills
        skills = job.get("skills", [])
        skill_ids = []

        if skills:
            for skill_name in skills:
                clean_name = str(skill_name).strip()
                if not clean_name:
                    continue

                # Insert skill if missing, and grab its ID.
                # (Postgres returning ID on conflict trick)
                skill_query = text("""
                    INSERT INTO skills (name, created_at, updated_at)
                    VALUES (:name, NOW(), NOW())
                    ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
                    RETURNING id;
                """)
                
                skill_result = session.execute(skill_query, {"name": clean_name})
                skill_id = skill_result.fetchone()[0]
                skill_ids.append(skill_id)

        # 3. Clean up and update the pivot table (job_skill)
        # Clear existing relations for this job first to prevent leftovers
        session.execute(
            text("DELETE FROM job_skill WHERE job_listing_id = :job_listing_id;"),
            {"job_listing_id": job_id}
        )

        # Bulk insert the new active relationships
        if skill_ids:
            pivot_query = text("""
                INSERT INTO job_skill (job_listing_id, skill_id)
                VALUES (:job_listing_id, :skill_id)
                ON CONFLICT DO NOTHING;
            """)
            
            for skill_id in skill_ids:
                session.execute(pivot_query, {
                    "job_listing_id": job_id,
                    "skill_id": skill_id
                })

        session.commit()

    except Exception as e:
        session.rollback()
        print(f"DB Error: {e}")

    finally:
        session.close()