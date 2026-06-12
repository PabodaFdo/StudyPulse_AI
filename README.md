# 🎓 StudyPulse AI

StudyPulse AI is a full-stack AI-powered student productivity and academic growth platform designed to help students organize learning materials, manage subjects, create smart notes, track focus sessions, monitor academic progress, and grow a virtual Study Garden through consistent study habits.

The project is built as a portfolio project for Software Engineering, Full Stack Development, AI/ML, and Full Stack + AI internship opportunities.

---

## 🌟 Project Vision

Many students struggle with scattered notes, weak revision habits, poor focus consistency, and late awareness of academic risk. StudyPulse AI solves this by combining study management, productivity tracking, gamification, academic analytics, and planned AI-assisted learning features into one modern platform.

> Study smarter. Grow better. Bloom with StudyPulse AI.

---

## ✨ Features

### 📚 Smart Notes

* Create, edit, delete, and organize notes.
* Group notes by subjects.
* Mark notes as revised.
* Reward students with Study Garden growth points after revision.

### 📘 Subject Management

* Add and manage academic subjects.
* Store subject code, credits, target grade, current standing, and status.
* Connect notes, focus sessions, and academic records to subjects.

### ⏱️ FocusFlow Timer

* Track study sessions.
* Store focus duration by subject.
* View focus session history and analytics.
* Reward completed focus sessions with growth points.

### 🌱 Study Garden

* Gamified learning progress system.
* Students earn growth points through study actions.
* Plant growth changes according to total points.
* Growth activity history is stored in the database.

### 📊 Academic Records

* Store academic performance records.
* Track grades, attendance, assignments, quizzes, study hours, deadlines, and exam marks.
* Designed to support future academic risk prediction.

### 📈 Dashboard

* View summary counts for subjects, notes, focus sessions, academic records, and growth progress.
* Provides backend-ready data for charts and analytics.

### 🔐 Authentication

* User registration and login.
* JWT-based protected routes.
* Password hashing with bcrypt.
* Authenticated users can only access their own data.

### 🤖 Planned AI/ML Features

* Academic risk prediction.
* PDF text extraction.
* Summary generation.
* Quiz generation.
* Flashcard generation.
* Weak topic detection.
* Subject health score.

---

## 🧩 Tech Stack

| Layer                    | Technology                                             |
| ------------------------ | ------------------------------------------------------ |
| Frontend                 | React, Vite, Tailwind CSS                              |
| UI/UX                    | Framer Motion, Lucide React, Recharts, React Hot Toast |
| Backend                  | Node.js, Express.js                                    |
| Database                 | PostgreSQL                                             |
| ORM                      | Prisma                                                 |
| Authentication           | JWT, bcryptjs                                          |
| API Testing              | Postman                                                |
| Planned AI/ML Service    | Python, FastAPI                                        |
| Planned ML/NLP Libraries | scikit-learn, pandas, NumPy, pdfplumber                |
| Deployment Plan          | Vercel, Render/Railway, Supabase/Neon                  |

---

## 🏗️ System Architecture

```txt
React Frontend
│
├── Landing Page
├── Dashboard
├── Subjects
├── Smart Notes
├── Focus Timer
├── Study Garden
├── Academic Records
└── Planned AI Pages
        │
        ▼
Node.js + Express Backend
│
├── JWT Authentication
├── Protected REST APIs
├── Business Logic
├── Study Garden Points
└── Prisma Database Access
        │
        ▼
PostgreSQL Database
│
├── Users
├── Subjects
├── Notes
├── Focus Sessions
├── Academic Records
├── Study Gardens
├── Growth Activities
└── Study Quests
        │
        ▼
Planned Python FastAPI AI/ML Service
│
├── PDF Text Extraction
├── Summary Generation
├── Quiz Generation
├── Flashcard Generation
├── Weak Topic Detection
└── Academic Risk Prediction
```

---

## 📁 Folder Structure

```txt
studypulse-ai/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.js
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
│
├── ml-service/
│   └── planned AI/ML service
│
├── docs/
│   └── screenshots/
│
├── README.md
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

Install the following:

```txt
Node.js 18+
npm
PostgreSQL
Git
Postman
```

Python 3.10+ is required later for the planned AI/ML service.

---

## 1. Clone the Repository

```bash
git clone https://github.com/PabodaFdo/StudyPluse_AI.git
cd StudyPluse_AI
```

---

## 2. Run the Backend

Go to the backend folder:

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/studypulse_ai?schema=public"
JWT_SECRET="change_this_secret"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
```

Run Prisma commands:

```bash
npx prisma migrate dev
npx prisma db seed
npx prisma generate
```

Start the backend:

```bash
npm run dev
```

Backend runs at:

```txt
http://localhost:5000
```

Health check:

```txt
GET http://localhost:5000/api/health
```

---

## 3. Run the Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Frontend runs at:

```txt
http://localhost:5173
```

---

## 🔐 Demo Login

```txt
Email: demo@studypulse.ai
Password: password123
```

---

## 📡 API Overview

### Auth

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Subjects

```txt
GET    /api/subjects
POST   /api/subjects
GET    /api/subjects/:id
PUT    /api/subjects/:id
DELETE /api/subjects/:id
```

### Notes

```txt
GET    /api/notes
POST   /api/notes
GET    /api/notes/:id
PUT    /api/notes/:id
DELETE /api/notes/:id
PATCH  /api/notes/:id/revised
```

### Focus Sessions

```txt
GET  /api/focus-sessions
POST /api/focus-sessions
GET  /api/focus-sessions/analytics
```

### Academic Records

```txt
GET    /api/academic-records
POST   /api/academic-records
PUT    /api/academic-records/:id
DELETE /api/academic-records/:id
```

### Study Garden

```txt
GET  /api/study-garden
GET  /api/study-garden/activities
POST /api/study-garden/add-points
```

### Dashboard

```txt
GET /api/dashboard/summary
GET /api/dashboard/charts
```

---

## 🌱 Study Garden Points System

| Action                 | Growth Points |
| ---------------------- | ------------: |
| Create note            |            +3 |
| Mark note as revised   |            +5 |
| Complete focus session |           +10 |
| Add academic record    |            +3 |
| Manual bonus task      | Custom points |

### Plant Growth Stages

|  Points | Stage            |
| ------: | ---------------- |
|    0–20 | Seed             |
|   21–50 | Small Sprout     |
|  51–100 | Growing Plant    |
| 101–160 | Healthy Plant    |
| 161–230 | Flower Buds      |
|    231+ | Blooming Flowers |

---

## 🗄️ Database Models

Current main models:

```txt
User
Subject
Note
FocusSession
AcademicRecord
StudyGarden
GrowthActivity
StudyQuest
```

Planned AI/ML-related models:

```txt
Document
Quiz
QuizQuestion
QuizAttempt
Flashcard
RiskPrediction
WeakTopic
SubjectHealthSnapshot
MoodCheckIn
BurnoutAlert
```

---

## 📊 Current Project Status

| Module                              | Status         |
| ----------------------------------- | -------------- |
| Frontend UI                         | ✅ Completed    |
| Light/Dark Theme                    | ✅ Completed    |
| Dashboard Pages UI                  | ✅ Completed    |
| Study Garden UI                     | ✅ Completed    |
| Backend Structure                   | ✅ Completed    |
| PostgreSQL + Prisma                 | ✅ Completed    |
| JWT Authentication                  | ✅ Completed    |
| Subjects API                        | ✅ Completed    |
| Notes API                           | ✅ Completed    |
| Focus Sessions API                  | ✅ Completed    |
| Academic Records API                | ✅ Completed    |
| Study Garden API                    | ✅ Completed    |
| Dashboard API                       | ✅ Completed    |
| Postman API Testing                 | ✅ Completed    |
| Frontend Authentication Integration | 🟡 In Progress |
| Frontend Page API Integration       | 🟡 Planned     |
| Academic Risk ML                    | 🟡 Planned     |
| PDF Study Assistant                 | 🟡 Planned     |
| Deployment                          | 🟡 Planned     |

---

## 🛣️ Roadmap

### Version 1 — Full-Stack MVP

* [x] Frontend UI
* [x] Dashboard pages
* [x] Study Garden design
* [x] Backend setup
* [x] PostgreSQL + Prisma
* [x] JWT authentication
* [x] Subjects CRUD
* [x] Notes CRUD
* [x] Focus session tracking
* [x] Academic records tracking
* [x] Study Garden growth points
* [x] Dashboard backend APIs
* [ ] Connect frontend authentication
* [ ] Connect frontend pages to backend APIs
* [ ] Final browser testing
* [ ] Add screenshots to README

### Version 2 — AI/ML Features

* [ ] Academic risk prediction
* [ ] Risk history
* [ ] PDF text extraction
* [ ] Summary generation
* [ ] Quiz generation
* [ ] Flashcard generation
* [ ] Weak topic detection

### Version 3 — Advanced Features

* [ ] Subject health score
* [ ] Mood check-in analytics
* [ ] Burnout warning
* [ ] Report export
* [ ] Admin dashboard
* [ ] Full deployment

---

## 🧪 Testing

Backend APIs were tested using Postman.

Tested areas:

```txt
Authentication
Protected routes
Subject CRUD
Notes CRUD
Focus session creation
Academic record creation
Study Garden point updates
Dashboard summary
Dashboard chart data
```

Planned testing:

```txt
Frontend integration testing
Responsive UI testing
Error handling testing
Jest tests
Pytest tests for AI/ML service
```

---

## 🖼️ Screenshots

Add screenshots inside:

```txt
docs/screenshots/
```

Suggested screenshots:

```txt
Landing Page
Login Page
Dashboard
Subjects Page
Smart Notes
Focus Timer
Study Garden
Academic Records
```

---

## 💼 Internship Value

This project demonstrates:

```txt
Full-stack application development
REST API development
JWT authentication
Database design with Prisma
PostgreSQL integration
Protected route handling
Frontend dashboard design
Gamification logic
Postman API testing
AI/ML-ready architecture
Real-world problem solving
```

---

## 📌 CV Bullet

Built StudyPulse AI, a full-stack student productivity and academic growth platform with JWT authentication, subject and note management, focus session tracking, academic records, dashboard analytics, and a gamified Study Garden system using React, Express.js, PostgreSQL, Prisma, and Node.js, with planned AI/ML features for academic risk prediction and PDF-based study assistance.

---

## 👩‍💻 Author

**Paboda Fernando**
BSc (Hons) Information Technology Undergraduate
Sri Lanka Institute of Information Technology

---

## 📄 License

This project is licensed under the MIT License.

---

### 🌱 Study smarter. Grow better. Bloom with StudyPulse AI.
