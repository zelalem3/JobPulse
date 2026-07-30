import re
from urllib.parse import urlparse


# ============================================================
# Validation Result
# ============================================================

class ValidationResult:

    def __init__(self):

        self.valid = True
        self.errors = []

    def add(self, message):

        self.valid = False
        self.errors.append(message)


# ============================================================
# URL
# ============================================================

def valid_url(url):

    if not url:
        return False

    try:

        parsed = urlparse(url)

        return bool(parsed.scheme and parsed.netloc)

    except Exception:

        return False


# ============================================================
# Text Quality
# ============================================================

def clean_text(text):

    if not text:
        return ""

    text = re.sub(r"\s+", " ", str(text))

    return text.strip()


# ============================================================
# Validate Job
# ============================================================

def validate_job(job):

    result = ValidationResult()

    title = clean_text(job.title)

    company = clean_text(job.company)

    description = clean_text(job.description)

    requirements = clean_text(job.requirements)

    responsibilities = clean_text(job.responsibilities)

    # --------------------------------------------------------
    # Required fields
    # --------------------------------------------------------

    if not title:

        result.add("Missing title")

    if len(title) < 3:

        result.add("Title too short")

    if not company:

        result.add("Missing company")

    if not valid_url(job.url):

        result.add("Invalid URL")

    # --------------------------------------------------------
    # Content
    # --------------------------------------------------------

    total_content = len(
        description +
        requirements +
        responsibilities
    )

    if total_content < 100:

        result.add("Very little content")

    # --------------------------------------------------------
    # Garbage detection
    # --------------------------------------------------------

    bad_titles = {
        "job",
        "vacancy",
        "apply now",
        "career",
    }

    if title.lower() in bad_titles:

        result.add("Generic title")

    return result