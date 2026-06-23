import requests
from bs4 import BeautifulSoup


def parse_job(url):
    response = requests.get(url)

    soup = BeautifulSoup(response.text, "lxml")

    title = soup.find("h1").text.strip()

    return {
        "title": title,
        "source": "EthioJobs",
        "source_url": url
    }