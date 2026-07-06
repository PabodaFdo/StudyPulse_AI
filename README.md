# StudyPulse AI 🌱✨

![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Build-Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/API-Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![FastAPI](https://img.shields.io/badge/ML_Service-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/AI%2FML-Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

**StudyPulse AI** is a full-stack AI-powered student productivity and academic analytics platform. It helps students manage subjects, track study behavior, create smart notes, upload study materials, generate AI summaries, quizzes, and flashcards, monitor academic risk, and improve learning consistency through personalized analytics.

> Study smarter. Track better. Improve with StudyPulse AI.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Project Vision](#project-vision)
- [Key Features](#key-features)
- [AI and ML Features](#ai-and-ml-features)
- [Study Engagement Score](#study-engagement-score)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Demo Login](#demo-login)
- [API Overview](#api-overview)
- [Database Highlights](#database-highlights)
- [Screenshots](#screenshots)
- [Testing Checklist](#testing-checklist)
- [Example User Flow](#example-user-flow)
- [What I Learned](#what-i-learned)
- [Internship Value](#internship-value)
- [Future Improvements](#future-improvements)
- [Author](#author)
- [License](#license)

---

## Project Overview

Many students struggle with scattered study materials, inconsistent revision habits, low focus, weak topic awareness, and late identification of academic risk.

StudyPulse AI solves this by combining:

- Study management
- AI-powered learning support
- Academic analytics
- Risk prediction
- Subject health tracking
- Focus tracking
- Gamified learning
- Personalized dashboards

The system is designed as a **Full-Stack + AI/ML portfolio project** to demonstrate practical skills in frontend development, backend API development, database design, authentication, AI service integration, PDF processing, and academic analytics.

---

## Project Vision

The main goal of StudyPulse AI is to help students understand their learning behavior and improve academic performance before problems become serious.

Instead of only showing marks, StudyPulse AI analyzes real study activity such as:

- Quiz performance
- Focus sessions
- Notes activity
- Flashcard reviews
- Summary reviews
- Assessment marks
- Recent study consistency

Using these signals, the system provides academic risk warnings, subject health scores, weak topic insights, and AI-generated learning materials.

---

## Key Features

### Authentication and Security

- User registration and login
- JWT-based authentication
- Protected frontend routes
- Password hashing with bcrypt
- Session persistence
- Logout functionality
- User-specific data access

---

### Dashboard Analytics

The dashboard gives students a quick overview of their study progress.

Includes:

- Academic risk summary
- Study statistics
- Subject progress
- Quiz performance
- Flashcard activity
- Summary activity
- Focus overview
- Recent activity
- Study Garden progress
- Suggested study quests
- Academic records summary
- Subject health overview

---

### Subject Management

Students can manage their academic subjects and connect learning activities to each subject.

Features:

- Add subjects
- Update subject details
- Delete subjects
- Track subject-specific study data
- Connect notes, quizzes, focus sessions, summaries, flashcards, and assessments to subjects

---

### Smart Notes

Students can create and manage study notes.

Features:

- Create notes
- Edit notes
- Delete notes
- Organize notes by subject
- Mark notes as revised
- Use notes as input for AI summaries, quizzes, and flashcards

---

### FocusFlow Timer

The FocusFlow feature helps students track focused study sessions.

Features:

- Start focus sessions
- Save focus time
- Connect focus sessions to subjects
- Track total focused study time
- Use focus activity inside Study Engagement Score

---

### Academic Records and Assessments

Students can store academic performance data.

Features:

- Add quiz marks
- Add assignment marks
- Add exam marks
- Track average marks
- Connect assessments to subjects
- Use weighted assessment marks for Subject Health

---

### Study Garden and Quests

StudyPulse AI includes gamification to encourage consistent learning.

Features:

- Study Garden progress
- Growth points
- Study quests
- Quest completion
- Reward claiming
- Visual motivation for study consistency

---

### My AI Library

Generated learning content can be saved and reused later.

Students can save:

- AI summaries
- AI quizzes
- AI flashcards
- PDF-based learning materials

My AI Library allows students to review generated content without regenerating it again.

---

### Dark and Light Theme

The application supports both dark and light themes with a modern responsive UI.

---

## AI and ML Features

StudyPulse AI uses a separate **FastAPI AI/ML service** that works with the Node.js backend.

The React frontend does not directly call the ML service. Instead, requests go through the Node.js backend for better security and cleaner architecture.

| Feature | Method | Status |
|---|---|---|
| Academic Risk Prediction | FastAPI ML service / risk scoring logic | Completed |
| Risk History | PostgreSQL + Prisma | Completed |
| Risk Timeline | Recharts + real prediction history | Completed |
| Subject Health Score | Rule-based academic analytics | Completed |
| Study Engagement Score | Multi-activity scoring | Completed |
| Weak Topic Detection | ML-service / rule-based logic | Completed |
| PDF Text Extraction | pdfplumber | Completed |
| AI Summary Generation | Groq API + fallback logic | Completed |
| AI Quiz Generation | Groq API + fallback logic | Completed |
| AI Flashcard Generation | Groq API + fallback logic | Completed |
| Flashcard Review Tracking | PostgreSQL + Prisma | Completed |
| Summary Review Tracking | PostgreSQL + Prisma | Completed |
| My AI Library | Saved AI content in PostgreSQL | Completed |

---

## Main AI Features

### AI Summary Generation

Students can generate structured summaries from saved PDF materials or Smart Notes.

The generated summary can include:

- Main summary
- Important points
- Key terms
- Section-based explanation
- Word count
- Review tracking

Students can mark summaries as reviewed. Summary review activity is used in Dashboard analytics and Study Engagement Score.

---

### AI Quiz Generation

Students can generate quizzes from PDF materials or Smart Notes.

Features:

- Multiple-choice questions
- Difficulty selection
- Correct and wrong answer feedback
- Answer explanations
- Score calculation
- Quiz result tracking
- Save quizzes to My AI Library

Quiz performance is used inside Study Engagement Score and academic analytics.

---

### AI Flashcard Generation

Students can generate active recall flashcards from study materials.

Features:

- Front and back flashcards
- Difficulty labels
- Card navigation
- Known / Need Review status
- Review completion screen
- Accuracy calculation
- Save flashcard deck to My AI Library
- Track flashcard review attempts

Flashcard review attempts are used in Dashboard analytics and Study Engagement Score.

---

### PDF Text Extraction

Students can upload PDF study materials.

The FastAPI service extracts text using `pdfplumber`, and the extracted content can be used for:

- AI summary generation
- AI quiz generation
- AI flashcard generation
- Study material preview
- My AI Library

---

### Academic Risk Prediction

The Risk Prediction feature estimates academic risk using student learning data.

Inputs include:

- Study Engagement percentage
- Assignment average
- Quiz average
- Study hours per week
- Focus sessions completed
- Previous exam mark

The output includes:

- Risk level
- Risk Probability
- Risk trend
- Key academic indicators
- AI correction strategy

Risk Probability means:

> Higher Risk Probability (%) indicates greater academic risk.

---

### Risk Timeline

The Risk Timeline visualizes historical risk predictions over time.

Features:

- Subject selection
- Latest risk level
- Latest Risk Probability
- Latest trend
- Total predictions
- Historical risk chart
- Timeline events
- Improving / declining / stable trend explanation

---

### Subject Health Score

Subject Health analyzes the current academic condition of a selected subject.

It considers:

- Weighted assessment marks
- Study Engagement Score
- Quiz performance
- Focus activity
- Notes activity
- Flashcard activity
- Summary activity
- Recent learning activity

---

## Study Engagement Score

Study Engagement Score is a 100-point score calculated from real activity inside StudyPulse AI.

Current scoring breakdown:

| Activity | Points |
|---|---:|
| Quiz Activity | 20 |
| Focus Activity | 15 |
| Notes Activity | 15 |
| Flashcard Activity | 15 |
| Summary Activity | 10 |
| Assessment Activity | 15 |
| Recent Activity | 10 |
| **Total** | **100** |

This makes the platform more realistic because engagement is not based on one manual value. It is calculated from the student’s actual learning behavior.

Example:

```text
Quiz Activity:        20 / 20
Focus Activity:        4 / 15
Notes Activity:       15 / 15
Flashcard Activity:   14 / 15
Summary Activity:      6 / 10
Assessment Activity:  15 / 15
Recent Activity:      10 / 10
Total Score:          84 / 100
```

---

## System Architecture

StudyPulse AI follows a multi-service architecture.

```text
React Frontend
      ↓
Node.js Express Backend
      ↓
PostgreSQL Database
      ↓
Prisma ORM
```

For AI and ML features:

```text
React Frontend
      ↓
Node.js Express Backend
      ↓
FastAPI AI/ML Service
      ↓
Groq API / ML Logic / PDF Processing
```

The frontend does not directly call the FastAPI service. The backend handles validation, authentication, API forwarding, and database operations.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Routing | React Router |
| UI Libraries | Framer Motion, Lucide React, Recharts, React Hot Toast |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT, bcrypt |
| API Communication | Axios |
| AI/ML Service | Python, FastAPI |
| AI/ML Libraries | scikit-learn, pandas, NumPy, joblib |
| PDF Processing | pdfplumber |
| AI Integration | Groq API |
| Testing Tools | Postman, FastAPI Swagger |
| Development Tools | VS Code, Git, GitHub |

---

## Folder Structure

```text
StudyPluse_AI/
├── client/                 # React + Vite frontend
├── server/                 # Node.js + Express backend
├── ml-service/             # FastAPI AI/ML service
├── notebooks/              # ML experiments and notebooks
├── README.md
├── LICENSE
└── .gitignore
```

### Frontend Structure

```text
client/
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── context/
│   ├── routes/
│   └── utils/
└── package.json
```

Important frontend pages:

```text
Dashboard.jsx
RiskPrediction.jsx
RiskTimeline.jsx
SubjectHealth.jsx
WeakTopicRadar.jsx
GenerateSummary.jsx
QuizGenerator.jsx
Flashcards.jsx
AILibrary.jsx
FocusTimer.jsx
FocusAnalytics.jsx
AcademicRecords.jsx
Assessments.jsx
```

### Backend Structure

```text
server/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   ├── middleware/
│   ├── utils/
│   ├── app.js
│   └── server.js
└── package.json
```

### ML Service Structure

```text
ml-service/
├── app/
│   ├── main.py
│   ├── schemas.py
│   └── services/
├── requirements.txt
└── .env
```

---

## Getting Started

### Prerequisites

Install these before running the project:

- Node.js 18+
- npm
- PostgreSQL
- Python 3.10+
- Git
- Postman

---

## 1. Clone the Repository

```bash
git clone https://github.com/PabodaFdo/StudyPluse_AI.git
cd StudyPluse_AI
```

---

## 2. Backend Setup

```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

If PowerShell blocks `npx`, use:

```bash
npx.cmd prisma generate
npx.cmd prisma migrate dev
npx.cmd prisma db seed
```

---

## 3. Frontend Setup

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

## 4. FastAPI ML Service Setup

Open a new terminal:

```bash
cd ml-service
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

FastAPI runs on:

```text
http://localhost:8000
```

Swagger documentation:

```text
http://localhost:8000/docs
```

---

## Environment Variables

Create `.env` files inside the `server` and `ml-service` folders.

### server/.env

```env
PORT=5000
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/studypulse_ai?schema=public"
JWT_SECRET="change_this_secret"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
ML_SERVICE_URL="http://localhost:8000"
```

### ml-service/.env

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

### Security Note

Never commit `.env` files to GitHub.

API keys must stay inside backend or ML service environment files. They should not be exposed in the React frontend.

---

## Demo Login

After running the seed command, you can use:

```text
Email: demo@studypulse.ai
Password: password123
```

---

## API Overview

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Dashboard

```text
GET /api/dashboard/summary
```

### Subjects

```text
GET    /api/subjects
POST   /api/subjects
GET    /api/subjects/:id
PUT    /api/subjects/:id
DELETE /api/subjects/:id
```

### Notes

```text
GET    /api/notes
POST   /api/notes
GET    /api/notes/:id
PUT    /api/notes/:id
DELETE /api/notes/:id
```

### Focus Sessions

```text
GET  /api/focus
POST /api/focus
```

### Academic Records / Assessments

```text
GET  /api/records
POST /api/records
```

### Risk Prediction

```text
POST /api/risk/predict
POST /api/risk/history
GET  /api/risk/history/:subjectId
GET  /api/risk/history/:subjectId/latest
DELETE /api/risk/history/:id
```

### Subject Health

```text
POST /api/subject-health/calculate
```

### Weak Topic Detection

```text
POST /api/weak-topics/predict
```

### AI Summary

```text
POST /api/summary/generate
POST /api/summaries/review-attempts
GET  /api/summaries/review-attempts
GET  /api/summaries/review-attempts/summary
```

### AI Quiz

```text
POST /api/quiz/generate
```

### AI Flashcards

```text
POST /api/flashcards/generate
POST /api/flashcards/review-attempts
GET  /api/flashcards/review-attempts
GET  /api/flashcards/review-attempts/summary
```

### Study Materials

```text
POST   /api/study-materials
GET    /api/study-materials
GET    /api/study-materials/:id
DELETE /api/study-materials/:id
```

### My AI Library

```text
POST   /api/ai-library/summaries
GET    /api/ai-library/summaries
GET    /api/ai-library/summaries/:id
DELETE /api/ai-library/summaries/:id

POST   /api/ai-library/quizzes
GET    /api/ai-library/quizzes
GET    /api/ai-library/quizzes/:id
DELETE /api/ai-library/quizzes/:id

POST   /api/ai-library/flashcards
GET    /api/ai-library/flashcards
GET    /api/ai-library/flashcards/:id
DELETE /api/ai-library/flashcards/:id
```

---

## Database Highlights

StudyPulse AI uses PostgreSQL with Prisma ORM.

Important data areas include:

- Users
- Subjects
- Notes
- Focus sessions
- Academic records
- Study Garden
- Growth activities
- Study quests
- Study materials
- Saved AI summaries
- Saved AI quizzes
- Saved AI flashcards
- Risk prediction history
- Flashcard review attempts
- Summary review attempts

### Recent Analytics Models

#### RiskPredictionHistory

Stores historical risk predictions for each subject.

Used for:

- Risk Timeline
- Trend analysis
- Latest risk summary
- Improving / declining / stable prediction status

#### FlashcardReviewAttempt

Stores flashcard review sessions.

Used for:

- Flashcard Activity dashboard card
- Flashcard accuracy
- Study Engagement Score
- Subject Health analysis

#### SummaryReviewAttempt

Stores reviewed summary sessions.

Used for:

- Summary Activity dashboard card
- Total review time
- Study Engagement Score
- Subject Health analysis

---

## Screenshots

Add your screenshots inside a `docs/screenshots/` folder and update these image paths.

### Dashboard

```markdown
![Dashboard](docs/screenshots/dashboard.png)
```

### Risk Prediction

```markdown
![Risk Prediction](docs/screenshots/risk-prediction.png)
```

### Risk Timeline

```markdown
![Risk Timeline](docs/screenshots/risk-timeline.png)
```

### Subject Health

```markdown
![Subject Health](docs/screenshots/subject-health.png)
```

### Flashcards

```markdown
![Flashcards](docs/screenshots/flashcards.png)
```

### My AI Library

```markdown
![My AI Library](docs/screenshots/ai-library.png)
```

---

## Testing Checklist

### Backend

```bash
cd server
npm run dev
```

Check:

- Server starts without errors
- Prisma connects to PostgreSQL
- Auth routes work
- Protected routes require token
- Risk routes work
- Summary review routes work
- Flashcard review routes work

---

### Frontend

```bash
cd client
npm run dev
```

Check:

- Login works
- Dashboard loads
- Theme toggle works
- Sidebar navigation works
- Subject Health auto-fill works
- Risk Prediction works
- Risk Timeline shows real data
- Flashcard review saves
- Summary review saves
- AI Library opens saved items

---

### ML Service

```bash
cd ml-service
.\venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

Check:

- FastAPI starts
- Swagger opens at `/docs`
- Risk prediction endpoint works
- Subject health endpoint works
- Weak topic endpoint works
- PDF text extraction works

---

## Example User Flow

```text
1. Login as demo student
2. Add or select a subject
3. Upload PDF study material
4. Generate summary
5. Mark summary as reviewed
6. Generate flashcards
7. Review flashcards using Known / Need Review
8. Generate quiz and submit answers
9. Check Dashboard activity cards
10. Open Subject Health and Auto Fill from My Data
11. Run Risk Prediction
12. View Risk Timeline
```

---

## What I Learned

Through this project, I improved my knowledge in:

- Full-stack project architecture
- React component structure
- Protected routing
- REST API development
- JWT authentication
- PostgreSQL database design
- Prisma schema modeling
- Backend controller and service layers
- FastAPI service integration
- AI API integration
- PDF text extraction
- Academic analytics logic
- Risk scoring and trend analysis
- Dashboard data visualization
- Real-world feature planning
- Git branch workflow and project cleanup

---

## Internship Value

This project demonstrates practical skills useful for:

- Software Engineering Intern roles
- Full-Stack Developer Intern roles
- AI/ML Intern roles
- Data Science Intern roles
- QA / Automation Intern roles

It shows the ability to build and connect:

- A modern frontend
- A secure backend
- A relational database
- An AI/ML microservice
- Real analytics features
- User-focused UI/UX
- Portfolio-ready documentation

---

## Future Improvements

Possible future improvements:

- Add trained ML models for risk prediction
- Add notification reminders for weak subjects
- Add calendar-based study scheduling
- Add exportable academic reports
- Add more advanced quiz analytics
- Add personalized study plan recommendations
- Add mobile app support
- Add deployment with Docker

---

## Author

**Paboda Sathsarani Fernando**

BSc (Hons) Information Technology Undergraduate  
Specializing in Data Science / AI / Full-Stack Development

GitHub: `PabodaFdo`

---

## License

This project is licensed under the MIT License.
