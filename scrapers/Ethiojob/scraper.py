import re
import asyncio
from datetime import datetime
from typing import List

from curl_cffi import requests
from common.base_scraper import BaseScraper
from common.models import JobListing
from addskill import extract_skills


def safe_str(text, length: int = 250) -> str:
    if text is None:
        return ""
    return str(text).strip()[:length]


class EthioJob(BaseScraper):
    def __init__(self, category: str = "IT-+Computer+Science+and+Software+Engineering"):
        super().__init__("EthioJobs")
        self.base_url = "https://ethiojobs.net"
        self.category = category  # "" for all jobs
        self.headers = {
            "Accept": "application/json,text/html",
            "Accept-Language": "en-US,en;q=0.9",
            "User-Agent": (
                "Mozilla/5.0 (X11; Linux x86_64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/138.0.0.0 Safari/537.36"
            ),
        }
        self._build_id = None

    def _get_build_id(self) -> str:
        if self._build_id:
            return self._build_id

        url = f"{self.base_url}/jobs"
        if self.category:
            url += f"?category={self.category}&page=1&isFeatured=false"

        resp = requests.get(url, headers=self.headers, impersonate="chrome", timeout=30)
        resp.raise_for_status()

        match = re.search(r'/_next/data/([a-zA-Z0-9_-]+)/', resp.text)
        if not match:
            match = re.search(r'"buildId"\s*:\s*"([a-zA-Z0-9_-]+)"', resp.text)
        if not match:
            raise RuntimeError("[EthioJobs] Could not find Next.js build ID")

        self._build_id = match.group(1)
        print(f"[{self.name}] Build ID: {self._build_id}")
        return self._build_id

    # ------------------------------------------------------------------
    # Required by BaseScraper (must be sync + named exactly like this)
    # ------------------------------------------------------------------
    def fetch(self, page: int = 1) -> List[dict]:
        """Fetch one page of raw job dicts. Required abstract method."""
        try:
            build_id = self._get_build_id()
            params = f"page={page}&isFeatured=false"
            if self.category:
                params = f"category={self.category}&{params}"

            url = f"{self.base_url}/_next/data/{build_id}/en/jobs.json?{params}"
            resp = requests.get(url, headers=self.headers, impersonate="chrome", timeout=30)

            if resp.status_code != 200:
                print(f"[{self.name}] Page {page} status {resp.status_code}")
                return []

            data = resp.json()
            jobs_obj = data.get("pageProps", {}).get("jobs", {})
            items = jobs_obj.get("data") or []

            # stash meta on the instance so run() can paginate
            self._last_meta = jobs_obj.get("meta") or {}
            return items
        except Exception as e:
            print(f"[{self.name}] Fetch failed at page {page}: {e}")
            return []

    def parse(self, item: dict) -> JobListing:
        """Turn one raw job dict into a JobListing. Required abstract method."""
        title = safe_str(item.get("title"), 255) or "Untitled Position"

        company = "Not Specified"
        if isinstance(item.get("company"), dict):
            company = safe_str(item["company"].get("name"), 255) or "Not Specified"

        location_parts = []
        if item.get("city"):
            location_parts.append(item["city"])
        if item.get("state") and item.get("state") != item.get("city"):
            location_parts.append(item["state"])
        location = ", ".join(location_parts) or "Addis Ababa"

        raw_desc = item.get("description") or ""
        description = re.sub(r"<[^>]+>", " ", raw_desc)
        description = re.sub(r"\s+", " ", description).strip()

        requirements = safe_str(item.get("requirement"), 4000) or None

        employment_type = "Full Time"
        type_name = item.get("type_name")
        if isinstance(type_name, list) and type_name:
            employment_type = safe_str(type_name[0], 50)
        elif isinstance(type_name, str):
            employment_type = safe_str(type_name, 50)

        experience_level = (
            safe_str(item.get("career_level_name") or item.get("work_experience_name"), 50)
            or "Not Specified"
        )

        category = "IT & Professional"
        catalog_names = item.get("catalog_names") or []
        if catalog_names:
            category = safe_str(catalog_names[0], 100)

        posted_at = datetime.utcnow()
        if item.get("date_published"):
            try:
                posted_at = datetime.fromisoformat(
                    item["date_published"].replace("Z", "+00:00")
                )
            except Exception:
                pass

        deadline = None
        if item.get("date_expiry"):
            try:
                deadline = datetime.fromisoformat(
                    item["date_expiry"].replace("Z", "+00:00")
                )
            except Exception:
                pass

        slug = item.get("slug") or ""
        job_url = f"{self.base_url}/job/{slug}" if slug else self.base_url

        site_skills = []
        for key in ("skills_mandatory_names", "skills_desired_names"):
            vals = item.get(key) or []
            if isinstance(vals, list):
                site_skills.extend(vals)

        extracted = extract_skills(
            job_description_text=safe_str(f"{description}\n{requirements or ''}", 2500),
            job_title=title,
        )
        skills = list(dict.fromkeys(site_skills + (extracted or [])))

        return JobListing(
            title=title,
            company=company,
            location=safe_str(location, 255),
            requirements=requirements,
            description=safe_str(description, 10000),
            employment_type=employment_type,
            experience_level=experience_level,
            salary="Negotiable",
            category=category,
            deadline=deadline,
            posted_at=posted_at,
            source="EthioJobs",
            url=job_url,
            skills=skills,
        )

    # ------------------------------------------------------------------
    # Override run() so we can paginate (same pattern as Afriwork)
    # ------------------------------------------------------------------
    async def run(self) -> list:
        print(f"[{self.name}] Starting (category={self.category or 'ALL'})...")
        all_jobs = []
        page = 1
        self._last_meta = {}

        while True:
            items = await asyncio.to_thread(self.fetch, page)
            if not items:
                break

            for item in items:
                try:
                    all_jobs.append(self.parse(item))
                except Exception as e:
                    print(f"[{self.name}] Skipping malformed job: {e}")

            meta = getattr(self, "_last_meta", {}) or {}
            last_page = meta.get("lastPage") or meta.get("last_page") or 1
            total = meta.get("total", "?")
            print(
                f"[{self.name}] Page {page}/{last_page} → "
                f"{len(items)} jobs (total so far {len(all_jobs)}/{total})"
            )

            if page >= last_page:
                break
            page += 1
            await asyncio.sleep(0.8)

        print(f"[{self.name}] Finished. Extracted {len(all_jobs)} jobs.")
        return all_jobs