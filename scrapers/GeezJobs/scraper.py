from playwright.sync_api import sync_playwright

BASE_URL = "https://geezjobs.com"
START_URL = "https://geezjobs.com/jobs-in-ethiopia"


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
        browser = p.chromium.launch(
            headless=False,
            args=["--disable-blink-features=AutomationControlled"]
        )

        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (X11; Linux x86_64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/138.0.0.0 Safari/537.36"
            ),
            viewport={"width": 1366, "height": 768},
            locale="en-US"
        )

        page = context.new_page()

        page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
        """)

        page.set_extra_http_headers({
            "Accept-Language": "en-US,en;q=0.9",
            "Upgrade-Insecure-Requests": "1"
        })

        try:
                page.goto(
                    START_URL,
                    wait_until="networkidle",
                    timeout=60000
                )

                page.wait_for_timeout(5000)

                html = page.content()

                with open("geezjobs.html", "w", encoding="utf-8") as f:
                    f.write(html)

                print(page.title())
                print(page.url)
                print(html[:2000])

        except Exception as e:
            print("Scraper error:", e)

        finally:
            browser.close()

    return list(links)