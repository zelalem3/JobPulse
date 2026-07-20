import re
import os
from telethon import TelegramClient
from common.base_scraper import BaseScraper
from common.models import JobListing
from common.database import save_job

from dotenv import load_dotenv
load_dotenv()

class TelegramChannelScraper(BaseScraper):
    def __init__(self, channel_username):
        super().__init__(f"Telegram:{channel_username}")
        self.channel = channel_username
        self.api_id = os.getenv("API_ID")
        self.api_hash = os.getenv("API_HASH")
        self.client = TelegramClient("jobpulse_session", self.api_id, self.api_hash)

    def _clean_text(self, text):
        return re.sub(r"^[★📌✨♦✅\s•\-\s]+", "", text).strip()

    async def fetch(self) -> list:
        """Connects and fetches messages."""
        jobs_list = []
        async with self.client:
            # Iterating messages
            async for message in self.client.iter_messages(self.channel, limit=20):
                if message.text:
                    jobs_list.append(message)
        return jobs_list

    def parse(self, message) -> JobListing:
        """Parses a Telethon message object into a JobListing."""
        text = message.text
        
        # --- Logic ---
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        title = self._clean_text(lines[0]) if lines else "Untitled Job"

        # Regex Helpers
        def get_match(pattern, text):
            match = re.search(pattern, text, re.IGNORECASE)
            return match.group(1).strip() if match else None

        deadline = get_match(r"(?:Deadline|የማመልከቻ ማብቂያ ቀን):\s*([^\n]+)", text)
        salary = get_match(r"(?:ደመወዝ|Salary):\s*([^\n]+)", text) or "Negotiable"
        

        # URL Extraction
        url = None
        urls = re.findall(r"https?://[^\s]+", text)
        if urls:
            url = next((u for u in urls if "t.me" not in u), urls[0])
        final_url = url or "https://t.me/effoyjobs"

        return JobListing(
            title=title[:250],
            company="Telegram Channel",
            location="Addis Ababa", # Default or extract if possible
            description=text[:2000],
            requirements=None, 
            employment_type="Full Time",
            experience_level=None,
            salary=salary,
            skills=[],
            deadline=None,
            posted_at=message.date,
            source=f"Telegram: {self.channel}",
            url=final_url
        )

    async def run(self):
        """The Main Orchestrator."""
        print(f"[{self.name}] Starting...")
        messages = await self.fetch()
        
        for msg in messages:
            try:
                job_data = self.parse(msg)
                save_job(job_data)
                print(f"Saved: {job_data.title}")
            except Exception as e:
                print(f"Error parsing Telegram msg: {e}")