import os
import sys
import asyncio


SCRAPERS_ROOT = os.path.dirname(
    os.path.dirname(
        os.path.dirname(os.path.abspath(__file__))
    )
)

if SCRAPERS_ROOT not in sys.path:
    sys.path.insert(0, SCRAPERS_ROOT)


from scraper import job_scraper
from parser import parse_job
from common.database import save_job


async def main():
    print("Starting scraper...")
    jobs = await job_scraper()
    print(f"Found {len(jobs)} jobs. Parsing and saving...")
    
    for job in jobs:
        try:
            new_job = await parse_job(job)
            save_job(new_job)
        except Exception as e:
           
            print(f"Error processing job: {e}", file=sys.stderr)
            continue
            
    print("Scraping task complete.")

if __name__ == "__main__":
    asyncio.run(main())