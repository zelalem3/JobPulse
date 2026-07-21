import re
import os
from telethon import TelegramClient
from common.base_scraper import BaseScraper
from common.models import JobListing
from datetime import timedelta, datetime

def safe_truncate(text: any, length: int = 250) -> str:
    """Safely converts to string, cleans whitespace, and truncates to avoid DB errors."""
    if not text:
        return ""
    return str(text).strip()[:length]

class JobsEthioTelegramScraper(BaseScraper):
    def __init__(self, channel_username):
        super().__init__(f"Telegram:{channel_username}")
        self.channel = channel_username
        
        # FIX 1: Convert API_ID to an integer
        raw_api_id = os.getenv("API_ID")
        self.api_id = int(raw_api_id) if raw_api_id else 0
        
        self.api_hash = os.getenv("API_HASH")
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

        # FIX 2: Use message.id in the URL so every post has a unique URL 
        # (preventing the database ON CONFLICT crash/overwrite)
        message_url = f"https://t.me/{self.channel}/{message.id}"

        job_data = {
            "title": "General Vacancy",
            "company": "Unknown",
            "location": "Addis Ababa",
            "requirements": "",
            "description": safe_truncate(text, 2500),
            "employment_type": "Full Time",
            "experience_level": "Not specified",
            "salary": "Negotiable",
            "category": "General",
            "posted_at": message.date,
            "source": f"Telegram - {self.channel}",
            "url": message_url
        }

        # Extract fields
        url_match = re.search(r"https?://\S+", text)
        if url_match:
            # If the post has a direct application link, you can use it, 
            # or keep the Telegram message URL as the primary unique identifier.
            pass 

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