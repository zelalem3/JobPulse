import re
import os
from telethon import TelegramClient
from common.base_scraper import BaseScraper
from common.models import JobListing
from common.database import save_job

from dotenv import load_dotenv
load_dotenv()


class JosadTelegramScraper(BaseScraper):
    def __init__(self, channel_username):
        super().__init__(f"Telegram:{channel_username}")
        self.channel = channel_username
        self.api_id = os.getenv("API_ID")
        self.api_hash = os.getenv("API_HASH")
        self.client = TelegramClient("jobpulse_session", self.api_id, self.api_hash)

    def _clean_text(self, text):
        return re.sub(r"^[★📌✨♦✅\s•\-\s]+", "", text).strip()
    
    async def fetch(self) -> list:
        """Connects and fetches messages"""
        jobs_list = []
        async with self.client:
            # Iterating messages
            async for message in self.client.iter_messages(self.channel, limit=20):
                if message.text:
                    jobs_list.append(message)
        return jobs_list
    def truncate_str(text: str, length: int = 250) -> str:
        """Helper to ensure text doesn't overflow DB columns."""
        if not text:
            return ""
        return str(text)[:length]
    


    def parse(self, message) -> JobListing:
        text = message.text
        if not text:
            return None

        # 1. Extraction Logic
        url_match = re.search(r"https?://[^\s/$.?#].[^\s]*", text)
        url = None
        if url_match:
            urls = re.findall(r"https?://[^\s]+", text)
            specific_urls = [u for u in urls if "t.me" not in u]
            url = specific_urls[0].strip() if specific_urls else url_match.group(0).strip()
        
        # Fallback to prevent NullViolation
        if not url:
            url = f"https://t.me/{self.channel}"

        lines = [line.strip() for line in text.split("\n") if line.strip()]
        clean_title = "Untitled Job"
        if lines:
            clean_title = re.sub(r"^[★📌✨♦✅\s•\-\s]+", "", lines[0])[:250].strip()

        
        return JobListing(
            title=clean_title,
            location="N/A",
            description=text[:2000],
            url=url, 
            salary="Negotiable", 
            posted_at=getattr(message, 'date', None),
            source=f"Telegram: {self.channel}",
            company=self.channel

            

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