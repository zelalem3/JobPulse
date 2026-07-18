# common/base_scraper.py
from abc import ABC, abstractmethod
from typing import List
from common.models import JobListing

class BaseScraper(ABC):
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    def fetch(self) -> List[dict]:
        """Fetch raw JSON/HTML from the source."""
        pass

    @abstractmethod
    def parse(self, raw_data: dict) -> JobListing:
        """Transform raw data into a validated JobListing object."""
        pass

    def run(self):
        print(f"[{self.name}] Running...")

        raw_items = self.fetch()
        validated_jobs = []

        for item in raw_items:
            try:
                validated_jobs.append(self.parse(item))
            except Exception as e:
                print(f"Skipping malformed job in {self.name}: {e}")

        return validated_jobs