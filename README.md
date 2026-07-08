<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:22c55e,50:06b6d4,100:8b5cf6&height=190&section=header&text=StudyPulse%20AI&fontSize=52&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=AI-Powered%20Student%20Productivity%20%2B%20Wellness%20Platform&descAlignY=58&descSize=17" alt="StudyPulse AI animated header" />

<img src="https://readme-typing-svg.demolab.com?font=Poppins&weight=700&size=24&duration=2600&pause=700&color=22C55E&center=true&vCenter=true&width=900&lines=Smart+Notes+%7C+AI+Quizzes+%7C+Flashcards;Mood+Check-in+%7C+Burnout+Warning+%7C+Revision+Reminders;Study+Garden+%7C+Flower+Collection+%7C+Dashboard+Analytics" alt="Animated StudyPulse AI feature topics" />

<br />

![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-API-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-ML_Service-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-AI%2FML-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-AI_Generation-F55036?style=for-the-badge)

</div>

# 🌱 StudyPulse AI

**StudyPulse AI** is a full-stack, AI-powered student productivity, wellness, and academic growth platform.

It helps students manage subjects, create smart notes, track focus sessions, monitor academic performance, upload PDF study materials, generate AI summaries, create AI quizzes, generate flashcards, save AI learning content, track wellness, receive revision reminders, and unlock gamified flower rewards.

> **Study smarter. Grow better. Bloom with StudyPulse AI.**

---

## 📌 Table of Contents

- [Project Vision](#-project-vision)
- [Key Features](#-key-features)
- [AI/ML Features](#-aiml-features)
- [Wellness & Gamification Features](#-wellness--gamification-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [Database Models](#-database-models)
- [Testing](#-testing)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [What I Learned](#-what-i-learned)
- [CV Highlight](#-cv-highlight)
- [Author](#-author)
- [License](#-license)

---

## 🎯 Project Vision

Many students struggle with scattered notes, inconsistent revision habits, poor focus routines, late academic risk awareness, and unhealthy study overload.

**StudyPulse AI** solves this by combining:

- Study management
- AI-powered learning support
- Academic performance tracking
- Focus and productivity tracking
- Student wellness monitoring
- Revision reminders
- Gamification and reward systems
- Dashboard analytics

The project is designed as a **Full-Stack + AI/ML portfolio project** to demonstrate practical skills in frontend development, backend API development, database design, authentication, AI service integration, PDF processing, machine-learning-style analytics, and real-world feature planning.

---

## ✨ Key Features

### 🔐 Authentication & Security

- User registration and login
- JWT-based authentication
- Protected frontend routes
- Secure password hashing with bcrypt
- Logout with session clearing
- User-specific data access

### 📚 Subject & Study Management

- Add, update, delete, and manage academic subjects
- Store subject name, code, credits, target grade, and current standing
- Connect notes, focus sessions, and academic records with subjects

### 📝 Smart Notes

- Create, edit, delete, and organize notes
- Group notes by subject
- Mark notes as revised
- Use saved notes as sources for AI summaries, quizzes, and flashcards

### ⏱️ FocusFlow Timer

- Track focused study sessions
- Save focus sessions by subject
- Monitor total study time
- Support better study consistency through focus tracking

### 📊 Academic Records

- Add academic performance records
- Store attendance, assignment marks, quiz marks, study hours, and exam marks
- Use academic data for academic risk, subject health, burnout analytics, and revision reminder generation

### 🌿 Study Garden & Quests

- Gamified learning experience
- Earn growth points through study actions
- Complete study quests to build consistent habits
- Track plant progress as a motivation system

### 📈 Dashboard Analytics

The dashboard gives students a quick overview of academic productivity, AI content, and wellness progress.

It includes compact summary cards for:

- Mood Summary
- Burnout Risk
- Revision Reminders
- Flower Collection Progress

### 🌙 Dark/Light Theme

- Supports both dark and light themes
- Responsive modern interface
- Theme-safe UI styling for readability

---

## 🤖 AI/ML Features

StudyPulse AI includes a separate **FastAPI AI/ML service** that works together with the Node.js backend.

| Feature | Method | Status |
|---|---|---|
| Academic Risk Prediction | Machine learning / rule-based logic | ✅ Completed |
| Subject Health Score | Rule-based scoring | ✅ Completed |
| Weak Topic Detection | ML / rule-based logic | ✅ Completed |
| PDF Text Extraction | pdfplumber | ✅ Completed |
| Saved PDF Study Materials | PostgreSQL + Prisma | ✅ Completed |
| AI Summary Generation | Groq API + fallback logic | ✅ Completed |
| Smart Notes AI Summary | Groq API + fallback logic | ✅ Completed |
| AI Quiz Generation | Groq API + fallback logic | ✅ Completed |
| AI Flashcard Generation | Groq API + fallback logic | ✅ Completed |
| My AI Library | Saved AI content in PostgreSQL | ✅ Completed |

### 📄 PDF Text Extraction

Students can upload PDF study materials. The FastAPI service extracts text from the PDF using `pdfplumber`, and the extracted text is saved as a Study Material in PostgreSQL.

Saved PDF materials can be reused for:

- AI summary generation
- AI quiz generation
- AI flashcard generation
- Study material preview
- My AI Library

### 🧠 AI Summary Generation

The summary generator creates structured summaries from saved PDF materials or Smart Notes.

It can return:

- Main summary
- Important points
- Key terms
- Section summaries
- Word count

### ❓ AI Quiz Generation

The quiz generator creates interactive quizzes from saved PDF materials or Smart Notes.

It supports:

- Multiple-choice questions
- Difficulty selection
- Answer selection
- Correct/wrong feedback
- Answer explanations
- Score tracking
- Save to My AI Library

### 🃏 AI Flashcard Generation

The flashcard generator creates active recall flashcards from saved PDF materials or Smart Notes.

It supports:

- Front/back flashcards
- Difficulty selection
- Flip interaction
- Navigation
- Shuffle mode
- Known / still learning / important status
- Save to My AI Library

### 🛡️ Fallback Support

If the Groq API is unavailable, rate-limited, or fails, the system uses fallback logic for summaries, quizzes, and flashcards. This allows the app to continue working even when the external AI service is unavailable.

---

## 🌸 Wellness & Gamification Features

StudyPulse AI includes a complete wellness and gamification layer.

| Feature | Description | Status |
|---|---|---|
| Mood Check-in | Saves daily mood, energy, stress, and journal notes | ✅ Completed |
| Burnout Warning | Analyzes mood, stress, energy, focus sessions, and academic pressure | ✅ Completed |
| Revision Reminders | Generates and manages real revision reminders | ✅ Completed |
| Flower Collection | Unlocks flowers based on study progress and wellness activities | ✅ Completed |
| Dashboard Wellness Summary | Shows compact wellness and gamification cards on the dashboard | ✅ Completed |

### 😊 Mood Check-in

Mood Check-in allows students to track their daily wellness.

Users can save:

- Mood level
- Energy level
- Stress level
- Optional journal note

The system also calculates a 7-day summary:

- Average mood
- Average energy
- Average stress
- Total check-ins

### 🔥 Burnout Warning

Burnout Warning is a wellness analytics feature.

It uses real StudyPulse data such as:

- Mood check-ins
- Stress level
- Energy level
- Mood level
- Focus sessions
- Weekly focus hours
- Academic pressure data

The system calculates:

- Burnout risk percentage
- Risk level: Low / Medium / High
- Main reasons
- Suggested rebalancing steps

> Note: Burnout Warning is not a medical diagnosis. It is a study wellness indicator designed to help students identify overload early.

### 🔔 Revision Reminders

Revision Reminders help students know what to revise next.

The system can generate reminders from:

- Academic records
- Quiz performance
- Assignment performance
- Previous exam marks
- Old notes
- Subject progress

Users can:

- Generate reminders
- Complete reminders
- Snooze reminders
- Delete reminders
- Filter by priority and status

### 🌺 Flower Collection Rewards

Flower Collection connects gamification with real study progress.

Students unlock flowers based on completed study actions.

| Flower | Unlock Rule |
|---|---|
| Rose | Complete 1 Study Quest |
| Sunflower | Reach 100 Study Garden growth points |
| Lotus | Complete 5 Focus Sessions |
| Orchid | Complete 3 Revision Reminders |
| Cherry Blossom | Complete 5 Mood Check-ins |
| Lavender | Reach 250 Study Garden growth points |

Unlocked flowers are saved in the database and remain unlocked after refresh.

---

## 🛠️ Tech Stack

<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=Poppins&weight=600&size=22&duration=2400&pause=800&color=8B5CF6&center=true&vCenter=true&width=900&lines=React+%2B+Vite+%2B+Tailwind+CSS;Node.js+%2B+Express+%2B+Prisma+%2B+PostgreSQL;FastAPI+%2B+Python+%2B+Groq+AI;Git+%2B+GitHub+%2B+Postman+%2B+VS+Code" alt="Animated tools and technologies" />

<br />

<img src="https://skillicons.dev/icons?i=react,vite,tailwind,nodejs,express,postgres,prisma,python,fastapi,git,github,vscode&theme=dark" alt="StudyPulse AI tools and technologies" />

</div>

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router |
| UI/UX | Framer Motion, Lucide React, Recharts, React Hot Toast |
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

## 🏗️ System Architecture

StudyPulse AI follows a multi-service architecture:

```txt
React Frontend
      ↓
Node.js Express Backend
      ↓
PostgreSQL Database

Node.js Express Backend
      ↓
FastAPI AI/ML Service
      ↓
Groq API / ML Logic / PDF Processing
```

The React frontend does not directly call the FastAPI AI/ML service.

Instead:

```txt
React sends a request to the Node.js backend
Node.js backend validates and forwards AI/ML requests to FastAPI
FastAPI returns the AI/ML result
Node.js backend sends the result back to React
```

This keeps the architecture cleaner and safer because API keys and AI service logic are not exposed to the frontend.

---

## 📁 Folder Structure

```txt
StudyPluse_AI/
├── client/        # React + Vite frontend
├── server/        # Node.js + Express backend
├── ml-service/    # FastAPI AI/ML service
├── notebooks/     # Experiment notebooks
├── README.md
├── LICENSE
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

Install these before running the project:

```txt
Node.js 18+
npm
PostgreSQL
Python 3.10+
Git
Postman
```

### 1. Clone the Repository

```bash
git clone https://github.com/PabodaFdo/StudyPluse_AI.git
cd StudyPluse_AI
```

### 2. Backend Setup

```bash
cd server
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Backend runs at:

```txt
http://localhost:5000
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend runs at:

```txt
http://localhost:5173
```

### 4. FastAPI AI/ML Service Setup

```bash
cd ml-service
python -m venv venv
```

Activate virtual environment on Windows:

```bash
.\venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run FastAPI:

```bash
uvicorn app.main:app --reload --port 8000
```

FastAPI runs at:

```txt
http://localhost:8000
```

Swagger documentation:

```txt
http://localhost:8000/docs
```

---

## 🔑 Demo Login

```txt
Email: demo@studypulse.ai
Password: password123
```

---

## ⚙️ Environment Variables

Create `.env` files inside both the `server` and `ml-service` folders.

### `server/.env`

```env
PORT=5000
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/studypulse_ai?schema=public"
JWT_SECRET="change_this_secret"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
ML_SERVICE_URL="http://localhost:8000"
```

### `ml-service/.env`

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

### Security Note

Never commit `.env` files to GitHub.

The Groq API key must stay inside:

```txt
ml-service/.env
```

It should never be added to the React frontend.

---

## 🔌 API Overview

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
```

### Focus Sessions

```txt
GET  /api/focus
POST /api/focus
```

### Academic Records

```txt
GET    /api/records
POST   /api/records
PUT    /api/records/:id
DELETE /api/records/:id
```

### Dashboard

```txt
GET /api/dashboard/summary
```

### Mood Check-in

```txt
POST   /api/mood/check-ins
GET    /api/mood/check-ins
GET    /api/mood/summary
DELETE /api/mood/check-ins/:id
```

### Burnout Warning

```txt
GET /api/burnout/summary
```

### Revision Reminders

```txt
GET    /api/revision/reminders
POST   /api/revision/reminders/generate
PATCH  /api/revision/reminders/:id/complete
PATCH  /api/revision/reminders/:id/snooze
DELETE /api/revision/reminders/:id
```

### Flower Collection

```txt
GET  /api/flowers/collection
POST /api/flowers/check-unlocks
```

### Study Garden

```txt
GET  /api/study-garden
POST /api/study-garden/add-points
```

### Study Quests

```txt
GET   /api/quests
PATCH /api/quests/:id/complete
```

### AI Generation

```txt
POST /api/summary/generate
POST /api/quiz/generate
POST /api/flashcards/generate
```

---

## 🗄️ Database Models

Main Prisma models include:

```txt
User
Subject
Note
FocusSession
AcademicRecord
StudyGarden
GrowthActivity
StudyQuest
RiskPredictionHistory
MoodCheckIn
RevisionReminder
FlowerCollection
```

---

## 🧪 Testing

### Manual Testing Checklist

```txt
Authentication
- Register works
- Login works
- Protected routes work
- Logout works

Dashboard
- Summary cards load
- Charts load
- Wellness & Gamification cards load

Mood Check-in
- Save mood check-in
- View recent mood history
- Summary averages update
- Delete check-in
- Data persists after refresh

Burnout Warning
- Risk percentage loads
- Risk level displays
- Reasons and recommendations display
- Uses real mood and focus data

Revision Reminders
- Generate reminders
- Complete reminder
- Snooze reminder
- Delete reminder
- Filters work
- Data persists after refresh

Flower Collection
- Collection loads
- Check unlocks works
- Unlocked flowers persist
- No duplicate flowers are created

AI Features
- Upload PDF
- Extract text
- Generate summary
- Generate quiz
- Generate flashcards
- Save generated content to My AI Library

Theme
- Light theme readable
- Dark theme readable
```

---

## 🖼️ Screenshots

Add screenshots inside a folder such as:

```txt
client/public/screenshots/
```

Recommended screenshots:

```txt
Landing Page
Dashboard
Mood Check-in
Burnout Warning
Revision Reminders
Flower Collection
Study Garden
Study Quests
AI Summary Generator
Quiz Generator
Flashcards
My AI Library
```

Example:

```md
![Dashboard](client/public/screenshots/dashboard.png)
![Mood Check-in](client/public/screenshots/mood-checkin.png)
![Burnout Warning](client/public/screenshots/burnout-warning.png)
![Flower Collection](client/public/screenshots/flower-collection.png)
```

---

## 🧭 Roadmap

### Completed

- Authentication
- Subject management
- Smart Notes
- Focus sessions
- Academic records
- Dashboard analytics
- Study Garden
- Study Quests
- Academic Risk Prediction
- Subject Health Score
- Weak Topic Detection
- PDF text extraction
- AI summary generation
- AI quiz generation
- AI flashcard generation
- My AI Library
- Mood Check-in
- Burnout Warning
- Revision Reminders
- Flower Collection Rewards
- Wellness & Gamification dashboard summaries

### Future Improvements

- Calendar-based revision schedule
- Email or browser notification reminders
- More advanced spaced repetition logic
- AI chatbot for asking questions from saved materials
- More detailed performance trend charts
- Export study reports as PDF
- Deployment with production database
- Unit and integration tests

---

## 📚 What I Learned

While building StudyPulse AI, I gained practical experience in developing a complete full-stack AI-powered application from planning to implementation. This project helped me understand how frontend, backend, database, and AI/ML services work together in a real-world system.

Through this project, I practiced and improved my skills in:

- Building a full-stack web application using React, Node.js, Express, PostgreSQL, Prisma, and FastAPI
- Designing and organizing a scalable project structure with separate frontend, backend, and AI/ML service layers
- Creating secure authentication using JWT and bcrypt
- Designing relational database models with Prisma
- Building protected REST APIs for user-specific data
- Connecting React pages to backend APIs using Axios services
- Handling loading states, error states, empty states, and persistent data
- Integrating an AI/ML microservice with a Node.js backend
- Using FastAPI for AI/ML-related endpoints
- Extracting text from PDF files using Python and `pdfplumber`
- Generating AI summaries, quizzes, and flashcards using Groq API with fallback logic
- Building academic analytics features such as risk prediction, subject health score, and weak topic detection
- Implementing wellness analytics with Mood Check-in and Burnout Warning
- Creating practical student support features such as Revision Reminders
- Building gamification features such as Study Garden, Study Quests, and Flower Collection Rewards
- Creating compact dashboard analytics for academic, wellness, and gamification progress
- Improving UI readability in both light and dark themes
- Practicing Git branch workflow, feature branches, commits, pull requests, and merging into `dev`
- Testing features manually through the browser, backend terminal, network tab, and API responses
- Writing clearer documentation for project setup, features, APIs, and future improvements

This project also helped me understand how to turn a simple study tracking idea into a more complete productivity and wellness system for students.

---

## 📌 CV Highlight

```txt
StudyPulse AI — Full-Stack AI-Powered Student Productivity Platform

Developed a full-stack AI-powered study productivity platform using React, Node.js, Express, PostgreSQL, Prisma, FastAPI, and Groq API. Implemented secure authentication, subject management, smart notes, focus tracking, academic risk prediction, PDF text extraction, AI summaries, AI quizzes, AI flashcards, wellness analytics, revision reminders, gamified Study Garden, Flower Collection rewards, and dashboard insights.
```

---

## 👩‍💻 Author

**Paboda Sathsarani Fernando**

- GitHub: [PabodaFdo](https://github.com/PabodaFdo)
- Project Repository: [StudyPluse_AI](https://github.com/PabodaFdo/StudyPluse_AI)

---

## 📄 License

This project is licensed under the MIT License.

---

## ⭐ Final Note

StudyPulse AI is built to help students study smarter, stay consistent, understand academic risk early, and balance productivity with wellbeing.

> Grow your knowledge. Track your progress. Bloom with StudyPulse AI.
