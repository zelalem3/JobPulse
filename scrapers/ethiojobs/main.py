import os
import sys


SCRAPERS_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


if SCRAPERS_ROOT not in sys.path:
    sys.path.insert(0, SCRAPERS_ROOT)


from common.database import save_job
from scraper import get_job_links  
from parser import parse_job       

def main():
    links = get_job_links()
    for link in links[:10]:
        job = parse_job(link)
        save_job(job)

if __name__ == "__main__":
    main()