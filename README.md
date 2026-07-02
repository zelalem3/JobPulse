# JobPulse 🔍💼

JobPulse is a full-stack job aggregation and recommendation platform that collects job postings from multiple sources, helps users discover opportunities, save jobs, receive personalized recommendations, and get notified when new jobs match their interests.

## Features

### 🔐 Authentication

* User registration and login
* Secure API authentication using Laravel Sanctum
* Protected routes and user sessions

### 💼 Job Listings

* Browse aggregated job postings
* View detailed job information
* Search and filter jobs
* Multi-source job aggregation

### 🔖 Saved Jobs

* Bookmark interesting job opportunities
* Manage saved jobs from a personal dashboard

### 📊 Dashboard Analytics

* Total jobs available
* Saved jobs statistics
* Top hiring companies
* Most in-demand skills
* Job posting trends and graphs

### ⭐ Personalized Recommendations

* Skill-based job recommendations
* Location-based recommendations
* Match score calculation

### 🔔 Job Alerts

* Create custom job alerts
* Keyword and location-based matching
* Automated email notifications
* Multiple alert management

### 🤖 Job Scraping System

JobPulse aggregates jobs from multiple sources, including:

* EthioJobs
* GeezJobs
* Telegram channels
* Remote job boards

The scraper system is designed to be easily extensible for additional sources.

---

## Tech Stack

### Backend

* PHP 8
* Laravel 12
* Laravel Sanctum
* PostgreSQL
* Mailpit
* Docker

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Axios
* Recharts

### Scrapers

* Python
* BeautifulSoup
* Requests
* Async scraping utilities

---

## Architecture

```text
React Frontend
       │
       ▼
Laravel API
       │
       ├── PostgreSQL Database
       ├── Email Notifications
       └── Python Scrapers
```

---

## Project Structure

```text
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

---

## Installation

### Clone the repository

```bash
git clone https://github.com/zelalem3/JobPulse.git
cd JobPulse
```

### Start Docker containers

```bash
docker compose up -d --build
```

### Backend setup

```bash
docker compose exec backend composer install
docker compose exec backend php artisan migrate
docker compose exec backend php artisan key:generate
```

### Frontend setup

```bash
docker compose exec frontend npm install
```

---

## Running the Application

### Frontend

```bash
http://localhost:3000
```

### Backend API

```bash
http://localhost:8000
```

### Mailpit

```bash
http://localhost:8025
```

---

## API Endpoints

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Jobs

```text
GET /api/jobs
GET /api/jobs/{id}
```

### Saved Jobs

```text
GET /api/savedjobs
POST /api/savejob/{id}
```

### Job Alerts

```text
GET /api/alerts
POST /api/alerts
PUT /api/alerts/{id}
DELETE /api/alerts/{id}
```

### Recommendations

```text
GET /api/recommendations
```

### Dashboard

```text
GET /api/dashboard/stats
GET /api/dashboard/topcompanies
GET /api/dashboard/skills
GET /api/dashboard/graph
```

---

## Future Improvements

* In-app notifications
* Resume parsing and matching
* Telegram notifications
* Advanced recommendation engine
* Admin dashboard
* Scraper monitoring dashboard
* Application tracking system
* AI-powered career recommendations

---

## Screenshots

Add screenshots of:

* Login Page
* Dashboard
* Job Listings
* Saved Jobs
* Recommendations
* Alerts

---

## Author

**Zelalem**

Recent graduate from the ALX Software Engineering program with a specialization in web development and programming.

GitHub: https://github.com/zelalem3

---

## License

This project is licensed under the MIT License.
