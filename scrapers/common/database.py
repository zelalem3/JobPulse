import json
from common.company import resolve_company
from common.db_connection import get_connection

def save_job(job_data):
    """
    Resolves the company name to a valid database ID, then inserts the job listing 
    into the Laravel 'job_listings' table, and links its skills via the 'job_skill' pivot table.
    """
    if hasattr(job_data, "dict"):
        data = job_data.dict()
    elif hasattr(job_data, "__dict__"):
        data = job_data.__dict__
    else:
        data = job_data

    raw_company_name = data.get("company") or data.get("company_name")
    
    company_id = None
    if raw_company_name:
        try:
            company_id = resolve_company(raw_company_name)
        except Exception as ce:
            print(f"\n⚠️ Company resolution warning for '{raw_company_name}': {ce}")

    safe_data = {
        "company_id": company_id,
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
        "source": data.get("source", "Ethiopian Airlines"),
        "url": data.get("url"),
        "responsibilities": data.get("responsibilities"),
        "is_active": data.get("is_active", True),
        "quality_score": data.get("quality_score", 0),
    }

    # Query without 'skills' column
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
        ON CONFLICT (url) DO UPDATE 
        SET updated_at = NOW()
        RETURNING id;
    """
    
    conn = get_connection()
    try:
        job_id = None
        with conn.cursor() as cur:
            cur.execute("SET statement_timeout = 5000;")
            cur.execute(query, safe_data)
            row = cur.fetchone()
            if row:
                job_id = row[0]
        
        conn.commit()

        # Handle skills attachment if job was saved/retrieved
        skills_list = data.get("skills", [])
        if job_id and skills_list:
            save_job_skills(conn, job_id, skills_list)

        return job_id is not None
    except Exception as e:
        print(f"\n❌ Database insertion error for URL {safe_data.get('url')}: {e}")
        try:
            conn.rollback()
        except Exception:
            pass
        return False
    finally:
        try:
            conn.close()
        except Exception:
            pass

def save_job_skills(conn, job_id, skills_list):
    """
    Ensures skills exist in the 'skills' table and links them to the job via 'job_skill'.
    """
    try:
        with conn.cursor() as cur:
            for skill_name in skills_list:
                clean_skill = str(skill_name).strip()
                if not clean_skill:
                    continue
                
                # 1. Insert skill if not exists, or get its ID
                cur.execute(
                    """
                    INSERT INTO skills (name, created_at, updated_at)
                    VALUES (%s, NOW(), NOW())
                    ON CONFLICT (name) DO UPDATE SET updated_at = NOW()
                    RETURNING id;
                    """,
                    (clean_skill,)
                )
                skill_row = cur.fetchone()
                if not skill_row:
                    # Fallback lookup if conflict didn't return id on some pg versions
                    cur.execute("SELECT id FROM skills WHERE name = %s", (clean_skill,))
                    skill_row = cur.fetchone()
                
                if skill_row:
                    skill_id = skill_row[0]
                    
                    # 2. Link job and skill in pivot table
                    cur.execute(
                        """
                        INSERT INTO job_skill (job_listing_id, skill_id, created_at, updated_at)
                        VALUES (%s, %s, NOW(), NOW())
                        ON CONFLICT DO NOTHING;
                        """,
                        (job_id, skill_id)
                    )
        conn.commit()
    except Exception as skill_err:
        print(f"\n⚠️ Warning: Failed to save skills for job ID {job_id}: {skill_err}")
        conn.rollback()