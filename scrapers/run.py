from Afriwork.scraper import AfriworkScraper
from common.database import save_job

SCRAPERS = [
    AfriworkScraper(),
]

def main():
    all_jobs = []

    for scraper in SCRAPERS:
        try:
            jobs = scraper.run()
            print(f"{scraper.name}: {len(jobs)} jobs")
            all_jobs.extend(jobs)
        except Exception as e:
            print(f"{scraper.name} failed: {e}")

    print(f"\nTotal jobs: {len(all_jobs)}")

    for job in all_jobs:
        save_job(job)

if __name__ == "__main__":
    main()