import asyncio
import logging
from dotenv import load_dotenv
import psycopg2

# Scrapers
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
from common.deduplication import (
    is_probable_duplicate,
    prepare_dedup_data,
)

# Processing
from addskill import (
    SKILL_CACHE,
    _smart_local_extraction,
    extract_skills,
    save_cache,
)

from common.database import save_job, job_exists
from common.deduplication import is_probable_duplicate
from common.normalizer import normalize_job
from common.quality import quality_score
from common.validation import validate_job


load_dotenv()

logger = logging.getLogger(__name__)


# ==========================================================
# Configuration
# ==========================================================

MIN_QUALITY_SCORE = 40

GEMINI_FAILURE_THRESHOLD = 3


# ==========================================================
# Scrapers
# ==========================================================

SCRAPERS = [
    # AfriworkScraper(),
    # EthioReport(),
    # EthioJob(),
    # GeezJobsScraper(),
    # LinkedInJobsScraper(),
    # EthiNGOJobsScraper(),
    # EthioJobsScraper(),
    # EthioJobsInfoNGOScraper(),

    # JosadTelegramScraper("josad_software"),

    TelegramChannelScraper("effoyjobs"),
    # EtcarrerTelegramScraper("etcareersjobs"),
    # JobsEthioTelegramScraper("jobs_in_ethio"),
    # NgoJobEthiopiaTelegramScraper(),

    # HaHuJobsScraper(),
    # EthiopianAirlinesScraper(),
    # SafaricomEthiopiaScraper(),
    # EthioTelecomScraper(),
]





def get_candidate_jobs(
    job_dedup_data,
    jobs_by_company,
    prepared_unique_jobs,
):
    """
    Return a reduced set of jobs that are worth running
    through the expensive fuzzy duplicate detector.

    Company is the primary candidate key.

    If the company is unavailable, fall back to all jobs
    because the existing duplicate detector owns the final
    decision.
    """

    company = job_dedup_data.company

    if not company:
        return prepared_unique_jobs

    candidates = jobs_by_company.get(
        company,
        []
    )

    return candidates

# ==========================================================
# Main
# ==========================================================

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

            print(
                f"[{scraper.name}] {len(jobs)} jobs"
            )

            all_jobs.extend(jobs)

        except Exception as e:

            print(
                f"[{scraper.name}] FAILED"
            )

            logger.exception(e)

    print("\n===================================")
    print(
        f"Total scraped jobs: {len(all_jobs)}"
    )
    print("===================================")

    # ------------------------------------------------------
    # Cache checkpoint
    # ------------------------------------------------------

    save_cache(SKILL_CACHE)

    # ------------------------------------------------------
    # Processing
    # ------------------------------------------------------

    unique_jobs = []
    prepared_unique_jobs = []

    jobs_by_company = {}

    duplicate_count = 0
    database_duplicate_count = 0
    invalid_count = 0
    low_quality_count = 0

    # Gemini circuit breaker

    gemini_failure_count = 0
    gemini_disabled = False

    # ------------------------------------------------------
    # Process jobs
    # ------------------------------------------------------

    for job in all_jobs:

        # --------------------------------------------------
        # Normalize
        # --------------------------------------------------

        job = normalize_job(job)

        # --------------------------------------------------
        # Validate
        # --------------------------------------------------

        validation = validate_job(job)

        if not validation.valid:

            invalid_count += 1

            print("\n❌ Invalid Job")
            print(f"Title : {job.title}")

            for error in validation.errors:

                print(
                    f"   - {error}"
                )

            continue

        # --------------------------------------------------
        # Early database duplicate check
        #
        # This happens BEFORE Gemini.
        #
        # URL/hash lookup is cheap compared with
        # skill extraction.
        # --------------------------------------------------

        try:

            if job_exists(job):

                database_duplicate_count += 1

                print(
                    f"⏭️ Already exists in DB: "
                    f"{job.title}"
                )

                continue

        except Exception as e:

            # Do not silently discard a job if the
            # duplicate check itself fails.
            #
            # save_job() still performs the final
            # database duplicate protection.

            print(
                f"⚠️ Database duplicate check failed "
                f"for {job.title}: {e}"
            )

        # --------------------------------------------------
        # Skill extraction
        #
        # Only jobs that survived the cheap DB check
        # reach this point.
        # --------------------------------------------------

        try:

            desc = getattr(
                job,
                "description",
                "",
            )

            title = getattr(
                job,
                "title",
                "",
            )

            if gemini_disabled:

                job.skills = _smart_local_extraction(
                    desc,
                    title,
                    boost_weights=True,
                )

            else:

                try:

                    job.skills = extract_skills(
                        job_description_text=desc,
                        job_title=title,
                        boost_weights=True,
                    )

                except Exception as api_err:

                    gemini_failure_count += 1

                    print(
                        f"⚠️ Gemini API issue detected "
                        f"({gemini_failure_count}/"
                        f"{GEMINI_FAILURE_THRESHOLD}): "
                        f"{api_err}"
                    )

                    if (
                        gemini_failure_count
                        >= GEMINI_FAILURE_THRESHOLD
                    ):

                        print(
                            "🚨 Gemini API appears down "
                            "or unresponsive. Switching "
                            "to local skill extraction "
                            "for remaining jobs."
                        )

                        gemini_disabled = True

                    # Immediate fallback

                    job.skills = _smart_local_extraction(
                        desc,
                        title,
                        boost_weights=True,
                    )

        except Exception as e:

            print(
                f"⚠️ Critical skill extraction error "
                f"for {job.title}: {e}"
            )

            job.skills = []

        # --------------------------------------------------
        # Quality score
        # --------------------------------------------------

        score, reasons = quality_score(job)

        job.quality_score = score

        print(
            f"⭐ {score:02d}/100 - "
            f"{job.title} | "
            f"Skills: {len(job.skills)} detected"
        )

        if score < MIN_QUALITY_SCORE:

            low_quality_count += 1

            print(
                "   Low quality -> skipped"
            )

            continue


        # --------------------------------------------------
        # Current-run fuzzy duplicate detection
        #
        # Database URL/hash duplicates were already checked
        # before skill extraction using job_exists().
        #
        # Here we only compare jobs that survived the
        # database existence check.
        # --------------------------------------------------
        duplicate = False

        job_dedup_data = prepare_dedup_data(job)

        company_key = job_dedup_data.company

        candidate_jobs = get_candidate_jobs(
            job_dedup_data,
            jobs_by_company,
            prepared_unique_jobs,
        )

        for existing_job, existing_dedup_data in candidate_jobs:

            if is_probable_duplicate(
                job_dedup_data,
                existing_dedup_data,
            ):
                duplicate = True
                break

        # --------------------------------------------------
        # Index non-duplicate jobs
        # --------------------------------------------------

        if duplicate:
            duplicate_count += 1

            print(
                f"⏭️ Duplicate skipped: {job.title}"
            )

            continue

        unique_jobs.append(job)

        prepared_unique_jobs.append(
            (
                job,
                job_dedup_data,
            )
        )

        if company_key:
            jobs_by_company.setdefault(
                company_key,
                []
            ).append(
                (
                    job,
                    job_dedup_data,
                )
            )
        # --------------------------------------------------
        # Unique job for this run
        # --------------------------------------------------

        unique_jobs.append(job)
        prepared_unique_jobs.append(
        (
            job,
            job_dedup_data,
        )
        )
        if job_dedup_data.company:
            jobs_by_company.setdefault(
                job_dedup_data.company,
                []
            ).append(
                (
                    job,
                    job_dedup_data,
                )
    )

    # ======================================================
    # Processing Summary
    # ======================================================

    print("\n===================================")
    print("Processing Summary")
    print("===================================")

    print(
        f"Scraped Jobs          : "
        f"{len(all_jobs)}"
    )

    print(
        f"Invalid Jobs          : "
        f"{invalid_count}"
    )

    print(
        f"DB Duplicates         : "
        f"{database_duplicate_count}"
    )

    print(
        f"Low Quality           : "
        f"{low_quality_count}"
    )

    print(
        f"Current-run Duplicates: "
        f"{duplicate_count}"
    )

    print(
        f"Ready To Save         : "
        f"{len(unique_jobs)}"
    )

    print("===================================")

    # ======================================================
    # Save
    # ======================================================

    saved = 0
    failed = 0

    print("\nSaving jobs...\n")

    for job in unique_jobs:

        try:

            result = save_job(job)

            if result:

                saved += 1

            else:

                # save_job() returns None when the database
                # duplicate protection detects an existing job.

                duplicate_count += 1

        except Exception as e:

            failed += 1

            print(
                f"❌ Failed: {job.title}"
            )

            logger.exception(e)

    # ------------------------------------------------------
    # Final cache checkpoint
    # ------------------------------------------------------

    save_cache(SKILL_CACHE)

    # ======================================================
    # Finished
    # ======================================================

    print("\n===================================")
    print("Finished")
    print("===================================")

    print(
        f"Saved            : {saved}"
    )

    print(
        f"Failed           : {failed}"
    )

    print("===================================")


# ==========================================================
# Entry point
# ==========================================================

if __name__ == "__main__":

    asyncio.run(main())

