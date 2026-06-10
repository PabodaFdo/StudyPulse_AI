---

# 🎓 StudyPulse AI

**StudyPulse AI** is an AI-powered student productivity and academic growth platform that helps students manage subjects, organize smart notes, upload learning materials, generate quizzes and flashcards, track focus sessions, monitor academic risk, and grow a virtual **Study Garden** through consistent learning.

The project is designed as a full-stack portfolio project for **Software Engineering, Full Stack Development, AI/ML, and Full Stack + AI internship roles**.

---

## 🌟 Project Vision

Many students struggle with scattered notes, weak revision habits, poor focus consistency, and late awareness of academic risk. StudyPulse AI solves this by combining learning management, productivity tracking, AI-assisted study material generation, and academic performance monitoring into one modern platform.

> **Study smarter, grow better.**

---

## ✨ Key Features

### 📚 Smart Notes

* Create, edit, delete, and organize notes.
* Group notes by subjects/modules.
* Mark notes as revised.
* Track revision progress.

### 📄 PDF Study Assistant

* Upload lecture PDFs or textbook notes.
* Extract text from learning materials.
* Generate summaries, quizzes, flashcards, and study plans.
* Designed to use lightweight free AI/NLP logic first.

### 🧠 AI Quiz & Flashcard Generator

* Generate MCQ-style questions from notes/PDF content.
* Generate flashcards for active recall.
* Track quiz attempts and scores.
* Identify weak topics from incorrect answers.

### ⏱️ FocusFlow Timer

* Pomodoro-style focus timer.
* Track study sessions.
* View daily/weekly focus analytics.
* Subject-wise focus time tracking.

### 🌱 Study Garden

* Gamified learning progress system.
* Students earn growth points by studying.
* Plant grows from seed to blooming flowers.
* Encourages consistent learning habits.

### 🎯 Study Quests

* Daily and weekly learning quests.
* Quest completion rewards growth points.
* Helps students build study routines.

### 📊 Academic Risk Prediction

* Predict academic risk level using attendance, marks, deadlines, quiz results, and study habits.
* Risk levels: **Low**, **Medium**, **High**.
* Provides reasons and improvement recommendations.

### 💡 Subject Health Score

* Calculates subject-wise health score.
* Combines study time, quiz performance, notes revision, attendance, and academic risk.
* Helps students identify subjects needing attention.

### 🔍 Weak Topic Radar

* Detects weak topics based on quiz performance.
* Recommends revision actions.
* Helps students focus on the right areas.

### 🌙 Light/Dark Theme

* Soft pastel light theme.
* Premium dark dashboard theme.
* Responsive UI for desktop and mobile.

---

## 🖼️ Screenshots

> Add your screenshots inside `docs/screenshots/` and update these image paths.

### Landing Page

### Dashboard

### Study Garden

### Smart Notes

### Focus Timer

---

## 🧩 Tech Stack

| Layer                 | Technology                                             |
| --------------------- | ------------------------------------------------------ |
| **Frontend**          | React 19, Vite, Tailwind CSS                           |
| **UI/UX**             | Framer Motion, Lucide React, Recharts, React Hot Toast |
| **Backend**           | Node.js, Express.js                                    |
| **Database**          | PostgreSQL                                             |
| **ORM**               | Prisma                                                 |
| **Authentication**    | JWT, bcrypt                                            |
| **AI/ML Service**     | Python, FastAPI                                        |
| **ML/NLP Libraries**  | scikit-learn, pandas, NumPy, pdfplumber                |
| **API Communication** | Axios                                                  |
| **Deployment Plan**   | Vercel, Render/Railway, Supabase/Neon                  |

---

## 🏗️ System Architecture

```txt
React Frontend
│
├── Landing Page
├── Dashboard
├── Smart Notes
├── Focus Timer
├── Study Garden
├── Risk Prediction
└── PDF Upload
        │
        ▼
Node.js + Express Backend
│
├── JWT Authentication
├── REST APIs
├── Business Logic
├── File Upload Handling
├── Study Garden Points
└── Database Operations
        │
        ▼
PostgreSQL Database
│
├── Users
├── Subjects
├── Notes
├── Documents
├── Quizzes
├── Flashcards
├── Focus Sessions
├── Academic Records
├── Risk Predictions
└── Study Garden Progress
        │
        ▼
Python FastAPI AI/ML Service
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
│   │   ├── api/
│   │   ├── assets/
│   │   │   └── characters/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
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
│   ├── app/
│   │   ├── main.py
│   │   ├── schemas.py
│   │   └── utils.py
│   ├── requirements.txt
│   └── .env.example
│
├── docs/
│   ├── screenshots/
│   ├── ERD.md
│   ├── API_DOCUMENTATION.md
│   └── PROJECT_CASE_STUDY.md
│
├── README.md
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

Install these before running the project:

```txt
Node.js 18+
Python 3.10+
npm
PostgreSQL
Git
```

---

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/StudyPulse-AI.git
cd StudyPulse-AI
```

---

## 2️⃣ Run the Frontend

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

## 3️⃣ Run the Backend

```bash
cd server
npm install
```

Create `.env` file using `.env.example`:

```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/studypulse_ai"
JWT_SECRET="change_this_secret"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
```

Run Prisma migrations and seed data:

```bash
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Backend runs at:

```txt
http://localhost:5000
```

Health check:

```txt
http://localhost:5000/api/health
```

---

## 4️⃣ Run the ML Service

```bash
cd ml-service
python -m venv venv
```

Activate virtual environment:

### Windows

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run FastAPI server:

```bash
uvicorn app.main:app --reload --port 8000
```

ML service runs at:

```txt
http://localhost:8000
```

Health check:

```txt
http://localhost:8000/health
```

---

## 🔐 Demo Login

```txt
Email: demo@studypulse.ai
Password: password123
```

---

## 🗄️ Database Design Summary

Planned main database entities:

```txt
User
Subject
Note
Document
StudyPlan
Flashcard
Quiz
QuizQuestion
QuizAttempt
FocusSession
AcademicRecord
RiskPrediction
StudyGarden
GrowthActivity
StudyQuest
WeakTopic
SubjectHealthSnapshot
MoodCheckIn
BurnoutAlert
```

Relationship examples:

```txt
User → many Subjects
User → many Notes
Subject → many Notes
Subject → many Quizzes
Quiz → many QuizQuestions
User → many FocusSessions
User → one StudyGarden
User → many RiskPredictions
```

---

## 🤖 AI/ML Explanation

StudyPulse AI is designed with a separate Python-based AI/ML service using FastAPI.

### Academic Risk Prediction

The ML model predicts academic risk using features such as:

```txt
attendance percentage
assignment average
quiz average
study hours per week
missed deadlines
focus sessions completed
previous exam mark
```

Target output:

```txt
Low Risk
Medium Risk
High Risk
```

Recommended model for MVP:

```txt
RandomForestClassifier
```

### PDF Study Material Generation

The PDF assistant is planned to use lightweight, free NLP logic:

```txt
PDF text extraction
keyword extraction
sentence ranking
summary generation
rule-based MCQ generation
rule-based flashcard generation
```

This keeps the project free and suitable for an 8GB RAM laptop.

---

## 🌱 Study Garden Gamification

Students earn growth points when they complete learning actions.

| Action                 | Growth Points |
| ---------------------- | ------------- |
| Complete focus session | +10           |
| Mark note as revised   | +5            |
| Complete quiz          | +10           |
| Score above 70%        | +15           |
| Upload PDF             | +5            |
| Complete daily quest   | +20           |
| Improve risk level     | +25           |

Plant growth stages:

| Points  | Stage            |
| ------- | ---------------- |
| 0–20    | Seed             |
| 21–50   | Small Sprout     |
| 51–100  | Growing Plant    |
| 101–160 | Healthy Plant    |
| 161–230 | Flower Buds      |
| 231+    | Blooming Flowers |

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

### Study Garden

```txt
GET  /api/study-garden
GET  /api/study-garden/activities
POST /api/study-garden/add-points
```

### Risk Prediction

```txt
POST /api/risk/predict
GET  /api/risk/history
```

### Documents / PDF

```txt
POST /api/documents/upload
GET  /api/documents
POST /api/documents/:id/generate-study-materials
```

---

## 📊 Current Project Status

| Module               | Status         |
| -------------------- | -------------- |
| Frontend UI          | ✅ Completed    |
| Light/Dark Theme     | ✅ Completed    |
| Dashboard Pages      | ✅ Completed    |
| Study Garden UI      | ✅ Completed    |
| Backend Structure    | 🟡 In Progress |
| Database Integration | 🟡 Planned     |
| Authentication       | 🟡 Planned     |
| Academic Risk ML     | 🟡 Planned     |
| PDF AI Assistant     | 🟡 Planned     |
| Deployment           | 🟡 Planned     |

---

## 🛣️ Roadmap

### Version 1 — Full-Stack MVP

* [x] Frontend UI
* [x] Dashboard pages
* [x] Study Garden design
* [ ] Backend setup
* [ ] PostgreSQL + Prisma
* [ ] JWT authentication
* [ ] Subjects CRUD
* [ ] Notes CRUD
* [ ] Focus session tracking
* [ ] Study Garden growth points

### Version 2 — AI/ML Features

* [ ] Academic risk prediction
* [ ] Risk history
* [ ] PDF text extraction
* [ ] Summary generation
* [ ] Quiz generation
* [ ] Flashcard generation

### Version 3 — Advanced Features

* [ ] Weak topic radar
* [ ] Subject health score
* [ ] Mood check-in analytics
* [ ] Burnout warning
* [ ] Report export
* [ ] Admin dashboard
* [ ] Full deployment

---

## 🧪 Testing Plan

Planned testing areas:

```txt
Authentication APIs
Protected routes
Subject CRUD
Notes CRUD
Focus session saving
Study Garden point updates
ML prediction endpoint
PDF upload and validation
Frontend responsive design
Dark/light theme readability
```

Tools:

```txt
Postman
Jest
Pytest
Browser testing
Manual UI testing
```

---

## 👩‍💻 Author

**Paboda Fernando**
BSc (Hons) Information Technology Undergraduate
Sri Lanka Institute of Information Technology

---

## 📄 License

This project is licensed under the **MIT License**.

---

### 🌱 Study smarter. Grow better. Bloom with StudyPulse AI.
