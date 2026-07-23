# JobPulse 🔍💼

JobPulse is a full-stack job aggregation and recommendation platform designed to collect job postings from multiple regional and remote sources, help users discover career opportunities, save listings, receive personalized recommendations, and get notified when new jobs match their interests.

---

## 🚀 Features

### 🔐 Authentication & Security
* User registration and login functionality.
* Secure API authentication powered by **Laravel Sanctum**.
* Protected routes and robust session management.

### 💼 Job Listings & Search
* Browse aggregated job postings from diverse channels.
* Detailed job view containing full descriptions, company info, and requirements.
* Advanced search and multi-parameter filtering capabilities.
* Multi-source job aggregation engine.

### 🔖 Saved Jobs Dashboard
* Bookmark interesting job opportunities instantly.
* Centralized management of saved jobs from a personal user dashboard.

### 📊 Dashboard Analytics
* Real-time metrics tracking total available jobs and user-saved statistics.
* Insights on top hiring companies and most in-demand technical skills.
* Visualized job posting trends and graphs powered by **Recharts**.

### ⭐ Personalized Recommendations
* Skill-based and location-based job recommendations.
* Dynamic match score calculation matching user profiles to job listings.

### 🔔 Job Alerts & Notifications
* Create and manage custom job alerts with multiple alert configurations.
* Keyword and location-based matching algorithms.
* Automated email notifications tested and previewed via **Mailpit**.

### 🤖 Automated Job Scraping System
JobPulse features an extensible Python-based scraping and ingestion pipeline designed to extract listings from:
* **EthioJobs**
* **GeezJobs**
* **Telegram Channels**
* **Remote Job Boards**
* Built with asynchronous scraping utilities and **Playwright** for dynamic single-page applications.

---

## 🛠️ Tech Stack

### Backend
* **PHP 8**
* **Laravel 12**
* **Laravel Sanctum**
* **PostgreSQL**
* **Mailpit** (Email testing)
* **Docker & Docker Compose**

### Frontend
* **React**
* **TypeScript**
* **Vite**
* **Tailwind CSS**
* **Axios**
* **Recharts**

### Scrapers & Ingestion
* **Python**
* **Playwright**
* **BeautifulSoup**
* **Requests**
* **Asyncio utilities**

---

## 🏗️ Architecture

```text
React Frontend (TypeScript / Vite)
        │
        ▼
Laravel 12 API Backend
        │
        ├── PostgreSQL Database
        ├── Mailpit (Email Notifications)
        └── Python & Playwright Scrapers

```
## 📂 Project Structure

```
JobPulse/
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


⚙️ Installation & Setup
1. Clone the Repository
```Bash
git clone [https://github.com/zelalem3/JobPulse.git](https://github.com/zelalem3/JobPulse.git)
cd JobPulse
```
2. Start Docker Containers
``` Bash
docker compose up -d --build
```
3. Backend Setup
```Bash
docker compose exec backend composer install
docker compose exec backend php artisan migrate
docker compose exec backend php artisan key:generate
```

4. Frontend Setup
``` Bash
docker compose exec frontend npm install
```
## 🚀 Running the Application
Frontend Interface: http://localhost:3000

Backend API: http://localhost:8000

Mailpit Dashboard: http://localhost:8025

🔌 API Endpoints
Authentication
Plaintext
POST /api/auth/register
POST /api/auth/login
Jobs
Plaintext
GET /api/jobs
GET /api/jobs/{id}
Saved Jobs
Plaintext
GET /api/savedjobs
POST /api/savejob/{id}
Job Alerts
Plaintext
GET /api/alerts
POST /api/alerts
PUT /api/alerts/{id}
DELETE /api/alerts/{id}
Recommendations
Plaintext
GET /api/recommendations
Dashboard Analytics
Plaintext
GET /api/dashboard/stats
GET /api/dashboard/topcompanies
GET /api/dashboard/skills
GET /api/dashboard/graph
🗺️ Future Improvements
In-app notification center

Automated resume parsing and matching integration

Direct Telegram bot alert notifications

Advanced recommendation engine enhancements

Administrative management and scraper monitoring dashboard

Complete application tracking system (ATS) workflow

## 📸 Screenshots

# Login Page

<img width="1604" height="896" alt="image" src="https://github.com/user-attachments/assets/cb6d967c-7179-40f7-b077-0d2dac4a15e5" />


# User Dashboard

<img width="1596" height="854" alt="image" src="https://github.com/user-attachments/assets/37836e3b-18e4-44a1-b90b-7d2ecba8b1cc" />


# Job Listings & Search Filters

<img width="1624" height="896" alt="image" src="https://github.com/user-attachments/assets/f4711b4c-34a1-4173-8f8f-1e59209258ae" />


# Saved Jobs Manager

<img width="1565" height="864" alt="image" src="https://github.com/user-attachments/assets/d90cda36-4208-4d28-8cb0-c0aed37aae0c" />


# Custom Alerts Configuration

<img width="1530" height="791" alt="image" src="https://github.com/user-attachments/assets/964ce871-429b-4fcb-97a2-724d471e66ff" />


## 👨‍💻 Author
Zelalem Getnet

Software engineer and computer science graduate specializing in full-stack web engineering, backend architecture, and automated data pipelines.

GitHub: zelalem3

## 📜 License
This project is licensed under the MIT License.
