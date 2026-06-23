import time
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
from database import save_job
from apscheduler.schedulers.blocking import BlockingScheduler

def scrape_jobs():
    print("🚀 Starting JobPulse scraper execution...")
    
    with sync_playwright() as p:
        # Launch browser inside Docker environment
        browser = p.chromium.launch(headless=True, args=["--no-sandbox", "--disable-setuid-sandbox"])
        page = browser.new_page()
        
        try:
            # Replace this URL with your target job search index link
            url = "https://remoteok.com/remote-engineer-jobs" 
            print(f"🔗 Navigating to {url}")
            page.goto(url, wait_until="networkidle", timeout=60000)
            
            # Extract raw HTML page content and hand off to BeautifulSoup
            html = page.content()
            soup = BeautifulSoup(html, "html.parser")
            
            # Structural Parsing Logic (Targeting RemoteOK rows as an initial example setup)
            job_rows = soup.find_all("tr", class_="job")
            print(f"🔍 Found {len(job_rows)} raw job items matching filter criteria.")
            
            for row in job_rows:
                try:
                    title = row.find("h2", itemprop="title").get_text(strip=True)
                    company = row.find("h3", itemprop="name").get_text(strip=True)
                    location = row.find("div", class_="location").get_text(strip=True) if row.find("div", class_="location") else "Remote"
                    
                    # Construct structural absolute URL
                    job_path = row.find("a", class_="preventLink")["href"]
                    job_url = f"https://remoteok.com{job_path}" if job_path.startswith("/") else job_path
                    
                    job_payload = {
                        "title": title,
                        "company": company,
                        "location": location,
                        "description": "Scraped via JobPulse Python Engine Engine.",
                        "url": job_url,
                        "source": "RemoteOK"
                    }
                    
                    # Save to Postgres
                    save_job(job_payload)
                    print(f"💾 Saved: {title} at {company}")
                    
                except Exception as row_err:
                    continue
                    
        except Exception as e:
            print(f"❌ Scraping cycle failed: {e}")
        finally:
            browser.close()

# Scheduler engine configurations
scheduler = BlockingScheduler()
# Runs right away on container startup, then repeats every 1 hour
scheduler.add_job(scrape_jobs, 'interval', hours=1, next_run_time=None) 

if __name__ == "__main__":
    print("📡 JobPulse Scraper Daemon Initialized...")
    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        print("Stopping engine process gracefully.")