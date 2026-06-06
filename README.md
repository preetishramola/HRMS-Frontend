# HRMS Frontend — Human Resource Management System

The frontend for an AI-powered HRMS built with **Next.js 15**, **TypeScript**, and the App Router. Four role-based portals — Admin, HR, Manager, and Employee — each with a dedicated dashboard and feature set.

> **Backend repo:** [HRMS](https://github.com/preetishverb/HRMS)

---

## Features by Role

### Admin
- Company dashboard with headcount stats, weekly attendance chart, hiring trend
- Employee management — create, view, update, deactivate
- Department management with live headcount
- Monthly payroll generation with per-employee breakdown
- Analytics — headcount by department, salary distribution, workforce by designation

### HR
- HR dashboard with pending leaves, open positions, headcount by department
- Full recruitment hub — job openings, candidate pipeline with tabs (Shortlisted, Waiting, Interview, Offers, Hired/Rejected)
- AI resume screening results — skill match score, gaps, recommendation
- Schedule interviews, send offer letters, hire candidates
- Leave approval workflow

### Manager
- Team performance overview
- Performance review tool — select direct report, star rating (1–5), goals, achievements, comments, submit

### Employee (Self-Service)
- Personal dashboard
- Attendance calendar with month navigation and colour-coded days
- Leave management — balance cards, apply form, application history
- Payslip viewer — earnings, deductions, net pay
- Performance reviews — ratings, goals, manager comments

### All Roles
- Peer-to-peer feedback (inbox, sent, give feedback with categories)
- Anonymous complaint portal
- AI HR chatbot (context-aware, knows your leave balance, attendance, payslips)

---

## Tech Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| HTTP Client | Axios with JWT interceptor |
| Charts | Recharts |
| Icons | Lucide React |
| Styling | Inline styles + CSS variables |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Backend running at `http://localhost:8080`

### 1. Clone the repo
```bash
git clone https://github.com/preetishverb/HRMS-Frontend.git
cd HRMS-Frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env.local
```

Set `NEXT_PUBLIC_API_URL=http://localhost:8080` (already the default)

### 4. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@hrms.com | admin@123 |
| Manager | manager@hrms.com | manager@123 |
| HR | hr@hrms.com | hr@123 |
| Employee | employee@hrms.com | employee@123 |

---

## Project Structure

```
app/
├── login/                    # Login page with role quick access
├── careers/                  # Public job listings (no auth)
├── offer/                    # Candidate offer accept/decline
└── dashboard/
    ├── admin/
    │   ├── page.tsx          # Admin dashboard
    │   ├── employees/        # Employee management
    │   ├── departments/      # Department management
    │   ├── payroll/          # Payroll generation
    │   └── analytics/        # Workforce analytics
    ├── hr/
    │   ├── page.tsx          # HR dashboard
    │   ├── recruitment/      # Recruitment pipeline
    │   └── leaves/           # Leave approvals
    ├── manager/
    │   ├── page.tsx          # Manager dashboard
    │   └── performance/      # Team performance reviews
    ├── employee/
    │   ├── page.tsx          # Employee dashboard
    │   ├── attendance/       # Attendance calendar
    │   ├── leave/            # Leave management
    │   ├── payslips/         # Payslip viewer
    │   └── performance/      # Performance reviews
    ├── feedback/             # Peer-to-peer feedback (all roles)
    └── complaints/           # Anonymous complaints (all roles)

components/
├── Sidebar.tsx               # Role-aware navigation sidebar
├── UI.tsx                    # TopBar, StatCard, Spinner

lib/
├── api.ts                    # Axios API client + all endpoint methods
└── auth.ts                   # Auth helpers (save/get/logout user)
```
