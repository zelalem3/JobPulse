import os
import psycopg2

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@postgres:5432/dbname")

def get_connection():
    return psycopg2.connect(DATABASE_URL)