from playwright.sync_api import sync_playwright

BASE_URL = "https://www.ethiojobs.net"
START_URL = "https://www.ethiojobs.net/jobs"


def is_valid_job_link(href: str) -> bool:
    if not href:
        return False

    # must be job-related
    if "/job/" not in href and "/jobs/" not in href:
        return False

    # exclude listing page
    if href in ["/jobs", "/job", "/jobs#", "/job#"]:
        return False

    # exclude company pages
    if "/companies" in href:
        return False

    # exclude auth / misc pages
    blacklist = ["/sign", "/faq", "/contact", "/blog", "/employers"]
    if any(x in href for x in blacklist):
        return False

    return True


def normalize_url(href: str) -> str:
    if href.startswith("/"):
        return BASE_URL + href
    return href


def get_job_links():
    links = set()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto(START_URL, wait_until="domcontentloaded", timeout=60000)
        page.wait_for_selector("a", timeout=15000)
        page.wait_for_timeout(3000)

        anchors = page.locator("a")
        count = anchors.count()

        print(f"Total anchors found: {count}")

        for i in range(count):
            href = anchors.nth(i).get_attribute("href")

            if not is_valid_job_link(href):
                continue

            full_url = normalize_url(href)

            
            full_url = full_url.split("#")[0]

            links.add(full_url)

        browser.close()

    return sorted(list(links))


if __name__ == "__main__":
    jobs = get_job_links()

    print("\n====================")
    print(f"TOTAL CLEAN JOB LINKS: {len(jobs)}\n")

    for job in jobs[:30]:
        print(job)