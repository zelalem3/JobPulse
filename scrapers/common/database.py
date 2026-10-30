import json
from common.company import resolve_company
from common.db_connection import get_connection
from common.deduplication import (
    normalize_url,
    generate_dedup_hash,
    prepare_dedup_data,
    is_probable_duplicate,
    normalized_title,
)
import psycopg2

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

    dedup_hash = generate_dedup_hash(job_data)

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
        "dedup_hash": dedup_hash,
        "responsibilities": data.get("responsibilities"),
        "is_active": data.get("is_active", True),
        "quality_score": data.get("quality_score", 0),
    }
    # Query without 'skills' column
    query = """
        INSERT INTO job_listings (
            company_id,
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
            dedup_hash,
            responsibilities,
            is_active,
            quality_score,
            created_at,
            updated_at
        )
        VALUES (
            %(company_id)s,
            %(title)s,
            %(location)s,
            %(requirements)s,
            %(description)s,
            %(employment_type)s,
            %(experience_level)s,
            %(salary)s,
            %(category)s,
            %(deadline)s,
            %(posted_at)s,
            %(source)s,
            %(url)s,
            %(dedup_hash)s,
            %(responsibilities)s,
            %(is_active)s,
            %(quality_score)s,
            NOW(),
            NOW()
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


def job_exists(job) -> bool:
    """
    Return True if this job is already in the DB.

    Checks:
      1. Exact URL
      2. Exact dedup_hash
      3. Fuzzy match against recent jobs (active OR inactive within 30 days)
    """
    def _get(obj, field, default=None):
        if isinstance(obj, dict):
            return obj.get(field, default)
        return getattr(obj, field, default)

    url = normalize_url(_get(job, "url"))
    dedup_hash = generate_dedup_hash(job)
    title = normalized_title(job)

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            # 1) Exact URL
            if url:
                cur.execute(
                    """
                    SELECT id
                    FROM job_listings
                    WHERE url = %s
                    LIMIT 1
                    """,
                    (url,),
                )
                if cur.fetchone():
                    return True

            # 2) Exact content hash
            cur.execute(
                """
                SELECT id
                FROM job_listings
                WHERE dedup_hash = %s
                LIMIT 1
                """,
                (dedup_hash,),
            )
            if cur.fetchone():
                return True

            # 3) Fuzzy: similar title among recent jobs (active + recent inactive)
            if not title or len(title) < 3:
                return False

            title_prefix = title[:50]

            cur.execute(
                """
                SELECT
                    jl.id,
                    jl.title,
                    jl.location,
                    jl.description,
                    jl.requirements,
                    jl.responsibilities,
                    jl.deadline,
                    jl.posted_at,
                    jl.source,
                    jl.url,
                    jl.company_id,
                    c.name AS company_name
                FROM job_listings jl
                LEFT JOIN companies c ON c.id = jl.company_id
                WHERE (
                        jl.is_active = true
                     OR jl.updated_at > NOW() - INTERVAL '30 days'
                     OR jl.created_at > NOW() - INTERVAL '30 days'
                  )
                  AND (
                        lower(jl.title) LIKE %s
                     OR lower(jl.title) LIKE %s
                  )
                ORDER BY jl.is_active DESC, jl.created_at DESC
                LIMIT 50
                """,
                (f"%{title_prefix}%", f"%{title[:30]}%"),
            )
            rows = cur.fetchall()
            if not rows:
                return False

            cols = [d[0] for d in cur.description]
            candidates = [dict(zip(cols, r)) for r in rows]

            new_data = prepare_dedup_data(job)

            for c in candidates:
                existing = {
                    "title": c["title"],
                    "company": c.get("company_name") or "",
                    "location": c["location"],
                    "description": c["description"],
                    "requirements": c["requirements"],
                    "responsibilities": c["responsibilities"],
                    "deadline": c["deadline"],
                    "posted_at": c["posted_at"],
                    "url": c["url"],
                }
                if is_probable_duplicate(new_data, existing):
                    print(
                        f"⏭️ Fuzzy DB duplicate of #{c['id']}: "
                        f"{_get(job, 'title')}"
                    )
                    return True

            return False
    finally:
        try:
            conn.close()
        except Exception:
            pass