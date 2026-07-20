import re
from bs4 import BeautifulSoup
from curl_cffi import requests

def get_job_links():
    URL = "https://www.ethiopianreporterjobs.com/job-category/it-jobs-in-ethiopia/"
    
    headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Alt-Used": "www.ethiopianreporterjobs.com",
        "Connection": "keep-alive",
    }

    try:
        # Use curl_cffi to match real-browser fingerprints
        response = requests.get(URL, headers=headers, impersonate="chrome", timeout=30)
        
        print(f"Status Code: {response.status_code}")
        print(f"Content Length: {len(response.text)} characters")
        
        if response.status_code != 200:
            print("Failed to access page.")
            return []

        soup = BeautifulSoup(response.text, "lxml")
        all_links = soup.find_all("a", href=True)
        
        # Regex to match URLs like: .../jobs-in-ethiopia/12345/
        job_url_pattern = re.compile(r"https://www\.ethiopianreporterjobs\.com/jobs-in-ethiopia/\d+/")
        
        # Extract unique, clean job links
        job_links = []
        for link in all_links:
            href = link.get("href")
            if job_url_pattern.match(href):
                job_links.append(href)
                
        # Remove duplicates while preserving order
        unique_job_links = list(dict.fromkeys(job_links))
        
        print(f"Total raw links found on page: {len(all_links)}")
        print(f"Filtered down to {len(unique_job_links)} real job detail URLs")
        return unique_job_links
        
    except Exception as e:
        print(f"Error occurred: {e}")
        return []
