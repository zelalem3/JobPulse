import re
import os
from telethon import TelegramClient
from common.base_scraper import BaseScraper
from common.models import JobListing
from datetime import timedelta, datetime

# Helper function to sanitize strings for the database
def safe_truncate(text: any, length: int = 250) -> str:
    """Safely converts to string, cleans whitespace, and truncates to avoid DB errors."""
    if not text:
        return ""
    return str(text).strip()[:length]

class JobsEthioTelegramScraper(BaseScraper):
    def __init__(self, channel_username):
        super().__init__(f"Telegram:{channel_username}")
        self.channel = channel_username
        self.api_id = os.getenv("API_ID")
        self.api_hash = os.getenv("API_HASH")
        # Ensure session is created in a persistent location if needed
        self.client = TelegramClient("jobpulse_session", self.api_id, self.api_hash)

    async def fetch(self) -> list:
        """Connects and fetches messages."""
        jobs_list = []
        try:
            async with self.client:
                async for message in self.client.iter_messages(self.channel, limit=20):
                    if message.text:
                        jobs_list.append(message)
        except Exception as e:
            print(f"[{self.name}] Fetch failed: {e}")
            return []
        return jobs_list

    def _is_spam(self, text: str) -> bool:
        """Filters out ads and non-job messages."""
        if not text or len(text.strip()) < 50:
            return True
        spam_keywords = ["buy", "sell", "contact @", "nft", "crypto", "username"]
        return any(k in text.lower() for k in spam_keywords)

    def parse(self, message) -> list[JobListing]:
        """Parses message and returns a list of JobListing objects."""
        text = message.text or ""
        if self._is_spam(text):
            return []

        # 1. Initialize data with safe defaults
        # We use safe_truncate here for fields that hit the DB
        job_data = {
            "title": "General Vacancy",
            "company": "Unknown",  # Default string to satisfy Pydantic
            "location": "Addis Ababa",
            "requirements": "",
            "description": safe_truncate(text, 2500), # Truncated to avoid DB crash
            "employment_type": "Full Time",
            "experience_level": "Not specified",
            "salary": "Negotiable",
            "category": "General",
            "posted_at": message.date,
            "source": "Telegram - Embassy & NGO Jobs",
            "url": f"https://t.me/{self.channel}"
        }

        # 2. Extract fields (using safe_truncate for logic)
        url_match = re.search(r"https?://\S+", text)
        if url_match:
            job_data["url"] = url_match.group()

        loc_match = re.search(r"Location\s*:?\s*(.+)", text, re.IGNORECASE)
        if loc_match:
            job_data["location"] = safe_truncate(loc_match.group(1), 250)

        qual_match = re.search(
            r"Qualification\s*:?\s*(.+?)(?:Experience|Salary|Location|How to Apply|🌀|🌐|🔻)",
            text, re.IGNORECASE | re.DOTALL
        )
        if qual_match:
            job_data["requirements"] = safe_truncate(qual_match.group(1), 250)

        exp_match = re.search(
            r"Experience\s*:?\s*(.+?)(?:Location|Salary|How to Apply|🌀|🌐)",
            text, re.IGNORECASE | re.DOTALL
        )
        if exp_match:
            job_data["experience_level"] = safe_truncate(exp_match.group(1), 250)

        title_match = re.search(r"Position\s*\d*\s*:?\s*(.+)", text, re.IGNORECASE)
        if title_match:
            job_data["title"] = safe_truncate(title_match.group(1), 250)

        # Company Extraction
        for line in text.splitlines():
            line = line.strip()
            if "አዲስ የስራ ማስታወቂያ" in line:
                company = line.replace("★", "").replace("⭐️", "").replace("🔽", "").replace("✔️", "").replace("✔", "").replace("አዲስ የስራ ማስታወቂያ", "").strip()
                if company:
                    job_data["company"] = safe_truncate(company, 250)
                break

        # 3. Create Object
        try:
            listing = JobListing(**job_data)
            return [listing]
        except Exception as e:
            print(f"Validation Error: {e}")
            return []

    async def run(self):
        """Orchestrates the fetch, parse, and return cycle."""
        print(f"[{self.name}] Starting...")
        all_jobs = []
        messages = await self.fetch()
        
        for msg in messages:
            try:
                parsed_jobs = self.parse(msg)
                all_jobs.extend(parsed_jobs)
            except Exception as e:
                print(f"Error processing message: {e}")
        
        return all_jobs