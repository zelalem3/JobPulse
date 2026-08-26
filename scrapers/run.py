import asyncio
import logging

from dotenv import load_dotenv

# ==========================================================
# Scrapers
# ==========================================================

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

# ==========================================================
# Processing
# ==========================================================

from addskill import (
    SKILL_CACHE,
    _smart_local_extraction,
    extract_skills,
    save_cache,
)

from common.database import (
    save_job,
    job_exists,
)

from common.deduplication import (
    is_probable_duplicate,
    prepare_dedup_data,
)

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

# Maximum number of scraper tasks allowed to run at once.
#
# This prevents accidentally overwhelming Telegram/websites
# if many scrapers are enabled later.
MAX_CONCURRENT_SCRAPERS = 5


# ==========================================================
# Scrapers
# ==========================================================

SCRAPERS = [
    AfriworkScraper(),
    EthioReport(),
    EthioJob(),
    GeezJobsScraper(),
    LinkedInJobsScraper(),
    EthiNGOJobsScraper(),
    EthioJobsScraper(),
    EthioJobsInfoNGOScraper(),

    TelegramChannelScraper("effoyjobs"),

    JosadTelegramScraper("josad_software"),
    EtcarrerTelegramScraper("etcareersjobs"),
    JobsEthioTelegramScraper("jobs_in_ethio"),
    NgoJobEthiopiaTelegramScraper(),

    HaHuJobsScraper(),
    EthiopianAirlinesScraper(),
    SafaricomEthiopiaScraper(),
    EthioTelecomScraper(),
]


# ==========================================================
# Helpers
# ==========================================================

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

    return jobs_by_company.get(
        company,
        [],
    )


async def run_scraper(scraper, semaphore):
    """
    Run one scraper asynchronously and safely.

    The semaphore prevents too many external scraper
    operations from running at the same time.
    """

    async with semaphore:

        try:
            print(
                f"\n[{scraper.name}] Running..."
            )

            jobs = await scraper.run()

            if jobs is None:
                jobs = []

            print(
                f"[{scraper.name}] "
                f"{len(jobs)} jobs"
            )

            return jobs

        except Exception as e:

            print(
                f"[{scraper.name}] FAILED: {e}"
            )

            logger.exception(
                "Scraper %s failed",
                scraper.name,
            )

            return []


async def run_all_scrapers():
    """
    Run all configured scrapers concurrently.

    Each scraper is isolated so that one failure does not
    stop the other scrapers.
    """

    if not SCRAPERS:
        return []

    semaphore = asyncio.Semaphore(
        MAX_CONCURRENT_SCRAPERS
    )

    print(
        f"\nStarting {len(SCRAPERS)} scraper(s)..."
    )

    results = await asyncio.gather(
        *(
            run_scraper(
                scraper,
                semaphore,
            )
            for scraper in SCRAPERS
        )
    )

    all_jobs = []

    for scraper_jobs in results:
        all_jobs.extend(scraper_jobs)

    return all_jobs


# ==========================================================
# Main
# ==========================================================

async def main():

    print("=" * 60)
    print("Starting JobPulse Scrapers")
    print("=" * 60)

    # ======================================================
    # Run Scrapers Concurrently
    # ======================================================

    all_jobs = await run_all_scrapers()

    print("\n===================================")
    print(
        f"Total scraped jobs: {len(all_jobs)}"
    )
    print("===================================")

    if not all_jobs:
        print(
            "\nNo jobs were scraped."
        )

        # Still save the cache because extraction may have
        # modified it during previous operations.
        save_cache(SKILL_CACHE)

        return

    # ======================================================
    # Cache Checkpoint
    # ======================================================

    save_cache(SKILL_CACHE)

    # ======================================================
    # Processing State
    # ======================================================

    unique_jobs = []

    prepared_unique_jobs = []

    jobs_by_company = {}

    duplicate_count = 0

    database_duplicate_count = 0

    invalid_count = 0

    low_quality_count = 0

    # ======================================================
    # Gemini Circuit Breaker
    # ======================================================

    gemini_failure_count = 0

    gemini_disabled = False

    # ======================================================
    # Process Jobs
    #
    # This stage intentionally remains controlled/sequential.
    #
    # Reasons:
    #
    # - SKILL_CACHE is shared state
    # - Gemini circuit breaker is shared state
    # - current-run deduplication is shared state
    # - job_exists() uses the database
    # - save_job() uses the database
    #
    # We can optimize individual blocking operations later
    # once common.database.py and addskill.py are reviewed.
    # ======================================================

    for index, job in enumerate(
        all_jobs,
        start=1,
    ):

        print(
            f"\n[{index}/{len(all_jobs)}] "
            f"Processing job..."
        )

        # ==================================================
        # Normalize
        # ==================================================

        try:

            job = normalize_job(job)

        except Exception as e:

            invalid_count += 1

            print(
                f"❌ Normalization failed "
                f"for job: {e}"
            )

            logger.exception(
                "Job normalization failed"
            )

            continue

        # ==================================================
        # Validate
        # ==================================================

        try:

            validation = validate_job(job)

        except Exception as e:

            invalid_count += 1

            print(
                f"❌ Validation crashed "
                f"for {getattr(job, 'title', 'Unknown')}: "
                f"{e}"
            )

            logger.exception(
                "Job validation failed"
            )

            continue

        if not validation.valid:

            invalid_count += 1

            print("\n❌ Invalid Job")

            print(
                f"Title : "
                f"{getattr(job, 'title', 'Unknown')}"
            )

            for error in validation.errors:

                print(
                    f"   - {error}"
                )

            continue

        # ==================================================
        # Early Database Duplicate Check
        #
        # This happens BEFORE skill extraction.
        #
        # URL/hash lookup is cheaper than Gemini.
        # ==================================================

        try:

            if job_exists(job):

                database_duplicate_count += 1

                print(
                    f"⏭️ Already exists in DB: "
                    f"{job.title}"
                )

                continue

        except Exception as e:

            # Do not silently discard the job if the
            # duplicate check itself fails.
            #
            # save_job() still provides the final
            # database-level protection.

            print(
                f"⚠️ Database duplicate check failed "
                f"for {job.title}: {e}"
            )

            logger.exception(
                "Database duplicate check failed "
                "for %s",
                job.title,
            )

        # ==================================================
        # Skill Extraction
        # ==================================================

        try:

            desc = getattr(
                job,
                "description",
                "",
            ) or ""

            title = getattr(
                job,
                "title",
                "",
            ) or ""

            # ----------------------------------------------
            # Local fallback mode
            # ----------------------------------------------

            if gemini_disabled:

                job.skills = _smart_local_extraction(
                    desc,
                    title,
                    boost_weights=True,
                )

            # ----------------------------------------------
            # Gemini extraction
            # ----------------------------------------------

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

                    logger.exception(
                        "Gemini skill extraction failed"
                    )

                    # --------------------------------------
                    # Switch permanently to local extraction
                    # for the remainder of this run after
                    # repeated failures.
                    # --------------------------------------

                    if (
                        gemini_failure_count
                        >= GEMINI_FAILURE_THRESHOLD
                    ):

                        print(
                            "🚨 Gemini API appears down "
                            "or unresponsive."
                        )

                        print(
                            "   Switching to local skill "
                            "extraction for remaining jobs."
                        )

                        gemini_disabled = True

                    # --------------------------------------
                    # Always recover the current job using
                    # local extraction.
                    # --------------------------------------

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

            logger.exception(
                "Critical skill extraction error "
                "for %s",
                job.title,
            )

            job.skills = []

        # ==================================================
        # Normalize Skills
        #
        # Defensive cleanup so downstream matching does not
        # receive None.
        # ==================================================

        if job.skills is None:
            job.skills = []

        # ==================================================
        # Quality Score
        # ==================================================

        try:

            score, reasons = quality_score(job)

            job.quality_score = score

        except Exception as e:

            print(
                f"⚠️ Quality scoring failed "
                f"for {job.title}: {e}"
            )

            logger.exception(
                "Quality scoring failed"
            )

            job.quality_score = 0

            score = 0

            reasons = []

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

        # ==================================================
        # Current-Run Fuzzy Duplicate Detection
        #
        # Database URL/hash duplicates were already checked
        # before skill extraction.
        #
        # Here we only compare jobs that survived the
        # database existence check.
        # ==================================================

        duplicate = False

        try:

            job_dedup_data = prepare_dedup_data(
                job
            )

            company_key = job_dedup_data.company

            candidate_jobs = get_candidate_jobs(
                job_dedup_data,
                jobs_by_company,
                prepared_unique_jobs,
            )

            for (
                existing_job,
                existing_dedup_data,
            ) in candidate_jobs:

                if is_probable_duplicate(
                    job_dedup_data,
                    existing_dedup_data,
                ):

                    duplicate = True

                    break

        except Exception as e:

            print(
                f"⚠️ Deduplication failed "
                f"for {job.title}: {e}"
            )

            logger.exception(
                "Deduplication failed "
                "for %s",
                job.title,
            )

            # We don't discard the job because of a
            # deduplication failure. The database layer
            # remains the final protection.

            try:

                job_dedup_data = prepare_dedup_data(
                    job
                )

                company_key = (
                    job_dedup_data.company
                )

            except Exception:

                job_dedup_data = None

                company_key = None

        # ==================================================
        # Duplicate
        # ==================================================

        if duplicate:

            duplicate_count += 1

            print(
                f"⏭️ Duplicate skipped: "
                f"{job.title}"
            )

            continue

        # ==================================================
        # Unique Job For This Run
        #
        # IMPORTANT:
        # This block used to appear twice in your file.
        # It should only happen once.
        # ==================================================

        unique_jobs.append(job)

        if job_dedup_data is not None:

            prepared_unique_jobs.append(
                (
                    job,
                    job_dedup_data,
                )
            )

            if company_key:

                jobs_by_company.setdefault(
                    company_key,
                    [],
                ).append(
                    (
                        job,
                        job_dedup_data,
                    )
                )

        else:

            print(
                f"⚠️ Job accepted without "
                f"dedup index: {job.title}"
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

    print(
        f"Gemini Disabled       : "
        f"{'YES' if gemini_disabled else 'NO'}"
    )

    print("===================================")

    # ======================================================
    # Save
    # ======================================================

    saved = 0

    failed = 0

    print("\nSaving jobs...\n")

    for index, job in enumerate(
        unique_jobs,
        start=1,
    ):

        print(
            f"[{index}/{len(unique_jobs)}] "
            f"Saving: {job.title}"
        )

        try:

            result = save_job(job)

            if result:

                saved += 1

            else:

                # save_job() returns None when the database
                # duplicate protection detects an existing job.

                duplicate_count += 1

                print(
                    f"⏭️ Database duplicate: "
                    f"{job.title}"
                )

        except Exception as e:

            failed += 1

            print(
                f"❌ Failed: {job.title}"
            )

            print(
                f"   Error: {e}"
            )

            logger.exception(
                "Failed saving job %s",
                job.title,
            )

    # ======================================================
    # Final Cache Checkpoint
    # ======================================================

    try:

        save_cache(SKILL_CACHE)

    except Exception as e:

        print(
            f"⚠️ Failed to save skill cache: {e}"
        )

        logger.exception(
            "Failed to save skill cache"
        )

    # ======================================================
    # Finished
    # ======================================================

    print("\n===================================")
    print("Finished")
    print("===================================")

    print(
        f"Scraped          : {len(all_jobs)}"
    )

    print(
        f"Saved            : {saved}"
    )

    print(
        f"Failed           : {failed}"
    )

    print(
        f"DB Duplicates    : "
        f"{database_duplicate_count}"
    )

    print(
        f"Run Duplicates   : "
        f"{duplicate_count}"
    )

    print(
        f"Low Quality      : "
        f"{low_quality_count}"
    )

    print(
        f"Invalid          : "
        f"{invalid_count}"
    )

    print("===================================")


# ==========================================================
# Entry Point
# ==========================================================

if __name__ == "__main__":

    try:

        asyncio.run(main())

    except KeyboardInterrupt:

        print(
            "\n\n⏹️ JobPulse scraper interrupted."
        )

    except Exception as e:

        print(
            f"\n\n❌ Fatal scraper error: {e}"
        )

        logger.exception(
            "Fatal scraper error"
        )