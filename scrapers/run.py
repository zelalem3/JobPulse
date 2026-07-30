# from Afriwork.scraper import AfriworkScraper
# from EthioReporter.scraper import EthioReport
# from Ethiojob.scraper import EthioJob
# from GeezJobs.scraper import GeezJobsScraper
# from linkedin.scraper import LinkedInJobsScraper
# from Hahu.scraper import HaHuJobsScraper
# from EthioNgoJobs.scraper import EthiNGOJobsScraper
# from EthioJoborg.scraper import EthioJobsScraper
# from EthioJobsInfo.scraper import EthioJobsInfoNGOScraper
from EthioAirlines.scraper import EthiopianAirlinesScraper

# from telegram.EffoyJobs.scraper import TelegramChannelScraper
# from telegram.Josad.scraper import JosadTelegramScraper
# from telegram.ETcareers.scraper import EtcarrerTelegramScraper
# from telegram.jobs_in_ethio.scraper import JobsEthioTelegramScraper
# from telegram.NGOjobs.scraper import NgoJobEthiopiaTelegramScraper

# from Safaricom.scraper import SafaricomEthiopiaScraper
# from EthioTelecom.scraper import EthioTelecomScraper

from addskill import save_cache, SKILL_CACHE

from common.normalizer import normalize_job
from common.validation import validate_job
from common.quality import quality_score
from common.deduplication import is_probable_duplicate
from common.database import save_job



import asyncio

# ----------------------------------------------------------
# Configuration
# ----------------------------------------------------------

MIN_QUALITY_SCORE = 40

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
    # NgoJobEthiopiaTelegramScraper(),

    # HaHuJobsScraper(),

    EthiopianAirlinesScraper(),
    # SafaricomEthiopiaScraper(),
    # EthioTelecomScraper(),
]


async def main():

    all_jobs = []

    print("=" * 60)
    print("Starting JobPulse Scrapers")
    print("=" * 60)

    # ------------------------------------------------------
    # Run Scrapers
    # ------------------------------------------------------

    for scraper in SCRAPERS:

        try:

            print(f"\n[{scraper.name}] Running...")

            jobs = await scraper.run()

            print(f"[{scraper.name}] {len(jobs)} jobs")

            all_jobs.extend(jobs)

        except Exception as e:

            print(f"[{scraper.name}] FAILED")

            print(e)

    print("\n===================================")
    print(f"Total scraped jobs: {len(all_jobs)}")
    print("===================================")

    save_cache(SKILL_CACHE)

    # ------------------------------------------------------
    # Processing
    # ------------------------------------------------------

    unique_jobs = []

    duplicate_count = 0
    invalid_count = 0
    low_quality_count = 0

    for job in all_jobs:

        # ----------------------------------------------
        # Normalize
        # ----------------------------------------------

        job = normalize_job(job)

        # ----------------------------------------------
        # Validate
        # ----------------------------------------------

        validation = validate_job(job)

        if not validation.valid:

            invalid_count += 1

            print(f"\n❌ Invalid Job")

            print(f"Title : {job.title}")

            for error in validation.errors:
                print(f"   - {error}")

            continue

        # ----------------------------------------------
        # Quality Score
        # ----------------------------------------------

        score, reasons = quality_score(job)

        
        job.quality_score = score

        print(f"⭐ {score:02d}/100 - {job.title}")

        if score < MIN_QUALITY_SCORE:

            low_quality_count += 1

            print("   Low quality -> skipped")

            continue

        # ----------------------------------------------
        # Current-run duplicate detection
        # ----------------------------------------------

        duplicate = False

        for existing_job in unique_jobs:

            if is_probable_duplicate(job, existing_job):

                duplicate = True

                break

        if duplicate:

            duplicate_count += 1

            print(f"⏭️ Duplicate skipped: {job.title}")

            continue

        unique_jobs.append(job)

    # ------------------------------------------------------
    # Summary
    # ------------------------------------------------------

    print("\n===================================")
    print("Processing Summary")
    print("===================================")

    print(f"Scraped Jobs     : {len(all_jobs)}")
    print(f"Invalid Jobs     : {invalid_count}")
    print(f"Low Quality      : {low_quality_count}")
    print(f"Duplicates       : {duplicate_count}")
    print(f"Ready To Save    : {len(unique_jobs)}")

    print("===================================")

    # ------------------------------------------------------
    # Save
    # ------------------------------------------------------

    saved = 0
    failed = 0

    print("\nSaving jobs...\n")

    for job in unique_jobs:

        try:

            result = save_job(job)

            if result:

                saved += 1

            else:

                # save_job() returns None if database
                # duplicate was detected
                pass

        except Exception as e:

            failed += 1

            print(f"❌ Failed: {job.title}")

            print(e)

    print("\n===================================")
    print("Finished")
    print("===================================")

    print(f"Saved            : {saved}")
    print(f"Failed           : {failed}")

    print("===================================")


if __name__ == "__main__":
    asyncio.run(main())