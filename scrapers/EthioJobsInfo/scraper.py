import re
import asyncio
from datetime import datetime
from bs4 import BeautifulSoup
from curl_cffi import requests
from common.models import JobListing
from common.base_scraper import BaseScraper
from addskill import extract_skills


def safe_str(text: any, length: int = 250) -> str:
    if text is None: return ""
    return str(text).strip()[:length]


class EthioJobsInfoNGOScraper(BaseScraper):
    def __init__(self):
        super().__init__("EthioJobsInfoNGO")
        self.base_url = "https://ethiojobs.info"
        self.start_url = "https://ethiojobs.info/sectors/ngo/"
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
        job_links = set()
        
        try:
            print(f"[EthioJobsInfoNGO] Fetching listings from {self.start_url}...")
            response = requests.get(self.start_url, headers=self.headers, impersonate="chrome", timeout=30)
            if response.status_code != 200:
                print(f"[EthioJobsInfoNGO] Failed to fetch sector index, status code: {response.status_code}")
                return []

            soup = BeautifulSoup(response.text, "lxml")

            for a_tag in soup.find_all("a", href=True):
                href = a_tag.get("href", "").strip()
                
                # Ethiojobs.info listings generally contain explicit entry/job slugs or full URLs
                if href.startswith("http"):
                    full_url = href
                elif href.startswith("/"):
                    full_url = self.base_url + href
                else:
                    continue

                clean_url = full_url.split("?")[0].split("#")[0]
                
                # Filter criteria to isolate distinct job posts and drop directory, archive, or tag links
                if clean_url.rstrip("/") != self.start_url.rstrip("/") and clean_url.rstrip("/") != self.base_url.rstrip("/"):
                    if "sector" not in clean_url and "tag" not in clean_url and "page" not in clean_url:
                        job_links.add(clean_url)

            print(f"[EthioJobsInfoNGO] Found {len(job_links)} unique job links.")
        except Exception as e:
            print(f"[EthioJobsInfoNGO] Fetch error: {e}")

        return list(job_links)

    def parse(self, url: str) -> JobListing | None:
        try:
            response = requests.get(url, headers=self.headers, impersonate="chrome", timeout=20)
            if response.status_code != 200:
                print(f"[EthioJobsInfoNGO] Failed to fetch job page {url}: {response.status_code}")
                return None

            soup = BeautifulSoup(response.text, "lxml")

            # ----------------------------
            # Title Extraction
            # ----------------------------
            title = "Untitled Position"
            for selector in ["h1.entry-title", "h1.post-title", "h1"]:
                tag = soup.select_one(selector)
                if tag:
                    text = self._clean(tag.get_text())
                    if text:
                        title = text
                        break

            # ----------------------------
            # Main Description Container
            # ----------------------------
            container = soup.find("div", class_="entry-content") or soup.find("article") or soup.find("main") or soup
            for tag in container(["script", "style", "nav", "header", "footer", "aside"]):
                tag.decompose()

            description = self._clean(container.get_text("\n", strip=True))

            # ----------------------------
            # Company / Organization Extraction
            # ----------------------------
            company = "NGO / Humanitarian Organization"
            title_upper = title.upper()
            if " AT " in title_upper:
                company = title.split(" AT ")[-1].split("-")[0].strip()
            elif " - " in title:
                parts = title.split(" - ")
                if len(parts) > 1:
                    company = parts[-1].strip()

            # ----------------------------
            # Location Extraction Heuristic
            # ----------------------------
            location = "Ethiopia"
            if description:
                for line in description.split("\n")[:15]:
                    if "location:" in line.lower() or "place of work:" in line.lower() or "duty station:" in line.lower():
                        location = line.split(":", 1)[1].strip()
                        break

            # ----------------------------
            # Requirements Extraction Heuristic
            # ----------------------------
            requirements = ""
            if description and ("REQUIREMENT" in description.upper() or "QUALIFICATION" in description.upper() or "RESPONSIBILITY" in description.upper()):
                for keyword in ["REQUIREMENT", "QUALIFICATION", "JOB REQUIREMENT", "RESPONSIBILITIES"]:
                    if keyword in description.upper():
                        idx = description.upper().index(keyword)
                        req = description[idx:]
                        if "HOW TO APPLY" in req.upper():
                            req = req[:req.upper().index("HOW TO APPLY")]
                        requirements = req[:4000].strip()
                        break

            # ----------------------------
            # Skill Extraction
            # ----------------------------
            extracted_skills = extract_skills(
                job_description_text=safe_str(f"{description}\n{requirements}", 2500),
                job_title=safe_str(title, 250)
            )

            return JobListing(
                title=safe_str(title, 255) or "Untitled Position",
                company=safe_str(company, 255) or "NGO / Organization",
                location=safe_str(location, 255) or "Ethiopia",
                requirements=safe_str(requirements, 4000) or None,
                description=safe_str(description, 10000) or "",
                employment_type="Full Time",
                experience_level="Not Specified",
                salary="Negotiable",
                category="NGO & Humanitarian",
                deadline=None,
                posted_at=datetime.utcnow(),
                source="EthioJobsInfoNGO",
                url=str(url),
                skills=extracted_skills,
            )

        except Exception as e:
            print(f"[EthioJobsInfoNGO] Error parsing {url}: {e}")
            return None

    async def run(self):
        links = await asyncio.to_thread(self.fetch)
        jobs = []
        for link in links:
            job = await asyncio.to_thread(self.parse, link)
            if job:
                jobs.append(job)
            await asyncio.sleep(1)
        print(f"[EthioJobsInfoNGO] Finished. Total successfully parsed: {len(jobs)}")
        return jobs