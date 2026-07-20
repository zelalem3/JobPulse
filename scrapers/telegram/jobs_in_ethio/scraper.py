import re
import os
from telethon import TelegramClient
from common.base_scraper import BaseScraper
from common.models import JobListing
from common.database import save_job
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class JobsEthioTelegramScraper(BaseScraper):
    def __init__(self, channel_username):
        super().__init__(f"Telegram:{channel_username}")
        self.channel = channel_username
        self.api_id = os.getenv("API_ID")
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

        # Initialize base job dictionary
        job_data = {
            "title": "General Vacancy",
            "company": None,
            "location": "Addis Ababa",
            "requirements": None,
            "description": text,
            "employment_type": "Full Time",
            "experience_level": None,
            "salary": "Negotiable",
            "category": None,
            "skills": [],
            "deadline": message.date + timedelta(days=7), # 1 week from post date
            "posted_at": message.date,
            "source": "Telegram - Embassy & NGO Jobs",
            "url": f"https://t.me/{self.channel}" # Default fallback URL
        }

        # -----------------------------
        # Extract fields
        # -----------------------------
        url = re.search(r"https?://\S+", text)
        if url:
            job_data["url"] = url.group()

        location = re.search(r"Location\s*:?\s*(.+)", text, re.IGNORECASE)
        if location:
            job_data["location"] = location.group(1).strip()

        qualification = re.search(
            r"Qualification\s*:?\s*(.+?)(?:Experience|Salary|Location|How to Apply|🌀|🌐|🔻)",
            text, re.IGNORECASE | re.DOTALL
        )
        if qualification:
            job_data["requirements"] = " ".join(qualification.group(1).split())

        experience = re.search(
            r"Experience\s*:?\s*(.+?)(?:Location|Salary|How to Apply|🌀|🌐)",
            text, re.IGNORECASE | re.DOTALL
        )
        if experience:
            job_data["experience_level"] = " ".join(experience.group(1).split())

        title_match = re.search(r"Position\s*\d*\s*:?\s*(.+)", text, re.IGNORECASE)
        if title_match:
            job_data["title"] = title_match.group(1).strip()

        # Company Extraction
        for line in text.splitlines():
            line = line.strip()
            if "አዲስ የስራ ማስታወቂያ" in line:
                company = line.replace("★", "").replace("⭐️", "").replace("🔽", "").replace("✔️", "").replace("✔", "").replace("አዲስ የስራ ማስታወቂያ", "").strip()
                job_data["company"] = company
                break

        # Convert to JobListing Object
        try:
            listing = JobListing(**job_data)
            return [listing] # Return as list for .extend() compatibility
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
                # parsed_jobs is now a list of JobListing objects
                parsed_jobs = self.parse(msg)
                all_jobs.extend(parsed_jobs)
            except Exception as e:
                print(f"Error processing message: {e}")
        
        return all_jobs