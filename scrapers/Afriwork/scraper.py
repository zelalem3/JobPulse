import requests
from datetime import datetime
from common.base_scraper import BaseScraper
from common.models import JobListing


class AfriworkScraper(BaseScraper):
    def __init__(self):
        super().__init__("Afriwork")
        self.url = "https://api.afriworket.com/v1/graphql"
        self.headers = {
            "Content-Type": "application/json",
            "x-hasura-role": "anonymous"
        }

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
   
        response = requests.post(self.url, headers=self.headers, json=payload)
        print(f"[DEBUG] Status Code: {response.status_code}")
       
        return response.json().get("data", {}).get("jobs", [])

    def parse(self, item: dict) -> JobListing:
        # 1. Complex extraction logic (ported from your old parser)
        skills = [s.get("skill", {}).get("name") for s in item.get("skill_requirements", []) if s.get("skill")]
        
        # Salary Logic
        salary = "Negotiable"
        if item.get("compensation_amount_cents"):
            salary = f"{float(item['compensation_amount_cents'])/100:,.2f} {item.get('compensation_currency', 'ETB')}"

        # Date Parsing
        posted_at = item.get("published_at") or item.get("created_at")
        if posted_at:
            posted_at = datetime.fromisoformat(posted_at.replace("Z", "+00:00"))

        # 2. Return the validated Pydantic model
        return JobListing(
            title=item.get("title") or "Untitled Job",
            company=item.get("entity", {}).get("name") or "Unknown",
            location=item.get("city", {}).get("name") or "Addis Ababa",
            specific_address=item.get("city", {}).get("name") or "Addis Ababa",
            description=item.get("description") or "",
            requirements=item.get("experience_level"),
            employment_type=item.get("job_type", {}).get("name") if isinstance(item.get("job_type"), dict) else "N/A",
            salary=salary,
            skills=skills,
            posted_at=posted_at,
            source="Afriwork",
            url=f"https://afriworket.com/jobs/{item.get('id')}"
        )