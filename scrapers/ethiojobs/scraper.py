import requests
from bs4 import BeautifulSoup

BASE_URL = "https://www.ethiojobs.net"


def get_job_links():
    response = requests.get(BASE_URL)

    soup = BeautifulSoup(response.text, "lxml")

    jobs = []

    for card in soup.select(".vacancy"):
        link = card.find("a")

        if link:
            jobs.append(BASE_URL + link["href"])

    return jobs