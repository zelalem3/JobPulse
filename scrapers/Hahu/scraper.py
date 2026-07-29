import asyncio
from datetime import datetime
from curl_cffi import requests
from common.models import JobListing
from common.base_scraper import BaseScraper
from addskill import extract_skills


def safe_str(text: any, length: int = 250) -> str:
    if text is None: return ""
    return str(text).strip()[:length]


class HaHuJobsScraper(BaseScraper):
    def __init__(self):
        super().__init__("HaHuJobs")
        self.api_url = "https://graph.aggregator.hahu.jobs/v1/graphql"
        self.headers = {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.8",
            "content-type": "application/json",
            "origin": "https://www.hahu.jobs",
            "referer": "https://www.hahu.jobs/",
            "user-agent": (
                "Mozilla/5.0 (X11; Linux x86_64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/138.0.0.0 Safari/537.36"
            )
        }

    def fetch(self) -> list:
        payload = {
            "query": (
                "query ($args: search_jobs_args!, $filter: jobs_bool_exp, $limit: Int, $offset: Int, $orderBy: [jobs_order_by!]) {\n"
                "  search_jobs_aggregate(args: $args, where: $filter) {\n"
                "    aggregate {\n"
                "      count\n"
                "    }\n"
                "  }\n"
                "  jobs: search_jobs(\n"
                "    where: $filter\n"
                "    order_by: $orderBy\n"
                "    args: $args\n"
                "    offset: $offset\n"
                "    limit: $limit\n"
                "  ) {\n"
                "    id\n"
                "    title\n"
                "    summary\n"
                "    salary\n"
                "    deadline\n"
                "    location\n"
                "    type\n"
                "    application_method\n"
                "    application_url\n"
                "    application_email\n"
                "    entity {\n"
                "      name\n"
                "    }\n"
                "    sub_sector {\n"
                "      name\n"
                "      sector {\n"
                "        name\n"
                "      }\n"
                "    }\n"
                "  }\n"
                "}"
            ),
            "variables": {
                "limit": 50,
                "filter": {
                    "_and": [
                        {"expired": {"_eq": False}},
                        {"requested_to_delete": {"_eq": False}}
                    ]
                },
                "args": {"search": ""},
                "offset": 0,
                "orderBy": [{"priority": "desc_nulls_last"}, {"deadline": "asc"}]
            }
        }

        try:
            print(f"[HaHuJobs] Querying GraphQL endpoint directly...")
            response = requests.post(self.api_url, json=payload, headers=self.headers, impersonate="chrome", timeout=30)
            
            if response.status_code != 200:
                print(f"[HaHuJobs] GraphQL error: Status {response.status_code}")
                return []

            data = response.json()
            jobs_data = data.get("data", {}).get("jobs", [])
            print(f"[HaHuJobs] Fetched {len(jobs_data)} jobs directly from API.")
            return jobs_data

        except Exception as e:
            print(f"[HaHuJobs] Fetch exception: {e}")
            return []

    def parse(self, job: dict) -> JobListing | None:
        try:
            job_id = job.get("id")
            title = job.get("title") or "Untitled Position"
            
            entity = job.get("entity") or {}
            company = entity.get("name") or "Not Specified"
            
            location = job.get("location") or "Addis Ababa"
            description = job.get("summary") or title
            salary = job.get("salary") or "Negotiable"
            employment_type = job.get("type") or "Full Time"
            
            # Construct standard detail page URL if available
            url = f"https://www.hahu.jobs/jobs/{job_id}" if job_id else "https://www.hahu.jobs/jobs"

            extracted_skills = extract_skills(
                job_description_text=safe_str(description, 2500),
                job_title=safe_str(title, 250)
            )

            return JobListing(
                title=safe_str(title, 255),
                company=safe_str(company, 255),
                location=safe_str(location, 255),
                requirements=safe_str(description, 4000) or None,
                description=safe_str(description, 10000) or "",
                employment_type=safe_str(employment_type, 50),
                experience_level="Not Specified",
                salary=safe_str(salary, 100),
                category="IT & Software",
                deadline=None,
                posted_at=datetime.utcnow(),
                source="HaHuJobs",
                url=str(url),
                skills=extracted_skills,
            )

        except Exception as e:
            print(f"[HaHuJobs] Error mapping job dictionary: {e}")
            return None

    async def run(self):
        raw_jobs = await asyncio.to_thread(self.fetch)
        jobs = []
        for item in raw_jobs:
            job = self.parse(item)
            if job:
                jobs.append(job)
        print(f"[HaHuJobs] Finished. Total successfully parsed: {len(jobs)}")
        return jobs