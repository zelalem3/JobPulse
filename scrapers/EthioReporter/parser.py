import re
from datetime import datetime
from bs4 import BeautifulSoup
from curl_cffi import requests

def clean(text):
    if not text:
        return None
    text = text.replace("\xa0", " ")  # Clear non-breaking spaces
    return re.sub(r"\s+", " ", text).strip()

def parse_job(url: str) -> dict:
    """
    Parses an Ethiopian Reporter Jobs detail page by targeting the Noo JobMonster 
    grid elements and structured class layouts shown on the live page.
    """
    headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Connection": "keep-alive",
        "Referer": "https://www.ethiopianreporterjobs.com/"
    }
    
    try:
        response = requests.get(url, headers=headers, impersonate="chrome", timeout=20)
        
        if response.status_code != 200:
            print(f"Failed to fetch {url} | Status: {response.status_code}")
            return {}

        soup = BeautifulSoup(response.text, "lxml")

        # ----------------------------
        # 1. Title Extraction
        # ----------------------------
        title = None
        h1 = soup.find("h1", class_="job-title") or soup.find("h1")
        if h1:
            title = clean(h1.get_text())

        # Default standard structures
        company = "Employer Not Specified"
        location = "Addis Ababa"
        employment_type = "Full Time"
        category = "IT & Telecom"
        salary = "Not Specified"
        experience_level = "Not Specified"
        deadline = "Contact Employer"

        # ----------------------------
        # 2. Extract Top Meta Info Badges (Under the title)
        # ----------------------------
        # These are often structured inside .job-meta or a specific header div
        meta_header = soup.find(class_="job-meta") or soup.find(class_="job-header")
        if meta_header:
            # Check for links or span tags holding Location, Type, Category
            # e.g. <span class="job-type"><a href="...">Contract</a></span>
            type_tag = meta_header.find(class_="job-type") or meta_header.find("a", href=re.compile(r"/job-type/"))
            if type_tag:
                employment_type = clean(type_tag.get_text())

            loc_tag = meta_header.find(class_="job-location") or meta_header.find("a", href=re.compile(r"/job-location/"))
            if loc_tag:
                location = clean(loc_tag.get_text())

            cat_tag = meta_header.find(class_="job-category") or meta_header.find("a", href=re.compile(r"/job-category/"))
            if cat_tag:
                category = clean(cat_tag.get_text())

        # Extract Company (often styled just above or below the title)
        comp_tag = soup.find(class_="job-company") or soup.find("a", href=re.compile(r"/companies/"))
        if comp_tag:
            company = clean(comp_tag.get_text())
        else:
            # Fallback to the top breadcrumb/employer tag in Noo JobMonster
            brand = soup.find(class_="company-name") or soup.find(class_="job-brand")
            if brand:
                company = clean(brand.get_text())

        # ----------------------------
        # 3. Extract From the "JOB OVERVIEW" Grid
        # ----------------------------
        # This grid has explicit column cards with classes like '.salary', '.experience', '.closing_date'
        overview_container = soup.find(class_="job-overview") or soup.find(class_="job-custom-fields")
        if overview_container:
            # Find all overview items/boxes
            items = overview_container.find_all(class_=re.compile(r"col-|overview-item|field-"))
            for item in items:
                label_tag = item.find("span") or item.find("strong") or item.find(class_="title")
                value_tag = item.find(class_="value") or item.find("p") or item
                
                if label_tag and value_tag:
                    lbl = clean(label_tag.get_text()).lower()
                    val = clean(value_tag.get_text())
                    
                    # Remove the label text if the value tag wraps the whole element
                    if val.lower().startswith(lbl):
                        val = clean(val[len(lbl):].lstrip(":").strip())

                    if "salary" in lbl:
                        salary = val
                    elif "experience" in lbl:
                        experience_level = val
                    elif "deadline" in lbl or "closing" in lbl:
                        deadline = val

        # ----------------------------
        # 4. Content / Description Parsing
        # ----------------------------
        description = ""
        image_clipping_url = None

        # Look for the main description container (often class="job-desc" or "entry-content")
        content_container = (
            soup.find(class_="job-desc")
            or soup.find(class_="job-description")
            or soup.find(class_="entry-content")
            or soup.find("article")
        )

        if content_container:
            # Cleanly get all text
            description = clean(content_container.get_text("\n", strip=True))
            
            # Check for image clipping ads
            images = content_container.find_all("img")
            for img in images:
                src = img.get("src") or img.get("data-src") or img.get("data-lazy-src")
                if src and any(ext in src.lower() for ext in [".jpg", ".jpeg", ".png", ".webp"]):
                    if "logo" not in src.lower() and "avatar" not in src.lower():
                        image_clipping_url = src
                        break

        if not description or len(description) < 40:
            if image_clipping_url:
                description = f"This job was published as an image clipping. View image: {image_clipping_url}"
            else:
                description = "No written job description details available on the source page."

        # ----------------------------
        # 5. Fallback Parsers (If structural markers failed)
        # ----------------------------
        page_text = soup.get_text("\n", strip=True)

        if company == "Employer Not Specified":
            match = re.search(r"Company\s*:?\s*(.+)", page_text, re.IGNORECASE)
            if match:
                company = clean(match.group(1))

        if location == "Addis Ababa":
            match = re.search(r"Location\s*:?\s*(.+)", page_text, re.IGNORECASE)
            if match:
                location = clean(match.group(1))

        # ----------------------------
        # 6. Deadline Formatting & Normalizing
        # ----------------------------
        parsed_deadline = None
        if deadline:
        
            for fmt in ("%B %d, %Y", "%b %d, %Y", "%Y-%m-%d", "%d-%m-%Y"):
                try:
                    parsed_deadline = datetime.strptime(deadline, fmt).strftime("%Y-%m-%d")
                    break
                except ValueError:
                    continue

            if not parsed_deadline:
                match = re.search(r"\b\d{4}-\d{2}-\d{2}\b", deadline)
                if match:
                    parsed_deadline = match.group(0)

      
        # ----------------------------
        # 7. Skill extraction
        # ----------------------------
        skills = []
        common_skills = [
            "python", "django", "laravel", "react", "vue", "angular", 
            "flutter", "java", "javascript", "typescript", "php", "mysql", 
            "postgresql", "docker", "git", "linux", "node", "aws", 
            "azure", "kubernetes", "html", "css", "c++", "c#", "rust"
        ]

        if description:
            lower_desc = description.lower()
            for skill in common_skills:
                escaped_skill = re.escape(skill)
                pattern = rf"\b{escaped_skill}\b"
                if re.search(pattern, lower_desc):
                    skills.append(skill.title())

        # UI Discovery Telemetry
        discovered_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

        return {
            "title": title if title else "Untitled Position",
            "company": company,
            "location": location,
            "requirements": description,
            "description": description,
            "image_clipping": image_clipping_url,
            "employment_type": employment_type,
            "experience_level": experience_level,
            "salary": salary,
            "category": category,
            "skills": skills,
            "deadline": parsed_deadline,
            "posted_at": discovered_at,
            "source": "Ethiopian Reporter Jobs",
            "url": url,
        }

    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return {}