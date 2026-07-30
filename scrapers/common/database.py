from common.company import resolve_company
from common.db_connection import get_connection


def save_job(job_data):
  """Resolves the company name to a valid database ID, then inserts the job listing

  into the Laravel 'job_listings' table. Ignores the insert if the URL already
  exists.
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
    company_id = resolve_company(raw_company_name)

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
      # Set a 5-second statement timeout so the query aborts instead of hanging forever
      cur.execute("SET statement_timeout = 5000;")
      cur.execute(query, safe_data)
      inserted = cur.rowcount > 0
    conn.commit()
    return inserted
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