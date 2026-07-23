import requests
import asyncio
from datetime import datetime
from common.base_scraper import BaseScraper
from common.models import JobListing
from addskill import extract_skills  


def safe_str(text: any, length: int = 250) -> str:
    if text is None: return ""
    return str(text).strip()[:length]

class AfriworkScraper(BaseScraper):
    def __init__(self):
        super().__init__("Afriwork")
        self.url = "https://api.afriworket.com/v1/graphql"
        self.headers = {"Content-Type": "application/json", "x-hasura-role": "anonymous"}

    def fetch(self) -> list:
        payload = {
            "operationName": "GetAllJobs",
            "query": """query GetAllJobs($offset: Int!) {
                jobs(limit: 30, offset: $offset, where: {approval_status: {_in: ["PUBLISHED", "REFRESHED"]}}) {
                    id, title, created_at, published_at, description, job_type, job_site, 
                    skill_requirements { skill { name } }, city { name }, 
                    sectors { sector { name } }, deadline, compensation_amount_cents, 
                    compensation_currency, experience_level, entity { name }
                }
            }""",
            "variables": {"offset": 0}
        }
        try:
            response = requests.post(self.url, headers=self.headers, json=payload, timeout=10)
            return response.json().get("data", {}).get("jobs", [])
        except Exception as e:
            print(f"[Afriwork] Fetch failed: {e}")
            return []

    def parse(self, item: dict) -> JobListing:
        # Salary logic
        salary = "Negotiable"
        if item.get("compensation_amount_cents"):
            salary = f"{float(item['compensation_amount_cents'])/100:,.2f} {item.get('compensation_currency', 'ETB')}"

        # Date parsing
        posted_at = item.get("published_at") or item.get("created_at")
        if posted_at:
            posted_at = datetime.fromisoformat(posted_at.replace("Z", "+00:00"))

        raw_description = item.get("description") or ""

        
        extracted_skills = extract_skills(raw_description)

        return JobListing(
            title=safe_str(item.get("title"), 250) or "Untitled Job",
            company=safe_str(item.get("entity", {}).get("name"), 250) or "Unknown",
            location=safe_str(item.get("city", {}).get("name"), 250) or "Addis Ababa",
            description=safe_str(raw_description, 2500),
            requirements=safe_str(item.get("experience_level"), 250),
            employment_type=safe_str(item.get("job_type", {}).get("name") if isinstance(item.get("job_type"), dict) else "N/A", 250),
            salary=safe_str(salary, 250),
            posted_at=posted_at,
            source="Afriwork",
            url=f"https://afriworket.com/jobs/{item.get('id')}",
            skills=extracted_skills # 👈 Attach extracted skills array here
        )

    async def run(self):
        """Run fetch in a thread so it doesn't block the async event loop."""
        items = await asyncio.to_thread(self.fetch)
        return [self.parse(item) for item in items]