from scraper import get_job_links
from parser import parse_job
import os
import sys



SCRAPERS_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


if SCRAPERS_ROOT not in sys.path:
    sys.path.insert(0, SCRAPERS_ROOT)

from common.database import save_job


def main():

    links = get_job_links()
    

    urls = []
    for link in links:
        if isinstance(link, str):
            urls.append(link)
        elif hasattr(link, "get"):
            urls.append(link.get("href"))


    urls = list(set(filter(None, urls)))
    print(f"Found {len(urls)} unique links to parse")

  
    for url in urls:
        try:
           
            job = parse_job(url) 
            
            if not job or not job.get("title"):
                continue

            save_job(job)
            print(f"Saved: {job['title']} | Company: {job.get('company')}")
            
        except Exception as e:
            print(f"Failed to parse: {url} | Error: {e}")


if __name__ == "__main__":
    main()