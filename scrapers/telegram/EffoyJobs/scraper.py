import os
import re

from dotenv import load_dotenv
from telethon import TelegramClient

from common.base_scraper import BaseScraper
from common.models import JobListing
from telethon.sessions import StringSession

load_dotenv()


def safe_str(text, length: int = 250) -> str:
    if text is None:
        return ""

    return str(text).strip()[:length]


class TelegramChannelScraper(BaseScraper):

    def __init__(self, channel_username: str):
        super().__init__(f"Telegram:{channel_username}")

        self.channel = channel_username

        # Support both naming conventions so it works locally and in GitHub Actions
        self.api_id = os.getenv("TELEGRAM_API_ID") or os.getenv("API_ID")
        self.api_hash = os.getenv("TELEGRAM_API_HASH") or os.getenv("API_HASH")
        self.string_session = os.getenv("TELEGRAM_STRING_SESSION")

        if not self.api_id or not self.api_hash:
            raise RuntimeError(
                "TELEGRAM_API_ID and TELEGRAM_API_HASH must be configured in the environment."
            )

        if not self.string_session:
            raise RuntimeError(
                "TELEGRAM_STRING_SESSION must be configured in the environment."
            )

        
        self.client = TelegramClient(
            StringSession(self.string_session),
            int(self.api_id),
            self.api_hash,
        )

    def _clean_text(self, text: str) -> str:
        if not text:
            return ""

        return re.sub(
            r"^[★📌✨♦✅\s•*\-]+",
            "",
            text,
        ).strip()

    async def fetch(self) -> list:
        """
        Connect to Telegram and fetch recent messages.
        """

        jobs_list = []

        async with self.client:

            async for message in self.client.iter_messages(
                self.channel,
                limit=20,
            ):
                if message.text:
                    jobs_list.append(message)

        return jobs_list

    def parse(self, message) -> JobListing:
        """
        Convert a Telegram message into a JobListing.

        Skill extraction is intentionally NOT performed here.
        Centralized processing in run.py handles that.
        """

        text = message.text or ""

        lines = [
            line.strip()
            for line in text.split("\n")
            if line.strip()
        ]

        title = (
            self._clean_text(lines[0])
            if lines
            else "Untitled Job"
        )

        def get_match(pattern, value):
            match = re.search(
                pattern,
                value,
                re.IGNORECASE,
            )

            return (
                match.group(1).strip()
                if match
                else None
            )

        deadline = get_match(
            r"(?:Deadline|የማመልከቻ ማብቂያ ቀን):\s*([^\n]+)",
            text,
        )

        salary = (
            get_match(
                r"(?:ደመወዝ|Salary):\s*([^\n]+)",
                text,
            )
            or "Negotiable"
        )

        # --------------------------------------------------
        # URL extraction
        # --------------------------------------------------

        urls = re.findall(
            r"https?://[^\s]+",
            text,
        )

        url = None

        if urls:
            url = next(
                (
                    u
                    for u in urls
                    if "t.me" not in u
                ),
                urls[0],
            )

        final_url = (
            url
            or f"https://t.me/{self.channel}/{message.id}"
        )

        # --------------------------------------------------
        # Job
        # --------------------------------------------------

        return JobListing(
            title=safe_str(
                title,
                250,
            ) or "Untitled Job",

            company="Telegram Channel",

            location=safe_str(
                "Addis Ababa",
                250,
            ),

            description=safe_str(
                text,
                2000,
            ),

            requirements=None,

            employment_type="Full Time",

            experience_level=None,

            salary=safe_str(
                salary,
                250,
            ),

            # Centralized run.py will populate this.
            skills=[],

            deadline=deadline,

            posted_at=message.date,

            source=f"Telegram: {self.channel}",

            url=str(final_url),
        )

    async def run(self):
        """
        Fetch and parse Telegram jobs asynchronously.
        """

        print(f"[{self.name}] Starting...")

        messages = await self.fetch()

        scraped_jobs = []

        for message in messages:

            try:
                job = self.parse(message)

                if job:
                    scraped_jobs.append(job)

                    print(
                        f"[{self.name}] "
                        f"Queued: {job.title}"
                    )

                else:
                    print(
                        f"[{self.name}] "
                        f"Skipped empty message."
                    )

            except Exception as e:

                print(
                    f"[{self.name}] "
                    f"Error parsing Telegram message: {e}"
                )

        print(
            f"[{self.name}] "
            f"Finished: {len(scraped_jobs)} jobs"
        )

        return scraped_jobs