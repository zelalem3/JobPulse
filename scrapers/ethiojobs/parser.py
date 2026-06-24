from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup



def parse_job(url: str):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto(url, wait_until="domcontentloaded")
        page.wait_for_timeout(2000)

        soup = BeautifulSoup(page.content(), "lxml")

        browser.close()

    # --- BASIC EXTRACTION (we will refine later) ---
    title = soup.find("h1").get_text(strip=True) if soup.find("h1") else None
    


    return {
        "title": title,
        "source": "EthioJobs",
        "source_url": url
    }