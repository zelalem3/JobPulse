from common.models import JobListing
from common.normalizer import normalize_job

job = JobListing(
    title="Sr Software Engineer (Urgent)",
    company="Safaricom Ethiopia PLC",
    location="Addis Ababa, Ethiopia",
    employment_type="full time",
    experience_level="mid-level",
    salary="competitive",
    description="We are hiring a backend software engineer.",
    url="https://example.com/job/1"
)

job = normalize_job(job)

print(job.title)
print(job.company)
print(job.location)
print(job.employment_type)
print(job.experience_level)
print(job.salary)
print(job.category)