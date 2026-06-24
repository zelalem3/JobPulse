import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# 1. Try to get the URL from Docker's environment settings.
# 2. Fall back to local localhost with your correct password if running outside Docker.
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:Scooponset1@localhost:5432/jobpulse"
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)




def save_job(job):
    session = SessionLocal()
    try:
        defaults = {
            "title": "Unknown Title",
            "company": "Unknown Company",
            "location": "Remote / Not Specified",
            "description": "",
            "requirements": "",
            "source": "Unknown",
            "url": job.get("source_url") or ""
        }
        
        full_job_data = {**defaults, **job}
        if "url" not in full_job_data and "source_url" in full_job_data:
            full_job_data["url"] = full_job_data["source_url"]

        # Removed created_at and updated_at entirely from the insert statement
        query = text("""
            INSERT INTO job_listings (title, company, location, description, requirements, source, url)
            VALUES (:title, :company, :location, :description, :requirements, :source, :url)
            ON CONFLICT (url) DO NOTHING;
        """)

        session.execute(query, full_job_data)
        session.commit()
    except Exception as e:
        session.rollback()
        print(f"Error saving job to database: {e}")
        raise e
    finally:
        session.close()