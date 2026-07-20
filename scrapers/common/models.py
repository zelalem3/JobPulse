from pydantic import BaseModel, HttpUrl
from typing import List, Optional
from datetime import datetime


class JobListing(BaseModel):
    company_id: Optional[str] = "Unknown"

    title: str
    company: str
    location: str

    requirements: Optional[str] = None
    description: Optional[str] = None
    responsibilities: Optional[str] = None

    employment_type: Optional[str] = None
    experience_level: Optional[str] = None
    salary: str = "Negotiable"
    category: Optional[str] = None

    deadline: Optional[datetime] = None
    posted_at: Optional[datetime] = None

    source: str = "Afriwork"
    url: str

    skills: List[str] = []

    is_active: bool = True