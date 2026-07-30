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


class EthioJobsScraper(BaseScraper):
    def __init__(self):
        super().__init__("EthioJobs")
        self.base_url = "https://ethiojobs.org.et"
        # Target distinct employment categories available on the platform
        self.categories = [
            "Information Technology",
            "Engineering",
            "Accounting and Finance",
            "Management",
            "Sales and Marketing",
            "Logistics, Transport and Supply Chain"
        ]
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
        
        # Loop through pages (e.g., first 2 pages to gather a comprehensive list)
        for page_num in range(1, 3):
            target_url = f"{self.base_url}/jobs?page={page_num}"
            try:
                print(f"[EthioJobs] Fetching directory page {page_num}...")
                response = requests.get(target_url, headers=self.headers, impersonate="chrome", timeout=30)
                
                if response.status_code != 200:
                    print(f"[EthioJobs] Page {page_num} returned status code: {response.status_code}")
                    continue

                soup = BeautifulSoup(response.text, "lxml")

                # Locate listing items or anchor tags linking to specific job entries
                for a_tag in soup.find_all("a", href=True):
                    href = a_tag.get("href", "").strip()
                    
                    # Ethiojobs individual listing pattern check
                    if "job" in href.lower() or "detail" in href.lower() or "/job/" in href:
                        if href.startswith("http"):
                            full_url = href
                        elif href.startswith("/"):
                            full_url = self.base_url + href
                        else:
                            continue

                        clean_url = full_url.split("?")[0].split("#")[0]
                        
                        # Exclude general landing pages, category indexes, or pagination links
                        if clean_url.rstrip("/") != self.base_url.rstrip("/") and "page=" not in clean_url:
                            if "category" not in clean_url and len(clean_url.split("/")) >= 4:
                                job_links.add(clean_url)

            except Exception as e:
                print(f"[EthioJobs] Error fetching page {page_num}: {e}")

        print(f"[EthioJobs] Total unique job links compiled across categories: {len(job_links)}")
        return list(job_links)

    def parse(self, url: str) -> JobListing | None:
        try:
            response = requests.get(url, headers=self.headers, impersonate="chrome", timeout=20)
            if response.status_code != 200:
                print(f"[EthioJobs] Failed to parse {url} (Status: {response.status_code})")
                return None

            soup = BeautifulSoup(response.text, "lxml")

            # ----------------------------
            # Title Extraction
            # ----------------------------
            title = "Untitled Position"
            for selector in ["h1", ".job-title", ".entry-title", "h2.title"]:
                tag = soup.select_one(selector)
                if tag:
                    text = self._clean(tag.get_text())
                    if text:
                        title = text
                        break

            # ----------------------------
            # Company Extraction
            # ----------------------------
            company = "Not Specified"
            for selector in [".company-name", ".employer-name", ".h4", ".sub-title"]:
                tag = soup.select_one(selector)
                if tag:
                    text = self._clean(tag.get_text())
                    if text and len(text) < 100:
                        company = text
                        break

            # ----------------------------
            # Description Content Container
            # ----------------------------
            container = soup.find("div", class_="job-description") or soup.find("main") or soup.find("article") or soup
            for tag in container(["script", "style", "nav", "header", "footer", "aside"]):
                tag.decompose()

            description = self._clean(container.get_text("\n", strip=True))

            # ----------------------------
            # Location Extraction
            # ----------------------------
            location = "Addis Ababa"
            for tag in container.find_all(["span", "p", "div", "li"]):
                text = self._clean(tag.get_text())
                if text and ("location" in text.lower() or "address" in text.lower() or "duty station" in text.lower()):
                    if ":" in text:
                        location = text.split(":", 1)[1].strip()
                    break

            # ----------------------------
            # Requirements Extraction
            # ----------------------------
            requirements = ""
            if description:
                for kw in ["REQUIREMENT", "QUALIFICATION", "JOB SPECIFICATION", "RESPONSIBILITY"]:
                    if kw in description.upper():
                        idx = description.upper().index(kw)
                        req_chunk = description[idx:]
                        if "HOW TO APPLY" in req_chunk.upper():
                            req_chunk = req_chunk[:req_chunk.upper().index("HOW TO APPLY")]
                        requirements = req_chunk[:4000].strip()
                        break

            # ----------------------------
            # Skill Extraction Integration
            # ----------------------------
            extracted_skills = extract_skills(
                job_description_text=safe_str(f"{description}\n{requirements}", 2500),
                job_title=safe_str(title, 250)
            )

            return JobListing(
                title=safe_str(title, 255) or "Untitled Position",
                company=safe_str(company, 255) or "Not Specified",
                location=safe_str(location, 255) or "Addis Ababa",
                requirements=safe_str(requirements, 4000) or None,
                description=safe_str(description, 10000) or "",
                employment_type="Full Time",
                experience_level="Not Specified",
                salary="Negotiable",
                category="IT & Professional",
                deadline=None,
                posted_at=datetime.utcnow(),
                source="EthioJobs",
                url=str(url),
                skills=extracted_skills,
            )

        except Exception as e:
            print(f"[EthioJobs] Error parsing detail page {url}: {e}")
            return None

    async def run(self):
        links = await asyncio.to_thread(self.fetch)
        jobs = []
        for link in links:
            job = await asyncio.to_thread(self.parse, link)
            if job:
                jobs.append(job)
            await asyncio.sleep(1)
        print(f"[EthioJobs] Finished. Total successfully parsed: {len(jobs)}")
        return jobs