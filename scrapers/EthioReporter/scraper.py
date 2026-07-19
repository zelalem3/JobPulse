import re
from datetime import datetime
from bs4 import BeautifulSoup
from curl_cffi import requests
from common.base_scraper import BaseScraper
from common.models import JobListing
from common.database import save_job 

class EthioReport(BaseScraper):
    def __init__(self):
        super().__init__("EthioReporter")
        self.base_url = "https://www.ethiopianreporterjobs.com"
        self.headers = {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Connection": "keep-alive",
            "Referer": "https://www.ethiopianreporterjobs.com/"
        }

    def _clean(self, text):
        if not text: return None
        text = text.replace("\xa0", " ")
        return re.sub(r"\s+", " ", text).strip()

    def fetch(self) -> list:
        """Standardized fetch method."""
        url = f"{self.base_url}/job-category/it-jobs-in-ethiopia/"
        try:
            response = requests.get(url, headers=self.headers, impersonate="chrome", timeout=30)
            if response.status_code != 200: return []
            
            soup = BeautifulSoup(response.text, "lxml")
            job_links = []
            pattern = re.compile(r"https://www\.ethiopianreporterjobs\.com/jobs-in-ethiopia/\d+/")
            
            for link in soup.find_all("a", href=True):
                href = link.get("href")
                if pattern.match(href):
                    job_links.append(href)
            return list(dict.fromkeys(job_links))
        except Exception as e:
            print(f"[EthioReporter] Fetch error: {e}")
            return []



    def parse(self, url: str) -> JobListing | None:
        try:
            response = requests.get(
                url,
                headers=self.headers,
                impersonate="chrome",
                timeout=20,
            )

            if response.status_code != 200:
                print(f"Failed to fetch {url}: {response.status_code}")
                return None

            soup = BeautifulSoup(response.text, "lxml")

            # ----------------------------
            # Title
            # ----------------------------
            title = "Untitled Position"

            for selector in [
                "h1",
                ".job-title",
                ".entry-title",
                ".single-job-title",
            ]:
                tag = soup.select_one(selector)
                if tag:
                    text = tag.get_text(" ", strip=True)
                    if text:
                        title = self._clean(text)
                        break

            # ----------------------------
            # Main Content
            # ----------------------------
            container = soup.select_one('div[itemprop="description"]')

            if container is None:
                print(f"Could not find description container: {url}")
                return None

            # Remove unwanted blocks
            for selector in [
                "script",
                "style",
                ".code-block",
                ".addtoany_share_save_container",
                ".ethio-jan-job-top-display",
            ]:
                for tag in container.select(selector):
                    tag.decompose()

            description = self._clean(
                container.get_text("\n", strip=True)
            )

            # ----------------------------
            # Location
            # ----------------------------
            location = "Addis Ababa"

            for p in container.find_all("p"):
                text = self._clean(p.get_text(" ", strip=True))

                if not text:
                    continue

                lower = text.lower()

                if lower.startswith("place of work"):
                    if ":" in text:
                        location = text.split(":", 1)[1].strip()
                    else:
                        location = (
                            text.replace("Place of Work", "")
                            .replace("place of work", "")
                            .strip()
                        )
                    break

            # ----------------------------
            # Employment Type
            # ----------------------------
            employment_type = None

            for text in soup.stripped_strings:

                if not text:
                    continue

                t = text.strip().lower()

                if "full time" in t:
                    employment_type = "Full Time"
                    break

                elif "part time" in t:
                    employment_type = "Part Time"
                    break

                elif "contract" in t:
                    employment_type = "Contract"
                    break

                elif "intern" in t:
                    employment_type = "Internship"
                    break

            # ----------------------------
            # Experience
            # ----------------------------
            experience_level = None

            for text in soup.stripped_strings:

                if not text:
                    continue

                t = text.strip().lower()

                if "senior" in t:
                    experience_level = "Senior"
                    break

                elif "mid" in t:
                    experience_level = "Mid"
                    break

                elif "junior" in t:
                    experience_level = "Junior"
                    break

            # ----------------------------
            # Salary
            # ----------------------------
            salary = "Negotiable"

            for text in soup.stripped_strings:

                if not text:
                    continue

                if "salary" in text.lower():
                    salary = text.strip()

            # ----------------------------
            # Requirements
            # ----------------------------
            requirements = ""

            upper = description.upper()

            if "JOB REQUIREMENT" in upper:

                req = description[
                    upper.index("JOB REQUIREMENT"):
                ]

                if "HOW TO APPLY" in req.upper():
                    req = req[:req.upper().index("HOW TO APPLY")]

                requirements = req.strip()

            return JobListing(
                title=title[:255],
                company="Catholic Caritas Ethiopia",
                location=location[:255],
                requirements=requirements[:4000] if requirements else None,
                description=description[:10000],
                employment_type=employment_type,
                experience_level=experience_level,
                salary=salary,
                category="IT & Telecom",
                deadline=None,
                posted_at=datetime.utcnow(),
                source="Ethiopian Reporter",
                url=url,
                skills=[],
            )

        except Exception as e:
            print(f"Error parsing {url}: {e}")
            return None