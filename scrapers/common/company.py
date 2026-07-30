import re
import psycopg2
from difflib import SequenceMatcher

from common.db_connection import get_connection


# ============================================================
# Company normalization
# ============================================================

COMPANY_SUFFIXES = {
    "plc",
    "p l c",
    "inc",
    "ltd",
    "limited",
    "llc",
    "corp",
    "corporation",
    "co",
    "company",
}


def normalize_company_name(name):
    """
    Normalize a company name for matching.

    Examples:

        Safaricom Ethiopia PLC
        SAFARICOM ETHIOPIA
        Safaricom Ethiopia Plc.

    all become approximately:

        safaricom ethiopia
    """

    if not name:
        return ""

    name = str(name).lower().strip()

    # Replace & with and
    name = name.replace("&", " and ")

    # Remove URLs
    name = re.sub(
        r"https?://\S+",
        " ",
        name,
    )

    # Remove punctuation
    name = re.sub(
        r"[^\w\s]",
        " ",
        name,
    )

    # Normalize whitespace
    name = re.sub(
        r"\s+",
        " ",
        name,
    ).strip()

    # Remove common company suffixes
    words = name.split()

    while words and words[-1] in COMPANY_SUFFIXES:
        words.pop()

    return " ".join(words).strip()


# ============================================================
# Similarity
# ============================================================

def company_similarity(name1, name2):
    normalized1 = normalize_company_name(name1)
    normalized2 = normalize_company_name(name2)

    if not normalized1 or not normalized2:
        return 0.0

    return SequenceMatcher(
        None,
        normalized1,
        normalized2,
    ).ratio()


# ============================================================
# Find existing company
# ============================================================

def find_company(name):
    """
    Find an existing company.

    Matching strategy:

    1. Exact normalized name
    2. Fuzzy name comparison
    """

    normalized_name = normalize_company_name(name)

    if not normalized_name:
        return None

    conn = get_connection()

    try:

        with conn.cursor() as cur:

            # ------------------------------------------------
            # First: fetch companies
            # ------------------------------------------------

            cur.execute(
                """
                SELECT id, name
                FROM companies
                ORDER BY id
                """
            )

            companies = cur.fetchall()

    finally:
        conn.close()

    # ========================================================
    # Exact normalized match
    # ========================================================

    for company_id, company_name in companies:

        if (
            normalize_company_name(company_name)
            == normalized_name
        ):
            return company_id

    # ========================================================
    # Fuzzy match
    # ========================================================

    best_id = None
    best_score = 0.0

    for company_id, company_name in companies:

        score = company_similarity(
            name,
            company_name,
        )

        if score > best_score:
            best_score = score
            best_id = company_id

    # Only automatically merge highly similar names.
    if best_score >= 0.92:
        return best_id

    return None


# ============================================================
# Create company
# ============================================================

def create_company(
    name,
    website=None,
    description=None,
    logo=None,
):
    """
    Create a new company and return its ID.
    """

    clean_name = str(name).strip()

    if not clean_name:
        return None

    conn = get_connection()

    try:

        with conn.cursor() as cur:

            cur.execute(
                """
                INSERT INTO companies (
                    name,
                    description,
                    website,
                    logo,
                    created_at,
                    updated_at
                )
                VALUES (
                    %s,
                    %s,
                    %s,
                    %s,
                    NOW(),
                    NOW()
                )
                RETURNING id
                """,
                (
                    clean_name,
                    description,
                    website,
                    logo,
                ),
            )

            company_id = cur.fetchone()[0]

        conn.commit()

        print(
            f"🏢 New company created: "
            f"{clean_name} (ID: {company_id})"
        )

        return company_id

    except psycopg2.errors.UniqueViolation:

        # Another scraper/process may have created
        # the same company at the same time.
        conn.rollback()

        with conn.cursor() as cur:

            cur.execute(
                """
                SELECT id
                FROM companies
                WHERE LOWER(name) = LOWER(%s)
                LIMIT 1
                """,
                (clean_name,),
            )

            row = cur.fetchone()

            if row:
                return row[0]

        return None

    except Exception as e:

        conn.rollback()

        print(
            f"❌ Company creation error: {e}"
        )

        return None

    finally:
        conn.close()


# ============================================================
# Resolve company
# ============================================================

def resolve_company(
    name,
    website=None,
    description=None,
    logo=None,
):
    """
    Find an existing company or create a new one.

    Returns company_id.
    """

    if not name:
        return None

    clean_name = str(name).strip()

    if not clean_name:
        return None

    # Don't create garbage companies.
    invalid_names = {
        "unknown",
        "n/a",
        "na",
        "none",
        "null",
        "-",
        "company",
    }

    if clean_name.lower() in invalid_names:
        return None

    # --------------------------------------------------------
    # Search existing company
    # --------------------------------------------------------

    company_id = find_company(
        clean_name
    )

    if company_id:
        return company_id

    # --------------------------------------------------------
    # Create company
    # --------------------------------------------------------

    return create_company(
        name=clean_name,
        website=website,
        description=description,
        logo=logo,
    )