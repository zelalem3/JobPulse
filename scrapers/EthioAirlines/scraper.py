import re
import asyncio
from datetime import datetime
from bs4 import BeautifulSoup
from curl_cffi import requests
import dateparser
from common.models import JobListing
from common.base_scraper import BaseScraper
from addskill import extract_skills


def safe_str(text: any, length: int = 250) -> str:
    if text is None: return ""
    return str(text).strip()[:length]


def parse_deadline(date_str: str) -> str | None:
    """
    Safely cleans and parses deadline strings. 
    Returns None or a valid YYYY-MM-DD format if it's a real date,
    preventing Pydantic validation errors on text values like 'Open'.
    """
    if not date_str:
        return None
    
    cleaned_str = re.sub(r"(?i)(closing date|deadline|reg\.?date)[:\s]*", "", date_str).strip()
    
    # Handle descriptive non-date strings explicitly
    lower_val = cleaned_str.lower()
    if any(term in lower_val for term in ["open", "continuous", "rolling", "filled", "pending", "as applicable", "n/a"]):
        return None
    
    cleaned_str = cleaned_str.split("|")[0].split("—")[0].strip()
    
    try:
        parsed_date = dateparser.parse(cleaned_str, settings={'PREFER_DATES_FROM': 'future'})
        if parsed_date:
            return parsed_date.strftime("%Y-%m-%d")
    except Exception:
        pass
    
    return None


class EthiopianAirlinesScraper(BaseScraper):
    def __init__(self):
        super().__init__("EthiopianAirlines")
        self.url = "https://corporate.ethiopianairlines.com/AboutEthiopian/careers/vacancies"
        self.headers = {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Connection": "keep-alive",
            "User-Agent": (
                "Mozilla/5.0 (X11; Linux x86_64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/138.0.0.0 Safari/537.36"
            )
        }

    def _clean(self, text):
        if not text: return None
        text = text.replace("\xa0", " ")
        return re.sub(r"\s+", " ", text).strip()

    def fetch(self) -> list:
        job_entries = []
        try:
            print(f"[EthiopianAirlines] Fetching corporate vacancy board from {self.url}...")
            response = requests.get(self.url, headers=self.headers, impersonate="chrome", timeout=30)
            
            if response.status_code != 200:
                print(f"[EthiopianAirlines] Failed to fetch page, status code: {response.status_code}")
                return []

            soup = BeautifulSoup(response.text, "lxml")
            content_container = soup.find("div", class_="content") or soup.find("main") or soup
            
            page_text = content_container.get_text("\n", strip=True)
            lines = [self._clean(line) for line in page_text.split("\n") if line.strip()]

            current_job = {"title": "", "location": "Addis Ababa", "description": "", "deadline": None}
            
            i = 0
            while i < len(lines):
                line = lines[i]
                upper_line = line.upper()

                if "POSITION :" in upper_line or "POSITION:" in upper_line:
                    if current_job["title"]:
                        job_entries.append(current_job)
                        current_job = {"title": "", "location": "Addis Ababa", "description": "", "deadline": None}
                    
                    parts = line.split(":", 1)
                    if len(parts) > 1:
                        current_job["title"] = parts[1].strip()

                elif "LOCATION :" in upper_line or "LOCATION:" in upper_line:
                    parts = line.split(":", 1)
                    if len(parts) > 1:
                        current_job["location"] = parts[1].strip()

                elif "REGISTRATION DATE :" in upper_line or "REGISTRATION DATE:" in upper_line:
                    parts = line.split(":", 1)
                    if len(parts) > 1:
                        current_job["deadline"] = parts[1].strip()

                if current_job["title"]:
                    current_job["description"] += line + "\n"

                i += 1

            if current_job["title"]:
                job_entries.append(current_job)

            print(f"[EthiopianAirlines] Extracted {len(job_entries)} structured vacancy listings.")
        except Exception as e:
            print(f"[EthiopianAirlines] Fetch error: {e}")

        return job_entries

    def parse(self, job_data: dict) -> JobListing | None:
        try:
            title = job_data.get("title") or "Untitled Position"
            company = "Ethiopian Airlines Group"
            location = job_data.get("location") or "Addis Ababa"
            description = job_data.get("description") or title
            
            raw_deadline = job_data.get("deadline")
            deadline = parse_deadline(raw_deadline)

            requirements = ""
            if "QUALIFICATION" in description.upper() or "REQUIREMENT" in description.upper():
                for kw in ["QUALIFICATION", "REQUIREMENT", "MINIMUM QUALIFICATION"]:
                    if kw in description.upper():
                        idx = description.upper().index(kw)
                        requirements = description[idx:idx+2500].strip()
                        break

            extracted_skills = extract_skills(
                job_description_text=safe_str(f"{description}\n{requirements}", 2500),
                job_title=safe_str(title, 250)
            )

            return JobListing(
                title=safe_str(title, 255),
                company=safe_str(company, 255),
                location=safe_str(location, 255),
                requirements=safe_str(requirements, 4000) or None,
                description=safe_str(description, 10000) or "",
                employment_type="Full Time",
                experience_level="Not Specified",
                salary="Negotiable",
                category="Aviation & Aerospace",
                deadline=deadline,
                posted_at=datetime.utcnow(),
                source="EthiopianAirlines",
                url=str(self.url),
                skills=extracted_skills,
            )

        except Exception as e:
            print(f"[EthiopianAirlines] Error parsing job entry: {e}")
            return None

    async def run(self):
        raw_jobs = await asyncio.to_thread(self.fetch)
        jobs = []
        for item in raw_jobs:
            job = self.parse(item)
            if job:
                jobs.append(job)
        print(f"[EthiopianAirlines] Finished. Total successfully parsed: {len(jobs)}")
        return jobs