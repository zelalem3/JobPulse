from playwright.sync_api import sync_playwright
from scraper import get_job_links
from parser import parse_job

def main():
    links = get_job_links()
    print(f"Found {len(links)} jobs")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(user_agent="Mozilla/5.0")

        for link in links:
            try:
                #
                job = parse_job(page, link) 
                
                if not job or not job["title"]:
                    continue

                
                print(f"Saved: {job['title']}")
            except Exception as e:
                print(f"Failed: {link} | Error: {e}")
                
        browser.close()