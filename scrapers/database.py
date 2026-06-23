import os
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@postgres:5432/dbname")

def get_connection():
    return psycopg2.connect(DATABASE_URL)

def save_job(job_data):
    """Inserts a job listing or ignores it if the URL already exists."""
    query = """
        INSERT      """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(query, job_data)
        conn.commit()
    except Exception as e:
        print(f"❌ Database insertion error: {e}")
        conn.rollback()
    finally:
        conn.close()