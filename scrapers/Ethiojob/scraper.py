import os
import re
from datetime import datetime
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright
from common.base_scraper import BaseScraper
from common.models import JobListing
from addskill import extract_skills  


def safe_str(text: any, length: int = 250) -> str:
    if text is None: return ""
    return str(text).strip()[:length]


class EthioJob(BaseScraper):
    def __init__(self):
        super().__init__("EthioJobs")
        self.base_url = "https://www.ethiojobs.net"
        self.start_url = "https://www.ethiojobs.net/jobs"
        self.headers = {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
        }

    def _is_valid_job_link(self, href: str) -> bool:
        if not href:
            return False
        return bool(re.search(r"/job/[a-zA-Z0-9]+-", href))

    def _normalize_url(self, href: str) -> str:
        return self.base_url + href if href.startswith("/") else href

    async def fetch(self) -> list:
        """Asynchronous fetch method to gather job links."""
        links = set()
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            try:
                await page.goto(self.start_url, wait_until="domcontentloaded", timeout=30000)
                try:
                    await page.wait_for_selector("a[href*='/job/']", timeout=10000)
                except Exception:
                    await page.wait_for_timeout(3000)

                anchors = page.locator("a")
                count = await anchors.count()
                for i in range(count):
                    href = await anchors.nth(i).get_attribute("href")
                    if href:
                        normalized = self._normalize_url(href)
                        if self._is_valid_job_link(normalized):
                            links.add(normalized)
            except Exception as e:
                print(f"[{self.name}] Fetch error: {e}")
            finally:
                await browser.close()
        return list(links)

    async def parse_page(self, page, url: str) -> JobListing | None:
        """Parses an individual job page with full diagnostic instrumentation and addskill integration."""
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=60000)
            await page.wait_for_timeout(3000)

            page_title = await page.title()
            print(f"PAGE TITLE: {page_title}")

            content = await page.content()
            
            with open("ethiojob_debug.html", "w", encoding="utf-8") as f:
                f.write(content)

            if not content or len(content) < 200:
                return None

            soup = BeautifulSoup(content, "lxml")
            
            try:
                await page.wait_for_selector("h1", timeout=15000)
            except Exception:
                pass

            for element in soup(["script", "style", "nav", "footer", "header", "head"]):
                element.decompose()

            text = soup.get_text("\n", strip=True)

            print("-" * 40 + " TEXT SNIPPET " + "-" * 40)
            print(text[:1000])
            print("-" * 94)

            lines = [l.strip() for l in text.splitlines() if l.strip()]

            # --- Title Extraction ---
            title_elem = soup.select_one("h1, .job-title, .position-title, .vacancy-title")
            title = title_elem.get_text(strip=True) if title_elem else "Untitled Position"
            if not title or title == "Untitled Position":
                if lines:
                    title = lines[0]

            # --- Location Extraction ---
            location = "Addis Ababa"
            for i, line in enumerate(lines):
                if line == title and i + 1 < len(lines):
                    nxt = lines[i + 1]
                    if len(nxt) < 60 and "Office" not in nxt and "Remote" not in nxt and "Hybrid" not in nxt:
                        location = nxt
                        break

            # --- Company Extraction ---
            company = "EthioJobs Employer"
            company_elem = soup.select_one(".company-name, .employer-name, .company")
            if company_elem:
                c_text = company_elem.get_text(strip=True)
                if c_text and len(c_text) < 80:
                    company = c_text
            else:
                for line in lines:
                    if (
                        line not in (title, location, "View all open positions", "Expired", "Office", "Remote", "Hybrid")
                        and len(line) < 80
                        and not line.startswith("Deadline")
                        and not line.startswith("Location")
                    ):
                        company = line
                        break

            def get_match(pattern, text_content):
                m = re.search(pattern, text_content, re.IGNORECASE)
                return m.group(1).strip() if m else None

            employment_type = get_match(r"Employment Type\s*[:\-]?\s*(.+)", text) or "Full Time"
            experience_level = (
                get_match(r"Work Experience\s*[:\-]?\s*(.+)", text) 
                or get_match(r"Career Level\s*[:\-]?\s*(.+)", text) 
                or "Not Specified"
            )
            
            # --- Deadline Parsing ---
            deadline = None
            date_match = re.search(r"Deadline\s*[:\-]?\s*([A-Za-z]+\s+\d+\w{2},\s+\d{4})", text, re.IGNORECASE)
            if not date_match:
                date_match = re.search(r"Deadline\s*[:\-]?\s*(\d{2}/\d{2}/\d{4})", text, re.IGNORECASE)
            if date_match:
                clean_date = re.sub(r"(st|nd|rd|th)", "", date_match.group(1))
                try:
                    deadline = datetime.strptime(clean_date, "%B %d, %Y")
                except ValueError:
                    try:
                        deadline = datetime.strptime(clean_date, "%d/%m/%Y")
                    except ValueError:
                        deadline = None

            # --- Structural Section Extraction ---
            def extract_between(start_str, ends_list):
                s = text.find(start_str)
                if s == -1:
                    return ""
                s += len(start_str)
                e = len(text)
                for x in ends_list:
                    p = text.find(x, s)
                    if p != -1:
                        e = min(e, p)
                return text[s:e].strip()

            end_sections = ["About You", "Key Responsibilities", "Requirement Skill", "How To Apply", "More Jobs", "Requirements"]

            description = extract_between("About the Job", [x for x in end_sections if x != "About the Job"])
            if not description:
                description = extract_between("Job Summary", [x for x in end_sections if x != "Job Summary"])
            if not description:
                paragraphs = [p.get_text(strip=True) for p in soup.find_all("p") if len(p.get_text(strip=True)) > 20]
                description = "\n".join(paragraphs[:10]) if paragraphs else text[:1000]

            responsibilities = extract_between("Key Responsibilities", [x for x in end_sections if x != "Key Responsibilities"])
            requirements = extract_between("About You", [x for x in end_sections if x != "About You"])
            if not requirements:
                requirements = extract_between("Requirements", [x for x in end_sections if x != "Requirements"])
            if not requirements:
                requirements = "See main job description for requirements."

            full_requirements = requirements
            if responsibilities:
                full_requirements = f"Key Responsibilities:\n{responsibilities}\n\nRequirements:\n{requirements}"

            # --- Unified Skill Extraction via addskill ---
            extracted_skills = extract_skills(
                job_description_text=safe_str(f"{description}\n{full_requirements}", 2500),
                job_title=safe_str(title, 250)
            )

            print("=" * 80)
            print("URL:", url)
            print("TITLE:", title)
            print("COMPANY:", company)
            print("LOCATION:", location)
            print("EMPLOYMENT:", employment_type)
            print("EXPERIENCE:", experience_level)
            print("DEADLINE:", deadline)
            print("SKILLS:", extracted_skills)
            print("=" * 80)

            return JobListing(
                title=safe_str(title, 250) or "Untitled Position",
                company=safe_str(company, 250) or "Unknown",
                location=safe_str(location, 250) or "Addis Ababa",
                description=safe_str(description, 5000),
                requirements=safe_str(full_requirements, 3000),
                employment_type=safe_str(employment_type, 50) or "Full Time",
                experience_level=safe_str(experience_level, 50) or "Not Specified",
                salary="Negotiable",
                skills=extracted_skills,
                deadline=deadline,
                posted_at=datetime.utcnow(),
                source="EthioJobs",
                url=str(url)
            )
        except Exception as e:
            print(f"Error parsing {url}: {e}")
            return None

    async def parse(self, url: str) -> JobListing | None:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            job = await self.parse_page(page, url)
            await browser.close()
            return job

    async def run(self) -> list:
        print(f"[{self.name}] Starting...")
        links = await self.fetch()
        print(f"[{self.name}] Found {len(links)} job links. Parsing...")
        
        jobs = []
        if not links:
            print(f"[{self.name}] Finished. Extracted 0 jobs.")
            return jobs

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            try:
                for link in links:
                    job = await self.parse_page(page, link)
                    if job:
                        jobs.append(job)
            finally:
                await browser.close()

        print(f"[{self.name}] Finished. Extracted {len(jobs)} jobs.")
        return jobs