import os
import sys
import asyncio
from pathlib import Path
from telethon import TelegramClient
from dotenv import load_dotenv


SCRAPERS_ROOT = os.path.dirname(
    os.path.dirname(
        os.path.dirname(os.path.abspath(__file__))
    )
)
if SCRAPERS_ROOT not in sys.path:
    sys.path.append(SCRAPERS_ROOT)


from parser import parse_job
from common.database import save_job


load_dotenv()

api_id = os.getenv("API_ID")
api_hash = os.getenv("API_HASH")


client = TelegramClient("jobpulse", api_id, api_hash)


from scraper import job_scraper

async def main():
    print("Starting scraper...")
    
    
    jobs = await job_scraper(client)
    
    print(f"Found {len(jobs)} jobs. Parsing and saving...")
    
    for job in jobs:
        try:
            new_job = await parse_job(job)
            save_job(new_job)
            print("Saved successfully")
        except Exception as e:
            print(f"Error processing job: {e}", file=sys.stderr)
            continue
            
    print("Scraping task complete.")

if __name__ == "__main__":
    asyncio.run(main())