
# JobPulse 🔍💼


### Intelligent Job Aggregation & Recommendation Platform

**JobPulse** is a full-stack job intelligence platform built to aggregate opportunities from multiple regional and remote sources, help users discover relevant jobs, save opportunities, receive personalized recommendations, and configure automated job alerts.

> **Collect → Normalize → Analyze → Recommend → Notify**

<p align="center">
  <a href="https://job-pulse-five.vercel.app/">
    <img src="https://img.shields.io/badge/🌐_Live_Demo-JobPulse-2ea44f?style=for-the-badge" alt="Live Demo" />
  </a>
  <a href="https://github.com/zelalem3/JobPulse">
    <img src="https://img.shields.io/badge/💻_Source_Code-GitHub-181717?style=for-the-badge&logo=github" alt="Source Code" />
  </a>
</p>

---

## 🎯 What Problem Does JobPulse Solve?

Job opportunities are often scattered across different websites, Telegram channels, and remote job boards.

JobPulse brings these sources together into a single platform and adds intelligence on top of the raw listings.

Instead of simply aggregating jobs, the system can:

* 🔎 Search and filter opportunities
* 💾 Save interesting jobs
* 🎯 Match jobs against user skills and location
* 📊 Analyze hiring and skill trends
* 🔔 Create personalized job alerts
* 📧 Notify users when matching opportunities become available
* 🤖 Automatically collect and process listings from multiple sources

---

# ✨ Features

## 🔐 Authentication & Security

* User registration and login
* Laravel Sanctum API authentication
* Protected API routes
* Authenticated user-specific resources
* Session/token-based API access

---

## 💼 Job Discovery

* Aggregated job listings from multiple sources
* Detailed job pages
* Company and requirement information
* Search functionality
* Multi-parameter filtering
* Source-aware job listings
* Centralized job discovery experience

---

## 🔖 Saved Jobs

Users can save interesting opportunities and manage them from a centralized dashboard.

* Save jobs
* Remove saved jobs
* View saved opportunities
* Manage saved listings from the user dashboard

---

## 📊 Job Market Dashboard

JobPulse provides analytics to help users understand the job market.

### Dashboard insights include:

* Total available jobs
* User's saved jobs
* Most requested technical skills
* Job posting trends
* Visual analytics and charts

Charts and data visualizations are implemented using **Recharts**.

---

## ⭐ Personalized Job Recommendations

JobPulse uses user profile information to generate relevant job recommendations.

The recommendation system considers:

* 🧠 User technical skills
* 📍 User location
* 💼 Job requirements
* 🎯 Skill overlap and matching

Each recommendation can be evaluated through a **dynamic match score**, helping users prioritize opportunities that align with their background.

---

## 🔔 Job Alerts

Users can create custom alerts for opportunities matching their interests.

Supported criteria include:

* Keywords
* Location
* Custom alert configurations

The system can automatically identify matching jobs and trigger email notifications.

Email workflows can be tested locally using **Mailpit**.

---

# 🤖 Automated Job Intelligence Pipeline

One of JobPulse's most important components is its Python-based scraping and ingestion system.

The pipeline is designed to collect job listings from multiple sources, normalize the data, and feed it into the main application.

### Current sources include:

* 🌐 Afriwork
* 🌐 EthioJobs
* 🌐 EthioReporter
* 🌐 GeezJobs
* 📱 Telegram channels
* 🌍 Remote job sources

### Scraping technologies

* Python
* Playwright
* BeautifulSoup
* Requests
* Asyncio

Playwright is used for dynamic websites and JavaScript-heavy applications where traditional HTTP requests are insufficient.

---

# 🧠 Data Processing & Skill Extraction

JobPulse doesn't simply store scraped descriptions.

Job descriptions can be processed to identify relevant technical skills and connect them with the platform's skill taxonomy.

The processing pipeline supports:

```text
Raw Job Description
        │
        ▼
   Text Cleaning
        │
        ▼
 Local Skill Extraction
        │
        ├── High Confidence ──► Store Skills
        │
        └── Low Confidence
                 │
                 ▼
            Gemini AI
                 │
                 ▼
          Extracted Skills
                 │
                 ▼
             Database
```

This allows the recommendation system to compare **user skills ↔ job requirements** rather than relying only on job titles or keywords.

---

# 🏗️ System Architecture

```text
                    JOB SOURCES
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
      Websites         APIs        Telegram
          │              │              │
          └──────────────┼──────────────┘
                         ▼
              Python Scraping Layer
              ┌────────────────────┐
              │ Playwright         │
              │ BeautifulSoup      │
              │ Requests / Asyncio │
              └─────────┬──────────┘
                        │
                        ▼
                Data Normalization
                        │
                        ▼
                 Skill Extraction
                        │
                        ▼
              ┌─────────────────────┐
              │   Laravel 12 API    │
              │                     │
              │ Auth / Jobs /       │
              │ Recommendations /  │
              │ Alerts / Analytics  │
              └──────────┬──────────┘
                         │
                         ▼
                    PostgreSQL
                         │
                         ▼
               React + TypeScript
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
          Job Search  Dashboard  Recommendations
                         │
                         ▼
                    Notifications
                    ┌────┴────┐
                    ▼         ▼
                  Email   Telegram
```

---

# 🛠️ Technology Stack

### Backend

<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg" height="40" alt="PHP" />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg" height="40" alt="Laravel" />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" height="40" alt="Python" />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" height="40" alt="PostgreSQL" />
</p>

**PHP 8 · Laravel 12 · Laravel Sanctum · PostgreSQL**

### Frontend

<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" height="40" alt="React" />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" height="40" alt="TypeScript" />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" height="40" alt="Vite" />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" height="40" alt="Tailwind CSS" />
</p>

**React · TypeScript · Vite · Tailwind CSS · Axios · Recharts**

### Scraping & Automation

<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" height="40" alt="Python" />
</p>

**Python · Playwright · BeautifulSoup · Requests · Asyncio**

### Infrastructure & Development

<p align="left">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" height="40" alt="Docker" />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" height="40" alt="Redis" />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" height="40" alt="Git" />
  <img width="12" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg" height="40" alt="Linux" />
</p>

**Docker · Docker Compose · Redis · Git · Linux · Mailpit**

---

# 📂 Project Structure

```text
JobPulse/
│
├── backend/
│   ├── app/
│   ├── routes/
│   ├── database/
│   └── docker/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── services/
│
└── scrapers/
    ├── common/
    ├── ethiojobs/
    ├── geezjobs/
    └── telegram/
```

The project is separated into independent concerns:

* **Backend** — API, authentication, business logic, recommendations, alerts, analytics
* **Frontend** — user interface and API integration
* **Scrapers** — data collection and ingestion

---

# 🔌 API Overview

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

### Jobs

```http
GET /api/jobs
GET /api/jobs/{id}
```

### Saved Jobs

```http
GET  /api/savedjobs
POST /api/savejob/{id}
```

### Job Alerts

```http
GET    /api/alerts
POST   /api/alerts
PUT    /api/alerts/{id}
DELETE /api/alerts/{id}
```

### Recommendations

```http
GET /api/recommendations
```

### Dashboard Analytics

```http
GET /api/dashboard/stats
GET /api/dashboard/topcompanies
GET /api/dashboard/skills
GET /api/dashboard/graph
```

---

# ⚙️ Local Development

## 1. Clone the repository

```bash
git clone https://github.com/zelalem3/JobPulse.git
cd JobPulse
```

## 2. Start the development environment

```bash
docker compose up -d --build
```

## 3. Install and configure the backend

```bash
docker compose exec backend composer install
docker compose exec backend php artisan key:generate
docker compose exec backend php artisan migrate
```

## 4. Install frontend dependencies

```bash
docker compose exec frontend npm install
```

---

# 🚀 Development Services

| Service     | URL                     |
| ----------- | ----------------------- |
| Frontend    | `http://localhost:3000` |
| Laravel API | `http://localhost:8000` |
| Mailpit     | `http://localhost:8025` |

---

# 🗺️ Roadmap

Potential future improvements include:

* 🔔 In-app notification center
* 📱 Expanded Telegram notification workflows
* 🤖 More advanced recommendation algorithms
* 📊 Administrative analytics dashboard
* 🕷️ Scraper monitoring and health dashboard
* 📋 Application tracking system (ATS)
* 📈 More advanced job-market intelligence
* ⚡ Further optimization of scraping and background processing

---

# 📸 Screenshots

### 🔐 Authentication

*Add login/register screenshots here.*

### 📊 Dashboard

*Add dashboard screenshot here.*

### 💼 Job Search

*Add job listing and filtering screenshot here.*

### 🔖 Saved Jobs

*Add saved jobs screenshot here.*

### 🔔 Job Alerts

*Add alert configuration screenshot here.*

---

# 🌐 Live Demo

<p align="center">

<a href="https://job-pulse-five.vercel.app/">
  <img src="https://img.shields.io/badge/🚀_Open_JobPulse-Live_Demo-2ea44f?style=for-the-badge" alt="Open JobPulse" />
</a>

</p>

**Live Application:** https://job-pulse-five.vercel.app/

---

# 👨‍💻 Author

### Zelalem Getnet

**Full-Stack Software Engineer · Computer Science Graduate**

Interested in backend architecture, real-time applications, automation, data pipelines, and intelligent software systems.

<p align="left">
  <a href="https://github.com/zelalem3">
    <img src="https://img.shields.io/badge/GitHub-zelalem3-181717?style=for-the-badge&logo=github" alt="GitHub" />
  </a>
  <a href="https://www.linkedin.com/in/zelalem-getnet-533326246">
    <img src="https://img.shields.io/badge/LinkedIn-Zelalem_Getnet-0A66C2?style=for-the-badge&logo=linkedin" alt="LinkedIn" />
  </a>
</p>

---

# 📜 License

This project is licensed under the **MIT License**.
