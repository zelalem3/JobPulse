import re
import asyncio
from datetime import datetime
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from common.base_scraper import BaseScraper
from common.models import JobListing
from addskill import extract_skills  


def safe_str(text: any, length: int = 250) -> str:
    if text is None: return ""
    return str(text).strip()[:length]


class GeezJobsScraper(BaseScraper):
    def __init__(self):
        super().__init__("GeezJobs")
        self.base_url = "https://geezjobs.com"
        self.start_url = "https://geezjobs.com/jobs-in-ethiopia"

    def _clean(self, text):
        if not text: return None
        text = text.replace("\xa0", " ")
        return re.sub(r"\s+", " ", text).strip()

    def is_valid_job_link(self, href):
        if not href:
            return False

        # GeezJobs uses /job-detail/ for individual job listing URLs
        if "/job-detail/" not in href:
            return False

        blacklist = [
            "/companies",
            "/blog",
            "/faq",
            "/contact",
            "/employers",
            "/sign",
        ]

        return not any(x in href for x in blacklist)

    def normalize_url(self, href):
        if href.startswith("/"):
            return self.base_url + href
        return href

    def fetch(self) -> list:
        links = set()
        print(f"[GeezJobs] Opening browser to fetch links from {self.start_url}...")

        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=["--disable-blink-features=AutomationControlled"]
            )

            context = browser.new_context(
                user_agent=(
                    "Mozilla/5.0 (X11; Linux x86_64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/138.0.0.0 Safari/537.36"
                ),
                viewport={"width": 1366, "height": 768},
                locale="en-US"
            )

            page = context.new_page()

            page.add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined
                });
            """)

            try:
                page.goto(
                    self.start_url,
                    wait_until="domcontentloaded",
                    timeout=60000
                )
                print("[GeezJobs] Page loaded. Waiting for elements...")
                page.wait_for_timeout(5000)

                html = page.content()
                soup = BeautifulSoup(html, "lxml")

                for link in soup.find_all("a", href=True):
                    href = link.get("href")
                    if self.is_valid_job_link(href):
                        full_url = self.normalize_url(href)
                        links.add(full_url)

                print(f"[GeezJobs] Found {len(links)} valid job links.")

            except Exception as e:
                print(f"[GeezJobs] Fetch error: {e}")

            finally:
                browser.close()

        return list(links)

    def parse(self, url: str) -> JobListing | None:
        print(f"[GeezJobs] Parsing job: {url}")
        html = ""
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=30000)
                html = page.content()
            except Exception as e:
                print(f"[GeezJobs] Failed to fetch {url}: {e}")
                browser.close()
                return None
            finally:
                browser.close()

        try:
            soup = BeautifulSoup(html, "lxml")

            # ----------------------------
            # Title
            # ----------------------------
            title = "Untitled Position"
            for selector in ["h1", ".job-title", ".entry-title", ".single-job-title"]:
                tag = soup.select_one(selector)
                if tag:
                    text = tag.get_text(" ", strip=True)
                    if text:
                        title = self._clean(text)
                        break

            # ----------------------------
            # Company
            # ----------------------------
            company = "Not Specified"
            for selector in [".company-name", ".employer-name", ".job-company"]:
                tag = soup.select_one(selector)
                if tag:
                    text = tag.get_text(" ", strip=True)
                    if text:
                        company = self._clean(text)
                        break

            # ----------------------------
            # Main Content / Description
            # ----------------------------
            container = soup.select_one('div[itemprop="description"]') or soup.select_one('.job-description') or soup.select_one('main')

            if container is None:
                print(f"[GeezJobs] Could not find description container: {url}")
                return None

            for selector in ["script", "style", ".code-block", ".addtoany_share_save_container"]:
                for tag in container.select(selector):
                    tag.decompose()

            description = self._clean(container.get_text("\n", strip=True))

            # ----------------------------
            # Location
            # ----------------------------
            location = "Addis Ababa"
            for p in container.find_all(["p", "div", "span"]):
                text = self._clean(p.get_text(" ", strip=True))
                if not text:
                    continue
                lower = text.lower()
                if "place of work" in lower or "location" in lower:
                    if ":" in text:
                        location = text.split(":", 1)[1].strip()
                    else:
                        location = text.replace("Place of Work", "").replace("location", "").strip()
                    break

            # ----------------------------
            # Employment Type
            # ----------------------------
            employment_type = "Full Time"
            for text in soup.stripped_strings:
                if not text: continue
                t = text.strip().lower()
                if "part time" in t:
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
            experience_level = "Not Specified"
            for text in soup.stripped_strings:
                if not text: continue
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
                if not text: continue
                if "salary" in text.lower():
                    salary = text.strip()
                    break

            # ----------------------------
            # Requirements
            # ----------------------------
            requirements = ""
            if description and "JOB REQUIREMENT" in description.upper():
                req = description[description.upper().index("JOB REQUIREMENT"):]
                if "HOW TO APPLY" in req.upper():
                    req = req[:req.upper().index("HOW TO APPLY")]
                requirements = req.strip()
            elif description and "REQUIREMENTS" in description.upper():
                requirements = description[description.upper().index("REQUIREMENTS"):].strip()

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
                employment_type=safe_str(employment_type, 50),
                experience_level=safe_str(experience_level, 50),
                salary=safe_str(salary, 100),
                category="General",
                deadline=None,
                posted_at=datetime.utcnow(),
                source="GeezJobs",
                url=str(url),
                skills=extracted_skills,
            )

        except Exception as e:
            print(f"[GeezJobs] Error parsing {url}: {e}")
            return None

    async def run(self):
        links = await asyncio.to_thread(self.fetch)
        jobs = []
        for link in links:
            job = await asyncio.to_thread(self.parse, link)
            if job:
                jobs.append(job)
        print(f"[GeezJobs] Finished. Total successfully parsed: {len(jobs)}")
        return jobs