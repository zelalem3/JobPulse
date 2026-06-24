import os
import sys

# 1. Dynamically find the absolute path to the "scrapers" root folder
# '__file__' is main.py -> dirname is ethiojobs -> parent dirname is scrapers
SCRAPERS_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 2. Inject it into Python's search paths before importing 'common'
if SCRAPERS_ROOT not in sys.path:
    sys.path.insert(0, SCRAPERS_ROOT)

# 3. Now these imports will work perfectly regardless of where you execute the script!
from common.database import save_job
from scraper import get_job_links  # If this fails, use: from ethiojobs.scraper import get_job_links
from parser import parse_job       # If this fails, use: from ethiojobs.parser import parse_job

def main():
    links = get_job_links()
    for link in links[:10]:
        job = parse_job(link)
        save_job(job)

if __name__ == "__main__":
    main()