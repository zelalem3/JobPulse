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
    session = SessionLocal()

    try:
        query = text("""
            INSERT INTO job_listings (
                title,
                location,
                requirements,
                description,
                employment_type,
                experience_level,
                salary,
                category,
                skills,
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
                CAST(:skills AS json),
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
                skills = EXCLUDED.skills,
                deadline = EXCLUDED.deadline,
                posted_at = EXCLUDED.posted_at,
                updated_at = NOW();
        """)

        data = {
            "title": job.get("title"),
            "location": job.get("location"),
            "requirements": job.get("requirements"),
            "description": job.get("description"),
            "employment_type": job.get("employment_type"),
            "experience_level": job.get("experience_level"),
            "salary": job.get("salary"),
            "category": job.get("category"),
            "skills": json.dumps(job.get("skills", [])),
            "deadline": job.get("deadline"),
            "posted_at": job.get("posted_at"),
            "source": job.get("source"),
            "url": job.get("url"),
        }

        session.execute(query, data)
        session.commit()

    except Exception as e:
        session.rollback()
        print(f"DB Error: {e}")

    finally:
        session.close()