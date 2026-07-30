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


class EthioTelecomScraper(BaseScraper):
    def __init__(self):
        super().__init__("EthioTelecom")
        self.url = "https://www.ethiotelecom.et/job-openings/"
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
            print(f"[EthioTelecom] Fetching listings from {self.url}...")
            response = requests.get(self.url, headers=self.headers, impersonate="chrome", timeout=30)
            
            if response.status_code != 200:
                print(f"[EthioTelecom] Failed to fetch career board, status code: {response.status_code}")
                return []

            soup = BeautifulSoup(response.text, "lxml")

            for a_tag in soup.find_all("a", href=True):
                href = a_tag.get("href", "").strip()
                
                # Ethio telecom vacancy links typically point to specific post slugs or employment paths
                if "job" in href.lower() or "vacancy" in href.lower() or "opening" in href.lower():
                    if href.startswith("http"):
                        full_url = href
                    elif href.startswith("/"):
                        full_url = "https://www.ethiotelecom.et" + href
                    else:
                        continue

                    clean_url = full_url.split("?")[0].split("#")[0]
                    if clean_url.rstrip("/") != self.url.rstrip("/") and "page=" not in clean_url:
                        job_links.add(clean_url)

            print(f"[EthioTelecom] Found {len(job_links)} unique vacancy links.")
        except Exception as e:
            print(f"[EthioTelecom] Fetch error: {e}")

        return list(job_links)

    def parse(self, url: str) -> JobListing | None:
        try:
            response = requests.get(url, headers=self.headers, impersonate="chrome", timeout=20)
            if response.status_code != 200:
                print(f"[EthioTelecom] Failed to fetch job page {url}: {response.status_code}")
                return None

            soup = BeautifulSoup(response.text, "lxml")

            # Title
            title = "Untitled Position"
            for selector in ["h1.entry-title", "h1.post-title", "h1"]:
                tag = soup.select_one(selector)
                if tag:
                    text = self._clean(tag.get_text())
                    if text:
                        title = text
                        break

            company = "Ethio Telecom"
            location = "Addis Ababa"

            container = soup.find("div", class_="entry-content") or soup.find("main") or soup
            for tag in container(["script", "style", "nav", "header", "footer", "aside"]):
                tag.decompose()

            description = self._clean(container.get_text("\n", strip=True))

            requirements = ""
            if description and ("REQUIREMENT" in description.upper() or "QUALIFICATION" in description.upper()):
                for kw in ["REQUIREMENT", "QUALIFICATION", "JOB REQUIREMENT"]:
                    if kw in description.upper():
                        idx = description.upper().index(kw)
                        req = description[idx:]
                        if "HOW TO APPLY" in req.upper():
                            req = req[:req.upper().index("HOW TO APPLY")]
                        requirements = req[:4000].strip()
                        break

            extracted_skills = extract_skills(
                job_description_text=safe_str(f"{description}\n{requirements}", 2500),
                job_title=safe_str(title, 250)
            )

            return JobListing(
                title=safe_str(title, 255) or "Untitled Position",
                company=safe_str(company, 255),
                location=safe_str(location, 255),
                requirements=safe_str(requirements, 4000) or None,
                description=safe_str(description, 10000) or "",
                employment_type="Full Time",
                experience_level="Not Specified",
                salary="Negotiable",
                category="Telecommunications & Tech",
                deadline=None,
                posted_at=datetime.utcnow(),
                source="EthioTelecom",
                url=str(url),
                skills=extracted_skills,
            )

        except Exception as e:
            print(f"[EthioTelecom] Error parsing {url}: {e}")
            return None

    async def run(self):
        links = await asyncio.to_thread(self.fetch)
        jobs = []
        for link in links:
            job = await asyncio.to_thread(self.parse, link)
            if job:
                jobs.append(job)
            await asyncio.sleep(1)
        print(f"[EthioTelecom] Finished. Total successfully parsed: {len(jobs)}")
        return jobs