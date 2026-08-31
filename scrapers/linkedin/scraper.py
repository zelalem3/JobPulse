import re
import asyncio
import time
import random
from datetime import datetime, timezone
from urllib.parse import quote
from bs4 import BeautifulSoup
from curl_cffi import requests
from common.base_scraper import BaseScraper
from common.models import JobListing
from addskill import extract_skills


def safe_str(text: any, length: int = 250) -> str:
    if text is None: return ""
    return str(text).strip()[:length]


class LinkedInJobsScraper(BaseScraper):
    def __init__(self):
        super().__init__("LinkedIn")
        self.keywords = [
            "Software Engineer",
            "Software Developer",
            "Computer Science",
            "Backend Developer",
            "Frontend Developer",
            "Full Stack Developer"
        ]
        self.location = "Ethiopia"
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
        }

    def _clean(self, text):
        if not text: return None
        text = text.replace("\xa0", " ")
        return re.sub(r"\s+", " ", text).strip()

    def fetch(self) -> list:
        """Loops through keywords and compiles unique job listings posted within the last 24 hours (f_TPR=r86400)."""
        unique_jobs = {}

        for kw in self.keywords:
            encoded_kw = quote(kw)
            # f_TPR=r86400 filters jobs posted in the last 24 hours (86400 seconds)
            url = f"https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords={encoded_kw}&location={self.location}&f_TPR=r86400&start=0"
            
            try:
                print(f"[LinkedIn] Fetching last-24h jobs for keyword: '{kw}'...")
                response = requests.get(url, headers=self.headers, impersonate="chrome", timeout=30)
                
                if response.status_code != 200:
                    print(f"[LinkedIn] Keyword '{kw}' returned status code: {response.status_code}")
                    continue

                soup = BeautifulSoup(response.text, "lxml")
                job_cards = soup.find_all("li")
                
                count = 0
                for card in job_cards:
                    title_tag = card.find("h3", class_="base-search-card__title")
                    company_tag = card.find("h4", class_="base-search-card__subtitle")
                    location_tag = card.find("span", class_="job-search-card__location")
                    link_tag = card.find("a", class_="base-card__full-link")
                    
                    # Extract card-level datetime attribute if available (Format: YYYY-MM-DD)
                    time_tag = card.find("time", class_="job-search-card__listdate")
                    card_date = time_tag.get("datetime") if time_tag and time_tag.has_attr("datetime") else None

                    if title_tag and link_tag:
                        job_url = link_tag.get("href").split("?")[0]
                        
                        if job_url not in unique_jobs:
                            unique_jobs[job_url] = {
                                "title": self._clean(title_tag.get_text()),
                                "company": self._clean(company_tag.get_text()) if company_tag else "Not Specified",
                                "location": self._clean(location_tag.get_text()) if location_tag else "Ethiopia",
                                "url": job_url,
                                "card_date": card_date
                            }
                            count += 1

                print(f"[LinkedIn] Found {count} new unique jobs for '{kw}'.")
                
                # Randomized jitter sleep to look human and avoid bans
                time.sleep(random.uniform(2.5, 5.0))

            except Exception as e:
                print(f"[LinkedIn] Error fetching keyword '{kw}': {e}")

        print(f"[LinkedIn] Total unique fresh jobs compiled across all keywords: {len(unique_jobs)}")
        return list(unique_jobs.values())

    def parse(self, job_info: dict) -> JobListing | None:
        url = job_info["url"]
        try:
            response = requests.get(url, headers=self.headers, impersonate="chrome", timeout=20)
            if response.status_code != 200:
                return None

            soup = BeautifulSoup(response.text, "lxml")
            
            # Secondary check: Verify posted date text or metadata inside the job view if present
            # If the card date is explicitly older than today's date, drop it.
            if job_info.get("card_date"):
                try:
                    job_date_obj = datetime.strptime(job_info["card_date"], "%Y-%m-%d").date()
                    today = datetime.now(timezone.utc).date()
                    if job_date_obj < today:
                        print(f"[LinkedIn] Skipping stale job (Posted {job_date_obj}): {url}")
                        return None
                except ValueError:
                    pass

            desc_tag = soup.find("div", class_="show-more-less-html__markup")
            description = self._clean(desc_tag.get_text("\n", strip=True)) if desc_tag else ""

            extracted_skills = extract_skills(
                job_description_text=safe_str(description, 2500),
                job_title=safe_str(job_info["title"], 250)
            )

            return JobListing(
                title=safe_str(job_info["title"], 255),
                company=safe_str(job_info["company"], 255),
                location=safe_str(job_info["location"], 255),
                requirements=safe_str(description, 4000),
                description=safe_str(description, 10000),
                employment_type="Full Time",
                experience_level="Not Specified",
                salary="Negotiable",
                category="IT & Software",
                deadline=None,
                posted_at=datetime.now(timezone.utc),
                source="LinkedIn",
                url=str(url),
                skills=extracted_skills,
            )
        except Exception as e:
            print(f"[LinkedIn] Error parsing {url}: {e}")
            return None

    async def run(self):
        raw_jobs = await asyncio.to_thread(self.fetch)
        jobs = []
        for item in raw_jobs:
            job = await asyncio.to_thread(self.parse, item)
            if job:
                jobs.append(job)
            # Randomized async jitter sleep between parsing pages
            await asyncio.sleep(random.uniform(1.5, 3.5))
        return jobs