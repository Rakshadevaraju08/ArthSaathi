# ArthSaathi — 4 Day Hackathon Roadmap

AI Powered Rural Financial Intelligence Platform

> Current implementation update: the Expo mobile app is now a local-first prototype using Zustand. Backend, AI service, and database integration are future phases; the current demo does not require remote services.

---

# Important Note

This roadmap must always stay aligned with:

```txt
docs/
│
├── architecture.md
├── roadmap.md
├── api-specs.md
├── frontend-structure.md
├── backend-structure.md
├── ai-service-structure.md
├── database-schema.md
├── setup-guide.md
└── demo-script.md
```

Whenever:
- API contracts change
- folder structures change
- architecture changes
- database schema changes
- frontend routes change

the corresponding `.md` file inside `docs/` must also be updated immediately.

---

# Main Goal

Build a working MVP capable of:

- Voice AI interaction
- Expense tracking
- Financial planning
- Loan risk analysis
- Scam detection
- RTC OCR extraction
- Dashboard analytics
- Multilingual support

within 4 days.

---

# Final Architecture

```txt
React Native Expo App
          ↓
Node.js Backend
          ↓
FastAPI AI Service
          ↓
OpenAI / Whisper / OCR
          ↓
PostgreSQL Database
```

---

# Team Distribution

| Member | Responsibility |
|---|---|
| Member 1 | Backend APIs + Authentication |
| Member 2 | Database + Backend Integration |
| Member 3 | AI Service + OCR + Voice |
| Member 4 | Frontend + Dashboard + Voice UI |

---

# Development Rules

# Rule 1

Nobody waits for anyone.

Use:
- mock JSON
- mock APIs
- dummy responses

until actual APIs are integrated.

---

# Rule 2

API contracts are fixed on Day 1.

Never randomly change:
- request structure
- response structure
- endpoint names

without informing everyone.

---

# Rule 3

Every completed feature must update docs.

Example:

If:
```txt
/api/analyze
```

changes,

then:
```txt
docs/api-specs.md
```

must also be updated.

---

# Rule 4

Folder structure changes must update docs.

If:
- new module added
- new route added
- new folder created

update:
- backend-structure.md
- ai-service-structure.md
- frontend-structure.md

---

# Rule 5

Database changes must update schema docs.

If:
- new Prisma model added
- relation changed

update:
```txt
docs/database-schema.md
```

---

# Rule 6

Demo flow changes must update:

```txt
docs/demo-script.md
```

---

# Final Folder Structure

```txt
arthsaathi/
│
├── mobile-app/
├── backend/
├── ai_service/
├── docs/
│
├── package.json
├── README.md
└── .env
```

---

# DAY 1 — FOUNDATION

# Main Goal

By end of Day 1:
- all services should run independently
- folder structures completed
- mock APIs working
- frontend navigation working
- database connected

Nobody should depend on another member.

---

# Member 1 — Backend APIs

# Tasks

## Setup Backend

Initialize:
- Express
- TypeScript
- folder structure

---

## Create Backend Modules

Create:

```txt
auth/
users/
transactions/
dashboard/
rtc/
ai/
```

---

## Setup Middleware

Implement:
- JWT middleware
- error handling
- request logging

---

## Create Mock APIs

### APIs

```txt
GET /api/dashboard
POST /api/login
POST /api/analyze
```

---

## Update Docs

Update:
```txt
docs/backend-structure.md
docs/api-specs.md
```

---

# Deliverables

✅ Backend server running  
✅ Modular structure completed  
✅ Mock APIs responding  
✅ Middleware setup completed  

---

# Member 2 — Database + Backend Integration

# Tasks

## Setup PostgreSQL

Configure:
- local DB
- environment variables

---

## Setup Prisma ORM

Initialize:
- Prisma
- migrations

---

## Create Prisma Models

Create:
- User
- Transaction
- AIReport
- RTCRecord

---

## Setup Database Services

Create:
- user service
- transaction service
- dashboard queries

---

## Connect DB To Backend

Backend should:
- create users
- fetch transactions
- generate summaries

---

## Update Docs

Update:
```txt
docs/database-schema.md
docs/backend-structure.md
```

---

# Deliverables

✅ PostgreSQL connected  
✅ Prisma migrations working  
✅ Base models created  
✅ Backend connected to DB  

---

# Member 3 — AI Service + OCR + Voice

# Tasks

## Setup FastAPI

Initialize:
- FastAPI server
- AI folder structure

---

## Setup OCR

Implement:
- EasyOCR
- RTC extraction

---

## Setup Whisper

Implement:
- speech-to-text

---

## Setup OpenAI Integration

Create:
- financial analysis prompts
- loan risk prompts
- scam detection prompts

---

## Create AI APIs

### APIs

```txt
POST /analyze
POST /ocr/rtc
POST /loan-risk
POST /scam-check
```

---

## Update Docs

Update:
```txt
docs/ai-service-structure.md
docs/api-specs.md
```

---

# Deliverables

✅ FastAPI running  
✅ OCR extraction working  
✅ Whisper working  
✅ AI APIs responding  

---

# Member 4 — Frontend + Dashboard

# Tasks

## Setup Expo App

Initialize:
- Expo
- Expo Router

---

## Setup Navigation

Create:
- auth routes
- tab routes
- feature routes

---

## Build Screens

Create:
- Home
- Dashboard
- Voice Assistant
- Expense Tracker
- RTC Upload
- Scam Checker
- Financial Plan

---

## Setup State Management

Implement:
- Zustand
- API layer

---

## Build Mock UI

Use:
- mock responses
- static data

until APIs are integrated.

---

## Update Docs

Update:
```txt
docs/frontend-structure.md
```

---

# Deliverables

✅ Expo app running  
✅ Navigation working  
✅ Screens rendering  
✅ Dashboard UI completed  

---

# DAY 1 FINAL CHECKLIST

## Backend

- Express running on port 3000
- APIs responding

---

## Database

- PostgreSQL connected
- Prisma migrations successful

---

## AI Service

- FastAPI running on port 8000
- OCR working
- Whisper working

---

## Frontend

- Expo app running
- Navigation working
- Screens rendering

---

## Documentation

All structure changes reflected inside:
```txt
docs/
```

---

# DAY 2 — CORE FEATURES

# Main Goal

By end of Day 2:
- all major features should function independently
- financial analysis should work
- OCR extraction should work
- dashboard should update dynamically

---

# Member 1 — Backend APIs

# Tasks

Implement:
- login APIs
- dashboard APIs
- transaction APIs
- AI orchestration APIs
- file upload APIs

---

## Update Docs

Update:
```txt
docs/api-specs.md
```

---

# Deliverables

✅ Auth working  
✅ Dashboard APIs working  
✅ Transaction APIs working  

---

# Member 2 — Database

# Tasks

Implement:
- analytics queries
- transaction aggregation
- dashboard summaries
- financial calculations

---

## Update Docs

Update:
```txt
docs/database-schema.md
```

---

# Deliverables

✅ Dashboard summaries generated  
✅ Financial calculations working  
✅ DB queries optimized  

---

# Member 3 — AI Service

# Tasks

Implement:
- financial planning engine
- loan risk analysis
- scam detection logic
- OCR parser improvements

---

## Update Docs

Update:
```txt
docs/ai-service-structure.md
```

---

# Deliverables

✅ Financial plans generated  
✅ Risk analysis working  
✅ Scam detection working  

---

# Member 4 — Frontend

# Tasks

Implement:
- dashboard charts
- expense list
- voice assistant flow
- RTC upload UI
- API integration

---

## Update Docs

Update:
```txt
docs/frontend-structure.md
```

---

# Deliverables

✅ Dashboard updates live  
✅ Voice workflow working  
✅ API integration completed  

---

# DAY 3 — INTEGRATION + ADVANCED FEATURES

# Main Goal

Integrate all modules and improve UX.

---

# Member 1

# Tasks

- API optimization
- file handling
- error handling
- auth improvements

---

# Member 2

# Tasks

- analytics optimization
- realistic seed data
- performance improvements

---

# Member 3

# Tasks

- multilingual prompts
- Kannada/Hindi support
- OCR improvements
- AI response optimization

---

# Member 4

# Tasks

- animations
- loading states
- charts
- responsive UI
- final UX polish

---

# Integration Flow

```txt
Frontend
    ↓
Backend
    ↓
AI Service
    ↓
Database
    ↓
Dashboard Update
```

---

# Update Docs

All members must ensure:
- structure docs updated
- API docs updated
- demo flow updated

---

# DAY 4 — TESTING + DEMO PREPARATION

# Main Goal

Prepare final polished demo.

---

# All Members

# Tasks

- full integration testing
- fix bugs
- improve UX
- optimize prompts
- improve loading states
- prepare demo flow
- prepare presentation

---

# Demo Flow

```txt
User speaks in Kannada
        ↓
Speech converted to text
        ↓
Expense extracted
        ↓
Financial analysis generated
        ↓
Loan risk evaluated
        ↓
Dashboard updated
        ↓
AI response returned
```

---

# Presentation Preparation

Prepare:
- architecture explanation
- problem statement
- technical stack
- demo flow
- future scope

---

# Final MVP Features

✅ Voice AI Assistant  
✅ Expense Tracking  
✅ Financial Planning  
✅ Loan Risk Analysis  
✅ Scam Detection  
✅ RTC OCR Extraction  
✅ Dashboard Analytics  
✅ Multilingual Support  

---

# Final Goal

Deliver a clean AI-powered financial assistant focused on:
- accessibility
- multilingual support
- rural usability
- voice-first interaction
- financial awareness
- intelligent guidance
