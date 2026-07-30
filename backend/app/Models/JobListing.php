import os
import psycopg2

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@postgres:5432/dbname")

def get_connection():
    return psycopg2.connect(DATABASE_URL)

def save_job(job_data):
    if hasattr(job_data, "dict"):
        data = job_data.dict()
    elif hasattr(job_data, "__dict__"):
        data = job_data.__dict__
    else:
        data = job_data

    # Ensure company_id is None or an integer, not a string like "Unknown"
    comp_id = data.get("company_id")
    if comp_id in ["Unknown", "", None]:
        comp_id = None
    else:
        try:
            comp_id = int(comp_id)
        except (ValueError, TypeError):
            comp_id = None

    safe_data = {
        "company_id": comp_id,
        "title": data.get("title"),
        "location": data.get("location"),
        "requirements": data.get("requirements"),
        "description": data.get("description"),
        "employment_type": data.get("employment_type"),
        "experience_level": data.get("experience_level"),
        "salary": data.get("salary", "Negotiable"),
        "category": data.get("category"),
        "deadline": data.get("deadline"),
        "posted_at": data.get("posted_at") or data.get("posted_date"),
        "source": data.get("source", "Afriwork"),
        "url": data.get("url"),
        "responsibilities": data.get("responsibilities"),
        "is_active": data.get("is_active", True),
        "quality_score": data.get("quality_score", 0),
    }

    query = """
        INSERT INTO job_listings (
            company_id, title, location, requirements, description, 
            employment_type, experience_level, salary, category, 
            deadline, posted_at, source, url, responsibilities, 
            is_active, quality_score, created_at, updated_at
        ) VALUES (
            %(company_id)s, %(title)s, %(location)s, %(requirements)s, %(description)s, 
            %(employment_type)s, %(experience_level)s, %(salary)s, %(category)s, 
            %(deadline)s, %(posted_at)s, %(source)s, %(url)s, %(responsibilities)s, 
            %(is_active)s, %(quality_score)s, NOW(), NOW()
        )
        ON CONFLICT (url) DO NOTHING;
    """
    
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(query, safe_data)
            inserted = cur.rowcount > 0
        conn.commit()
        return inserted
    except Exception as e:
        print(f"❌ Database insertion error: {e}")
        conn.rollback()
        raise e
    finally:
        conn.close()