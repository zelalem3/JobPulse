import re
import os
from dateutil import parser as date_parser
from telethon import TelegramClient
from telethon.sessions import StringSession
from common.base_scraper import BaseScraper
from common.models import JobListing
from common.database import save_job
from addskill import extract_skills  

from dotenv import load_dotenv
load_dotenv()


class JosadTelegramScraper(BaseScraper):
    def __init__(self, channel_username):
        super().__init__(f"Telegram:{channel_username}")
        self.channel = channel_username
        self.api_id = os.getenv("TELEGRAM_API_ID") or os.getenv("API_ID")
        self.api_hash = os.getenv("TELEGRAM_API_HASH") or os.getenv("API_HASH")
        self.string_session = os.getenv("TELEGRAM_STRING_SESSION")
        self.bot_token = os.getenv("TELEGRAM_BOT_TOKEN") or os.getenv("BOT_TOKEN")

        if not self.api_id or not self.api_hash:
            raise RuntimeError(
                "API_ID/TELEGRAM_API_ID and API_HASH/TELEGRAM_API_HASH must be configured in the environment."
            )

        session_target = StringSession(self.string_session) if self.string_session else f"jobpulse_{channel_username}"
        self.client = TelegramClient(session_target, int(self.api_id), self.api_hash)

    def _clean_text(self, text):
        if not text:
            return ""
        cleaned = re.sub(r"^[★📌✨♦✅\s•\-\s]+", "", text).strip()
        cleaned = re.sub(r"\*\*|\*", "", cleaned)
        return cleaned.strip()

    def _sanitize_description(self, text: str) -> str:
        if not text:
            return ""
        text = re.sub(r'https?://[^\s]+', '', text)
        text = re.sub(r'@[a-zA-Z0-9_]+', '', text)
        text = re.sub(r'#[a-zA-Z0-9_]+', '', text)

        boilerplate = ['view detail', 'view details', 'View on source', 'EOS']
        for phrase in boilerplate:
            text = re.sub(re.escape(phrase), '', text, flags=re.IGNORECASE)

        text = re.sub(r'\s+', ' ', text)
        return text.strip()
    
    async def fetch(self) -> list:
        """Connects and fetches messages safely without interactive CLI prompts."""
        jobs_list = []
        try:
            if self.bot_token and not self.client.is_connected():
                await self.client.start(bot_token=self.bot_token)
            else:
                await self.client.start()

            async for message in self.client.iter_messages(self.channel, limit=20):
                if message.text:
                    jobs_list.append(message)
        except Exception as e:
            print(f"[{self.name}] Fetch failed: {e}")
            return []
        return jobs_list

    def truncate_str(self, text: str, length: int = 250) -> str:
        if not text:
            return ""
        return str(text)[:length]
    
    def parse(self, message) -> JobListing:
        text = message.text
        if not text:
            return None

        url = None
        urls = re.findall(r"https?://[^\s]+", text)
        specific_urls = [u.strip(".,)>]}") for u in urls if "t.me/" not in u]

        if specific_urls:
            url = specific_urls[0]
        if not url:
            url = f"https://t.me/{self.channel}/{message.id}"

        lines = [line.strip() for line in text.split("\n") if line.strip()]
        
        raw_title = lines[0] if lines else "Untitled Job"
        if "Josad Software Jobs:" in raw_title:
            raw_title = raw_title.split("Josad Software Jobs:")[-1].strip()
        clean_title = self._clean_text(raw_title)[:250]

        company = self.channel
        company_match = re.search(r"(?:Company|Employer):\s*(.*)", text, re.IGNORECASE)
        if company_match:
            company = self._clean_text(company_match.group(1))

        salary_match = re.search(r"Salary:\s*(.*)", text, re.IGNORECASE)
        salary = self._clean_text(salary_match.group(1)) if salary_match else "Negotiable"

        job_type_match = re.search(r"Job Type:\s*(.*)", text, re.IGNORECASE)
        job_type = self._clean_text(job_type_match.group(1)) if job_type_match else "N/A"

        deadline = None
        deadline_match = re.search(r"Deadline:\s*(.*)", text, re.IGNORECASE)
        if deadline_match:
            raw_deadline = self._clean_text(deadline_match.group(1))
            if raw_deadline.lower() not in ["n/a", "none", "-", ""]:
                try:
                    deadline = date_parser.parse(raw_deadline)
                except Exception:
                    deadline = None

        cleaned_description_for_extraction = self._sanitize_description(text)
        has_tech_context = bool(re.search(r"(requirements|stack|technologies|skills|qualification)", text, re.IGNORECASE))

        extracted_skills = []
        try:
            result = extract_skills(
                job_description_text=self.truncate_str(cleaned_description_for_extraction, 2500), 
                job_title=self.truncate_str(clean_title, 250),
                boost_weights=has_tech_context 
            )
            if isinstance(result, list):
                extracted_skills = result
        except Exception:
            extracted_skills = []

        return JobListing(
            title=clean_title,
            location="Addis Ababa",
            description=text[:2000],  
            url=url, 
            salary=salary, 
            posted_at=getattr(message, 'date', None),
            source=f"Telegram: {self.channel}",
            company=company,
            skills=extracted_skills,
            job_type=job_type,
            deadline=deadline
        )

    async def run(self):
        """The Main Orchestrator."""
        print(f"[{self.name}] Starting...")
        messages = await self.fetch()
        
        scraped_jobs = []
        for msg in messages:
            try:
                job_data = self.parse(msg)
                if job_data:
                    scraped_jobs.append(job_data)
                    print(f"Parsed: {job_data.title} @ {job_data.company}")
                else:
                    print(f"Skipped empty or invalid message.")
            except Exception as e:
                print(f"Error parsing Telegram msg: {e}")
                
        return scraped_jobs