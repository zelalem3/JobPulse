import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

BASE_URL = "https://www.ethiopianreporterjobs.com"
URL = "https://www.ethiopianreporterjobs.com/job-category/it-jobs-in-ethiopia/"

headers = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/138.0 Safari/537.36"
    )
}


def get_job_links(link: str) -> bool:
    URL = "https://www.ethiopianreporterjobs.com/job-category/it-jobs-in-ethiopia/"
    headers = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    try:
        response = requests.get(URL, headers=headers, timeout=15)
        print(f"Status Code: {response.status_code}")
        print(f"Content Length: {len(response.text)} characters")
        
        soup = BeautifulSoup(response.text, "lxml")
        all_links = soup.find_all("a", href=True)
        print(f"Total raw links found on page: {len(all_links)}")
        
    except Exception as e:
        print(f"Error occurred: {e}")