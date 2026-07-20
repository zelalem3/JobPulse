import re
import os
from telethon import TelegramClient
from common.base_scraper import BaseScraper
from common.models import JobListing
from common.database import save_job
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

class EtcarrerTelegramScraper(BaseScraper):
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
                # Iterate through recent messages
                async for message in self.client.iter_messages(self.channel, limit=20):
                    if message.text:
                        jobs_list.append(message)
        except Exception as e:
            print(f"[{self.name}] Fetch failed: {e}")
            return []
        return jobs_list

    def _is_spam(self, text: str) -> bool:
        """Simple filter to discard non-job advertisements."""
        if not text or len(text.strip()) < 50:
            return True
        spam_keywords = ["buy", "sell", "contact @", "nft", "crypto", "username"]
        return any(k in text.lower() for k in spam_keywords)

    def parse(self, message) -> list[JobListing]:
        """Parses a Telegram message into one or more JobListing objects."""
        text = message.text
        if not text or self._is_spam(text):
            return []

        # 1. Initialize base data with defaults to satisfy Pydantic
        base_job = {
            "company": "Unknown",
            "title": "Untitled Position",
            "location": "Addis Ababa",
            "requirements": None,
            "description": text[:2000],
            "employment_type": "Full Time",
            "experience_level": "N/A",
            "salary": "Negotiable",
            "category": None,
            "skills": [],
            "deadline": None,
            "posted_at": message.date,
            "source": "ETcareers Telegram",
            "url": f"https://t.me/{self.channel}" 
        }

        url_match = re.search(r"https?://\S+", text)
        if url_match:
            base_job["url"] = url_match.group()

    
        # -----------------------------
        # Deadline (Calculated)
        # -----------------------------
        # Use the message date as the base, add 7 days
        # This creates a real datetime object which Pydantic loves
        deadline_date = message.date + timedelta(days=7)
        
        # Assign the datetime object directly
        base_job["deadline"] = deadline_date
        

        location = re.search(r"📍\s*(.+)", text)
        if location:
            base_job["location"] = location.group(1).strip()

        exp = re.search(r"💼\s*(.+)", text)
        if exp:
            base_job["experience_level"] = exp.group(1).strip()

        qual = re.search(r"🎓\s*(.+)", text)
        if qual:
            base_job["requirements"] = qual.group(1).strip()

        # 4. Extract Company
        company_emojis = ["🏦", "🏢", "🌍", "🚀", "🏥", "📡", "🌱", "💼"]
        for line in text.splitlines():
            line = line.strip()
            if any(line.startswith(e) for e in company_emojis):
                company = line
                for e in company_emojis:
                    company = company.replace(e, "")
                base_job["company"] = company.replace("is Hiring!", "").strip()
                break

   
        positions = []
        for line in text.splitlines():
            line = line.strip()
            if line.startswith("•"):
                positions.append(line[1:].strip())
            elif re.match(r"^\d️⃣", line):
                positions.append(re.sub(r"^\d️⃣\s*", "", line))
            elif line.startswith("📌"):
                positions.append(line.replace("📌", "").strip())

        if not positions:
            positions = ["General Vacancy"]

       
        listings = []
        for pos in positions:
            job_dict = base_job.copy()
            job_dict["title"] = pos
            try:
                listings.append(JobListing(**job_dict))
            except Exception as e:
                print(f"Validation Error: {e}")
        
        return listings

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