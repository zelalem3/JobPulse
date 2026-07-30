import re
import asyncio
from datetime import datetime
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from common.models import JobListing
from common.base_scraper import BaseScraper
from addskill import extract_skills


def safe_str(text: any, length: int = 250) -> str:
    if text is None: return ""
    return str(text).strip()[:length]


class SafaricomEthiopiaScraper(BaseScraper):
    def __init__(self):
        super().__init__("SafaricomEthiopia")
        self.url = "https://www.safaricom.et/en/work-with-us/careers/vacancies"

    def _clean(self, text):
        if not text: return None
        text = text.replace("\xa0", " ")
        return re.sub(r"\s+", " ", text).strip()

    def fetch(self) -> list:
        job_links = set()
        print(f"[SafaricomEthiopia] Opening browser to evaluate dynamic vacancy boards...")

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
                viewport={"width": 1366, "height": 768}
            )
            page = context.new_page()

            try:
                page.goto(self.url, wait_until="networkidle", timeout=60000)
                print("[SafaricomEthiopia] Page loaded. Waiting for portal components...")
                page.wait_for_timeout(5000)

                html = page.content()
                soup = BeautifulSoup(html, "lxml")

                for a_tag in soup.find_all("a", href=True):
                    href = a_tag.get("href", "").strip()
                    
                    if "vacancy" in href.lower() or "job" in href.lower() or "career" in href.lower():
                        if href.startswith("http"):
                            full_url = href
                        elif href.startswith("/"):
                            full_url = "https://www.safaricom.et" + href
                        else:
                            continue

                        clean_url = full_url.split("?")[0].split("#")[0]
                        if clean_url.rstrip("/") != self.url.rstrip("/"):
                            job_links.add(clean_url)

                print(f"[SafaricomEthiopia] Found {len(job_links)} unique links.")
            except Exception as e:
                print(f"[SafaricomEthiopia] Fetch error: {e}")
            finally:
                browser.close()

        return list(job_links)

    def parse(self, url: str) -> JobListing | None:
        html = ""
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            try:
                page.goto(url, wait_until="domcontentloaded", timeout=30000)
                html = page.content()
            except Exception as e:
                print(f"[SafaricomEthiopia] Failed to open {url}: {e}")
                browser.close()
                return None
            finally:
                browser.close()

        try:
            soup = BeautifulSoup(html, "lxml")

            # Title
            title = "Untitled Position"
            for selector in ["h1", ".job-title", ".vacancy-title"]:
                tag = soup.select_one(selector)
                if tag:
                    text = self._clean(tag.get_text())
                    if text:
                        title = text
                        break

            company = "Safaricom Telecommunications Ethiopia PLC"
            location = "Addis Ababa"

            container = soup.find("main") or soup.find("div", class_="content-area") or soup
            for tag in container(["script", "style", "nav", "header", "footer"]):
                tag.decompose()

            description = self._clean(container.get_text("\n", strip=True))

            requirements = ""
            if description and ("REQUIREMENT" in description.upper() or "QUALIFICATION" in description.upper()):
                for kw in ["REQUIREMENT", "QUALIFICATION", "WHAT YOU BRING"]:
                    if kw in description.upper():
                        idx = description.upper().index(kw)
                        requirements = description[idx:idx+4000].strip()
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
                source="SafaricomEthiopia",
                url=str(url),
                skills=extracted_skills,
            )

        except Exception as e:
            print(f"[SafaricomEthiopia] Error parsing {url}: {e}")
            return None

    async def run(self):
        links = await asyncio.to_thread(self.fetch)
        jobs = []
        for link in links:
            job = await asyncio.to_thread(self.parse, link)
            if job:
                jobs.append(job)
        print(f"[SafaricomEthiopia] Finished. Total successfully parsed: {len(jobs)}")
        return jobs