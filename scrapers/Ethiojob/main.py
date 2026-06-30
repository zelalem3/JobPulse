from scrapers.Ethiojob.scraper import get_job_links
from scrapers.Ethiojob.parser import parse_job
import os
import sys



SCRAPERS_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


if SCRAPERS_ROOT not in sys.path:
    sys.path.insert(0, SCRAPERS_ROOT)

from common.database import save_job


def main():
    links = get_job_links()

    print(f"Found {len(links)} jobs")

    for link in links:
        try:
            job = parse_job(link)

            if not job["title"]:
                continue

            save_job(job)

            print(f"Saved: {job['title']}")

        except Exception as e:
            print(f"Failed: {link}")
            print(e)


if __name__ == "__main__":
    main()