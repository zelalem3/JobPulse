import re
from datetime import datetime
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from common.base_scraper import BaseScraper
from common.models import JobListing

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
        if not href or "/job/" not in href:
            return False
        blacklist = ["/companies", "/blog", "/faq", "/contact", "/employers", "/sign"]
        return not any(x in href for x in blacklist)

    def _normalize_url(self, href: str) -> str:
        return self.base_url + href if href.startswith("/") else href

    async def fetch(self) -> list:
        """Standardized fetch method."""
        links = set()
        with sync_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            await page.goto(self.start_url, wait_until="networkidle", timeout=60000)
            await page.wait_for_timeout(3000)

            anchors = page.locator("a")
            count = await anchors.count()
            for i in range(count):
                href = await anchors.nth(i).get_attribute("href")
                if self._is_valid_job_link(href):
                    links.add(self._normalize_url(href))
            await browser.close()
        return list(links)

    async def parse(self, url: str) -> JobListing | None:
        """Parses individual job page and returns a JobListing object."""
        try:
            with sync_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                page = await browser.new_page()
                await page.goto(url, wait_until="networkidle", timeout=60000)
                content = await page.content()
                await browser.close()

            soup = BeautifulSoup(content, "lxml")
            text = soup.get_text("\n", strip=True)

            # --- Extraction Logic ---
            title = soup.find("h1").get_text(strip=True) if soup.find("h1") else "Untitled Position"
            
            # Simple Regex helpers
            def get_match(pattern, text):
                m = re.search(pattern, text)
                return m.group(1).strip() if m else None

            location = get_match(r"Location\s*Type.*?\n(.*?)\n", text)
            employment_type = get_match(r"Employment Type\s*:\s*(.+)", text)
            experience_level = get_match(r"Career Level\s*:\s*(.+)", text)
            
            # Deadline Parsing
            deadline = None
            date_match = re.search(r"Deadline\s*:\s*([A-Za-z]+\s+\d+\w{2},\s+\d{4})", text)
            if date_match:
                clean_date = re.sub(r"(st|nd|rd|th)", "", date_match.group(1))
                try:
                    deadline = datetime.strptime(clean_date, "%B %d, %Y").date()
                except ValueError:
                    deadline = None

            # Description/Req extraction
            description = text.split("About the Job")[1].split("About You")[0].strip() if "About the Job" in text else ""
            requirements = text.split("About You")[1].split("Requirement Skill")[0].strip() if "About You" in text else ""
            
            skills = []
            if "Requirement Skill" in text:
                skill_block = text.split("Requirement Skill")[1].split("How To Apply")[0]
                skills = [s.strip() for s in skill_block.splitlines() if s.strip()]

            # Return Pydantic Model
            return JobListing(
                title=title,
                company="EthioJobs Employer",
                location=location or "Addis Ababa",
                description=description,
                requirements=requirements,
                employment_type=employment_type or "Full Time",
                experience_level=experience_level or "Not Specified",
                salary="Negotiable",
                skills=skills,
                deadline=deadline,
                posted_at=datetime.utcnow(),
                source="EthioJobs",
                url=str(url)
            )
        except Exception as e:
            print(f"Error parsing {url}: {e}")
            return None