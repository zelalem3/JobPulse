from Afriwork.scraper import AfriworkScraper
from EthioReporter.scraper import EthioReport
from Ethiojob.scraper import EthioJob
from telegram.EffoyJobs.scraper import TelegramChannelScraper
import asyncio




from common.database import save_job

SCRAPERS = [
    # AfriworkScraper(),
    # EthioReport(),
    # EthioJob(),
    TelegramChannelScraper("effoyjobs")

]

async def main ():
    all_jobs = []

    for scraper in SCRAPERS:
        try:
            jobs = await scraper.run()
            print(f"{scraper.name}: {len(jobs)} jobs")
            all_jobs.extend(jobs)
        except Exception as e:
            print(f"{scraper.name} failed: {e}")

    print(f"\nTotal jobs: {len(all_jobs)}")

    for job in all_jobs:
        save_job(job)

if __name__ == "__main__":
    asyncio.run(main())