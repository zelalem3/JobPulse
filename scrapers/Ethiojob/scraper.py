from playwright.sync_api import sync_playwright

BASE_URL = "https://www.ethiojobs.net"
START_URL = "https://www.ethiojobs.net/jobs"


def is_valid_job_link(href):
    if not href:
        return False

    if "/job/" not in href:
        return False

    blacklist = [
        "/companies",
        "/blog",
        "/faq",
        "/contact",
        "/employers",
        "/sign",
    ]

    return not any(x in href for x in blacklist)


def normalize_url(href):
    if href.startswith("/"):
        return BASE_URL + href
    return href


def get_job_links():
    links = set()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto(
            START_URL,
            wait_until="networkidle",
            timeout=60000
        )

        page.wait_for_timeout(3000)

        anchors = page.locator("a")
        count = anchors.count()

        for i in range(count):
            href = anchors.nth(i).get_attribute("href")

            if not is_valid_job_link(href):
                continue

            links.add(normalize_url(href))

        browser.close()

    return list(links)