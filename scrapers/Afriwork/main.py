from scraper import get_all_jobs
from parser import parse_job
import os
import sys



SCRAPERS_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


if SCRAPERS_ROOT not in sys.path:
    sys.path.insert(0, SCRAPERS_ROOT)

from common.database import save_job


def main():
    jobs = get_all_jobs()

    print(f"Found {len(jobs)} jobs")

    for job in jobs:
        try:
            job = parse_job(job)

            if not job["title"]:
                continue

            save_job(job)

            print(f"Saved: {job['title']}")

        except Exception as e:
            print(f"Failed: {link}")
            print(e)


if __name__ == "__main__":
    main()