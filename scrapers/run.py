from Afriwork.scraper import AfriworkScraper
from EthioReporter.scraper import EthioReport
from Ethiojob.scraper import EthioJob
from GeezJobs.scraper import GeezJobsScraper
from linkedin.scraper import LinkedInJobsScraper
from Hahu.scraper import HaHuJobsScraper

from telegram.EffoyJobs.scraper import TelegramChannelScraper
from telegram.Josad.scraper import JosadTelegramScraper
from telegram.ETcareers.scraper import EtcarrerTelegramScraper
from telegram.jobs_in_ethio.scraper import JobsEthioTelegramScraper
from telegram.NGOjobs.scraper import NgoJobEthiopiaTelegramScraper
from addskill import save_cache,SKILL_CACHE




import asyncio




from common.database import save_job

SCRAPERS = [
    AfriworkScraper(),
    EthioReport(),
    EthioJob(),
    GeezJobsScraper(),
    LinkedInJobsScraper(),
    TelegramChannelScraper("effoyjobs"),
    JosadTelegramScraper("josad_software"),
    EtcarrerTelegramScraper("etcareersjobs"),
    JobsEthioTelegramScraper("jobs_in_ethio"),
    HaHuJobsScraper(),
    NgoJobEthiopiaTelegramScraper(),




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
    save_cache(SKILL_CACHE)


    for job in all_jobs:
        save_job(job)



if __name__ == "__main__":
    asyncio.run(main())