import re
import asyncio
from datetime import datetime
from urllib.parse import quote_plus
from bs4 import BeautifulSoup
from curl_cffi import requests
from common.models import JobListing
from common.base_scraper import BaseScraper
from addskill import extract_skills


def safe_str(text, length: int = 250) -> str:
    if text is None:
        return ""
    return str(text).strip()[:length]


class EthioJobsScraper(BaseScraper):
    def __init__(self):
        super().__init__("EthioJobs")
        self.base_url = "https://ethiojobs.org.et"

        # Prefer category listing paths when the site supports them
        self.category_paths = [
            "/jobs/it-computer-science-and-software-engineering",
            "/jobs?category=IT%2C+Computer+Science+and+Software+Engineering",
        ]

        # Fallback: general pages, then keyword filter
        self.list_pages = 3

        self.headers = {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Connection": "keep-alive",
            "User-Agent": (
                "Mozilla/5.0 (X11; Linux x86_64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/138.0.0.0 Safari/537.36"
            ),
        }

        # Keep only CS / software / IT roles
        self.include_keywords = [
            "computer science",
            "software",
            "developer",
            "programmer",
            "programming",
            "fullstack",
            "full stack",
            "full-stack",
            "backend",
            "front end",
            "frontend",
            "front-end",
            "devops",
            "data engineer",
            "data scientist",
            "machine learning",
            "artificial intelligence",
            "cyber security",
            "cybersecurity",
            "network engineer",
            "system administrator",
            "systems administrator",
            "database",
            "information technology",
            " information system",
            "ict ",
            " it ",
            "it officer",
            "it support",
            "it administrator",
            "web developer",
            "mobile developer",
            "qa engineer",
            "quality assurance",
            "cloud",
            "api ",
            "react",
            "python",
            "java",
            "node",
            "laravel",
            "django",
        ]

        self.exclude_keywords = [
            "cleaner",
            "driver",
            "accountant",
            "cashier",
            "nurse",
            "midwife",
            "teacher",
            "sales officer",
            "marketing officer",
            "guard",
            "cook",
            "waiter",
            "plumber",
            "electrician",
            "handyman",
            "lift technician",
            "hr officer",
            "human resource",
            "logistics officer",
            "procurement",
        ]

        # Detail URL: /jobs/AbCd1234xy-some-slug
        self.job_url_re = re.compile(
            r"^https?://(?:www\.)?ethiojobs\.org\.et/jobs/[A-Za-z0-9_-]{6,}(?:-[a-z0-9-]+)?/?$",
            re.I,
        )

    def _clean(self, text):
        if not text:
            return None
        text = text.replace("\xa0", " ")
        return re.sub(r"\s+", " ", text).strip()

    def _is_cs_related(self, text: str) -> bool:
        if not text:
            return False
        t = f" {text.lower()} "
        if any(x in t for x in self.exclude_keywords):
            return False
        return any(x in t for x in self.include_keywords)

    def _normalize_job_url(self, href: str) -> str | None:
        href = (href or "").strip()
        if not href:
            return None
        if href.startswith("/"):
            href = self.base_url + href
        if not href.startswith("http"):
            return None

        clean = href.split("?")[0].split("#")[0].rstrip("/")

        # Drop non-detail paths
        bad = (
            "/jobs?",
            "/category",
            "/ethiojobs/",
            "/login",
            "/register",
            "/companies",
        )
        if any(b in clean.lower() for b in bad):
            return None
        if clean.rstrip("/") == self.base_url.rstrip("/"):
            return None
        if clean.endswith("/jobs"):
            return None

        # Prefer real detail URLs
        if self.job_url_re.match(clean + "/") or self.job_url_re.match(clean):
            return clean

        # Allow /jobs/{id}-slug even if regex is strict
        parts = clean.split("/")
        if len(parts) >= 5 and parts[-2] == "jobs" and "-" in parts[-1]:
            return clean

        return None

    def _collect_links_from_html(self, html: str) -> set[str]:
        soup = BeautifulSoup(html, "lxml")
        links: set[str] = set()

        for a in soup.find_all("a", href=True):
            url = self._normalize_job_url(a["href"])
            if not url:
                continue

            # Prefer cards that mention the IT/CS category nearby
            parent_text = ""
            parent = a.find_parent(["article", "li", "div", "tr"])
            if parent:
                parent_text = self._clean(parent.get_text(" ", strip=True)) or ""

            anchor_text = self._clean(a.get_text()) or ""
            blob = f"{anchor_text} {parent_text}".lower()

            # Strong accept: category label on the card
            if "computer science" in blob or "software engineering" in blob:
                links.add(url)
                continue

            # Otherwise keep only if title/card looks CS-related
            if self._is_cs_related(blob):
                links.add(url)

        return links

    def fetch(self) -> list:
        job_links: set[str] = set()

        # 1) Category-focused listing(s)
        urls_to_fetch = list(self.category_paths)
        # 2) A few general pages as backup (still filtered)
        for page in range(1, self.list_pages + 1):
            urls_to_fetch.append(f"/jobs?page={page}")

        for path in urls_to_fetch:
            target = path if path.startswith("http") else f"{self.base_url}{path}"
            try:
                print(f"[EthioJobs] Fetching {target}")
                response = requests.get(
                    target,
                    headers=self.headers,
                    impersonate="chrome",
                    timeout=30,
                )
                if response.status_code != 200:
                    print(f"[EthioJobs] {target} -> {response.status_code}")
                    continue

                found = self._collect_links_from_html(response.text)
                print(f"[EthioJobs] {len(found)} candidate links from this page")
                job_links.update(found)
            except Exception as e:
                print(f"[EthioJobs] Error fetching {target}: {e}")

        print(f"[EthioJobs] Total unique CS/IT job links: {len(job_links)}")
        return list(job_links)

    def parse(self, url: str) -> JobListing | None:
        try:
            response = requests.get(
                url, headers=self.headers, impersonate="chrome", timeout=20
            )
            if response.status_code != 200:
                print(f"[EthioJobs] Failed {url} ({response.status_code})")
                return None

            soup = BeautifulSoup(response.text, "lxml")

            title = "Untitled Position"
            for selector in ["h1", ".job-title", ".entry-title", "h2.title"]:
                tag = soup.select_one(selector)
                if tag:
                    text = self._clean(tag.get_text())
                    if text:
                        title = text
                        break

            company = "Not Specified"
            for selector in [".company-name", ".employer-name", ".h4", ".sub-title"]:
                tag = soup.select_one(selector)
                if tag:
                    text = self._clean(tag.get_text())
                    if text and len(text) < 100:
                        company = text
                        break

            container = (
                soup.find("div", class_="job-description")
                or soup.find("main")
                or soup.find("article")
                or soup
            )
            for tag in container(["script", "style", "nav", "header", "footer", "aside"]):
                tag.decompose()

            description = self._clean(container.get_text("\n", strip=True)) or ""

            # Second filter on the detail page (title + body)
            if not self._is_cs_related(f"{title}\n{description[:1500]}"):
                print(f"[EthioJobs] Skipped non-CS role: {title}")
                return None

            location = "Addis Ababa"
            for tag in container.find_all(["span", "p", "div", "li"]):
                text = self._clean(tag.get_text())
                if text and (
                    "location" in text.lower()
                    or "address" in text.lower()
                    or "duty station" in text.lower()
                ):
                    if ":" in text:
                        location = text.split(":", 1)[1].strip()
                    break

            requirements = ""
            upper = description.upper()
            for kw in ["REQUIREMENT", "QUALIFICATION", "JOB SPECIFICATION", "RESPONSIBILITY"]:
                if kw in upper:
                    idx = upper.index(kw)
                    req_chunk = description[idx:]
                    if "HOW TO APPLY" in req_chunk.upper():
                        req_chunk = req_chunk[: req_chunk.upper().index("HOW TO APPLY")]
                    requirements = req_chunk[:4000].strip()
                    break

            extracted_skills = extract_skills(
                job_description_text=safe_str(f"{description}\n{requirements}", 2500),
                job_title=safe_str(title, 250),
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
                category="IT, Computer Science and Software Engineering",
                deadline=None,
                posted_at=datetime.utcnow(),
                source="EthioJobs",
                url=str(url),
                skills=extracted_skills,
            )
        except Exception as e:
            print(f"[EthioJobs] Error parsing {url}: {e}")
            return None

    async def run(self):
        links = await asyncio.to_thread(self.fetch)
        jobs = []
        for link in links:
            job = await asyncio.to_thread(self.parse, link)
            if job:
                jobs.append(job)
            await asyncio.sleep(1)
        print(f"[EthioJobs] Finished. Parsed CS/IT jobs: {len(jobs)}")
        return jobs