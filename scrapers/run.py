from Afriwork.scraper import AfriworkScraper
from EthioReporter.scraper import EthioReport
from Ethiojob.scraper import EthioJob
from GeezJobs.scraper import GeezJobsScraper
from linkedin.scraper import LinkedInJobsScraper
from Hahu.scraper import HaHuJobsScraper
from EthioNgoJobs.scraper import EthiNGOJobsScraper
from EthioJoborg.scraper import EthioJobsScraper
from EthioJobsInfo.scraper import EthioJobsInfoNGOScraper
from EthioAirlines.scraper import EthiopianAirlinesScraper

from telegram.EffoyJobs.scraper import TelegramChannelScraper
from telegram.Josad.scraper import JosadTelegramScraper
from telegram.ETcareers.scraper import EtcarrerTelegramScraper
from telegram.jobs_in_ethio.scraper import JobsEthioTelegramScraper
from telegram.NGOjobs.scraper import NgoJobEthiopiaTelegramScraper

from Safaricom.scraper import SafaricomEthiopiaScraper
from EthioTelecom.scraper import EthioTelecomScraper


from addskill import save_cache, SKILL_CACHE

import asyncio

from common.deduplication import is_probable_duplicate
from common.database import save_job


SCRAPERS = [
    # AfriworkScraper(),
    # EthioReport(),
    # EthioJob(),
    # GeezJobsScraper(),
    # LinkedInJobsScraper(),
    # EthiNGOJobsScraper(),
    # EthioJobsScraper(),
    # EthioJobsInfoNGOScraper(),


    # TelegramChannelScraper("effoyjobs"),
    # JosadTelegramScraper("josad_software"),
    # EtcarrerTelegramScraper("etcareersjobs"),
    # JobsEthioTelegramScraper("jobs_in_ethio"),

    # HaHuJobsScraper(),
    # NgoJobEthiopiaTelegramScraper(),


    EthiopianAirlinesScraper(),
    # SafaricomEthiopiaScraper(),
    # EthioTelecomScraper()
]


async def main():
    all_jobs = []

    for scraper in SCRAPERS:
        try:
            jobs = await scraper.run()
            print(f"{scraper.name}: {len(jobs)} jobs")
            all_jobs.extend(jobs)

        except Exception as e:
            print(f"{scraper.name} failed: {e}")

    print(f"\nTotal scraped jobs: {len(all_jobs)}")

    save_cache(SKILL_CACHE)

    # ----------------------------------------
    # Deduplicate current scraping run
    # ----------------------------------------

    unique_jobs = []
    duplicate_count = 0

    for job in all_jobs:

        duplicate = False

        for existing_job in unique_jobs:

            if is_probable_duplicate(job, existing_job):
                duplicate = True
                break

        if duplicate:
            duplicate_count += 1

            print(
                f"Duplicate skipped: "
                f"{getattr(job, 'title', 'Unknown')}"
            )

            continue

        unique_jobs.append(job)

    print("\n================================")
    print(f"Scraped jobs:    {len(all_jobs)}")
    print(f"Unique jobs:     {len(unique_jobs)}")
    print(f"Duplicates:      {duplicate_count}")
    print("================================")

    # ----------------------------------------
    # Save unique jobs
    # ----------------------------------------

    saved_count = 0

    for job in unique_jobs:

        try:
            save_job(job)
            saved_count += 1

        except Exception as e:
            print(
                f"Failed to save "
                f"{getattr(job, 'title', 'Unknown')}: {e}"
            )

    print(f"Saved jobs: {saved_count}")


if __name__ == "__main__":
    asyncio.run(main())