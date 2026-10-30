#!/usr/bin/env python3
"""
Find near-duplicate job_listings and deactivate the weaker copy.

Usage:
    python cleanup_duplicates.py              # dry-run (default)
    python cleanup_duplicates.py --apply      # actually set is_active = false
    python cleanup_duplicates.py --ids 32297 32380   # only check these two
"""

import argparse
from collections import defaultdict

from common.db_connection import get_connection
from common.deduplication import (
    prepare_dedup_data,
    is_probable_duplicate,
    text_similarity,
)


def quality(job_row):
    """Higher = prefer to keep this row."""
    desc_len = len(job_row.get("description") or "")
    req_len = len(job_row.get("requirements") or "")
    has_company = 1 if job_row.get("company_id") else 0
    has_posted = 1 if job_row.get("posted_at") else 0
    # Prefer longer description, then company, then posted_at
    return (desc_len, req_len, has_company, has_posted, job_row["id"])


def fetch_active_jobs(conn, only_ids=None):
    with conn.cursor() as cur:
        if only_ids:
            cur.execute(
                """
                SELECT id, title, location, description, requirements,
                       responsibilities, deadline, posted_at, source, url,
                       company_id, dedup_hash, is_active
                FROM job_listings
                WHERE id = ANY(%s)
                """,
                (only_ids,),
            )
        else:
            cur.execute(
                """
                SELECT id, title, location, description, requirements,
                       responsibilities, deadline, posted_at, source, url,
                       company_id, dedup_hash, is_active
                FROM job_listings
                WHERE is_active = true
                ORDER BY id
                """
            )
        cols = [d[0] for d in cur.description]
        return [dict(zip(cols, row)) for row in cur.fetchall()]


def to_job_dict(row):
    """Shape the row so prepare_dedup_data can consume it."""
    return {
        "title": row["title"],
        "company": "",  # company name not stored on job_listings; we use company_id only for quality
        "location": row["location"],
        "description": row["description"],
        "requirements": row["requirements"],
        "responsibilities": row["responsibilities"],
        "deadline": row["deadline"],
        "posted_at": row["posted_at"],
        "url": row["url"],
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Actually deactivate duplicates")
    parser.add_argument("--ids", nargs="+", type=int, help="Only check these job IDs")
    args = parser.parse_args()

    conn = get_connection()
    try:
        jobs = fetch_active_jobs(conn, only_ids=args.ids)
        print(f"Loaded {len(jobs)} active jobs")

        # Precompute DedupData
        prepared = []
        for row in jobs:
            jd = to_job_dict(row)
            # Pull company name if possible (optional improvement)
            if row.get("company_id"):
                with conn.cursor() as cur:
                    cur.execute("SELECT name FROM companies WHERE id = %s", (row["company_id"],))
                    r = cur.fetchone()
                    if r:
                        jd["company"] = r[0]
            data = prepare_dedup_data(jd)
            prepared.append((row, data))

        to_deactivate = []  # list of (loser_id, winner_id, reason)

        # Compare within same title-prefix buckets to keep it fast
        buckets = defaultdict(list)
        for row, data in prepared:
            key = (data.title[:40] if data.title else "") or str(row["id"])
            buckets[key].append((row, data))

        for key, group in buckets.items():
            if len(group) < 2:
                continue
            for i in range(len(group)):
                for j in range(i + 1, len(group)):
                    row_a, data_a = group[i]
                    row_b, data_b = group[j]

                    if not is_probable_duplicate(data_a, data_b):
                        continue

                    # Decide which one to keep
                    if quality(row_a) >= quality(row_b):
                        winner, loser = row_a, row_b
                    else:
                        winner, loser = row_b, row_a

                    reason = (
                        f"title≈{text_similarity(data_a.title, data_b.title):.2f} "
                        f"company≈{text_similarity(data_a.company or '', data_b.company or ''):.2f}"
                    )
                    to_deactivate.append((loser["id"], winner["id"], reason))

        # Deduplicate losers (a job might match multiple winners)
        seen_losers = set()
        unique_actions = []
        for loser_id, winner_id, reason in to_deactivate:
            if loser_id in seen_losers:
                continue
            seen_losers.add(loser_id)
            unique_actions.append((loser_id, winner_id, reason))

        print(f"\nFound {len(unique_actions)} near-duplicates to deactivate:\n")
        for loser_id, winner_id, reason in unique_actions:
            print(f"  deactivate #{loser_id}  →  keep #{winner_id}  ({reason})")

        if not unique_actions:
            print("Nothing to do.")
            return

        if not args.apply:
            print("\nDry-run only. Re-run with --apply to deactivate.")
            return

        with conn.cursor() as cur:
            for loser_id, winner_id, _ in unique_actions:
                cur.execute(
                    """
                    UPDATE job_listings
                    SET is_active = false, updated_at = NOW()
                    WHERE id = %s AND is_active = true
                    """,
                    (loser_id,),
                )
            conn.commit()
        print(f"\nDeactivated {len(unique_actions)} listings.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()