<div align="center">

# 🎓 StudyPulse AI 🌱

<img src="https://readme-typing-svg.demolab.com?font=Inter&weight=700&size=28&duration=2500&pause=800&color=8B5CF6&center=true&vCenter=true&width=850&lines=AI-Powered+Student+Productivity+Platform;Smart+Notes+%7C+AI+Summaries+%7C+Quiz+Generator+%7C+Flashcards;Saved+PDF+Materials+%7C+My+AI+Library;Full-Stack+%2B+AI%2FML+Portfolio+Project" alt="Typing SVG" />

<br />

![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/API-Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![FastAPI](https://img.shields.io/badge/AI_Service-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Groq](https://img.shields.io/badge/AI-Groq-F55036?style=for-the-badge)
![Python](https://img.shields.io/badge/ML-Python-3776AB?style=for-the-badge&logo=python&logoColor=white)

<br />

**StudyPulse AI** is a full-stack student productivity and academic growth platform that helps students manage subjects, organize smart notes, track focus sessions, monitor academic performance, upload PDF study materials, generate AI-powered summaries, create interactive quizzes, generate flashcards, and save all AI-generated learning content inside a personal **My AI Library**.

<br />

> 🌱 Study smarter. Grow better. Bloom with StudyPulse AI.

</div>

---

## 📌 Table of Contents

- [Project Vision](#-project-vision)
- [Key Features](#-key-features)
- [AI/ML Features](#-aiml-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Folder Structure](#-folder-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [AI Study Assistant Features](#-ai-study-assistant-features)
- [My AI Library](#-my-ai-library)
- [Database Models](#-database-models)
- [Testing](#-testing)
- [Screenshots](#-screenshots)
- [Project Status](#-current-project-status)
- [Roadmap](#-roadmap)
- [Internship Value](#-internship-value)
- [What I Learned](#-what-i-learned)
- [Author](#-author)
- [License](#-license)

---

## 🌟 Project Vision

Many students struggle with scattered notes, weak revision habits, poor focus consistency, and late awareness of academic risk.

**StudyPulse AI** solves this by combining study management, productivity tracking, academic progress monitoring, gamification, dashboard analytics, AI/ML-powered learning support, PDF-based study assistance, AI summary generation, interactive quiz generation, flashcard generation, and saved AI learning content into one modern student-focused platform.

The project is designed as a **Full-Stack + AI/ML portfolio project** to demonstrate practical software engineering, backend development, database design, authentication, machine learning integration, NLP experimentation, AI service architecture, fallback system design, frontend/backend API integration, and user-focused learning workflows.

---

## ✨ Key Features

### 🔐 Authentication

- User registration and login.
- JWT-based authentication.
- Protected frontend routes.
- Password hashing with bcrypt.
- Logout button in the sidebar.
- Authenticated users can access only their own data.

### 📘 Subject Management

- Add, update, delete, and manage academic subjects.
- Store subject name, code, credits, target grade, current standing, status, and description.
- Connect notes, focus sessions, and academic records to subjects.

### 📚 Smart Notes

- Create, edit, delete, and organize notes.
- Group notes by subject.
- Mark notes as revised.
- Reward students with Study Garden growth points after revision.
- Generate AI summaries from selected note content.
- Use saved Smart Notes as study sources for summary, quiz, and flashcard generation.

### ⏱️ FocusFlow Timer

- Pomodoro-style focus session tracking.
- Save focus sessions by subject.
- Track total study minutes and study hours.
- Support custom focus/break timer settings.
- Reward completed focus sessions with growth points.

### 📊 Academic Records

- Add academic performance records.
- Store course code, course title, credits, grade, attendance, assignments, quizzes, study hours, missed deadlines, and exam marks.
- Support academic progress tracking.
- Used as input for academic risk and subject health features.

### 🌱 Study Garden

- Gamified student progress system.
- Students earn growth points through learning actions.
- Plant stages change based on total growth points.
- Growth activity history is stored in the database.
- Supports manual garden actions such as watering and fertilizer.

### 📈 Dashboard

- View summary of focus sessions, notes, study hours, subjects, academic records, and Study Garden progress.
- Includes charts for weekly focus overview and subject health.
- Shows Study Garden preview, academic records summary, and study quest suggestions.

### 🎯 Study Quests

- Daily and weekly study tasks.
- Designed to improve consistency and study discipline.
- Rewards students with growth points after completing quests.

### 📄 Saved PDF Study Materials

- Upload study PDFs.
- Extract PDF text using the FastAPI ML service.
- Save extracted PDF text permanently in PostgreSQL as **StudyMaterial**.
- Use saved PDF materials as sources for AI summaries, quizzes, and flashcards.
- Avoid old localStorage PDF confusion by saving selected material IDs.

### 📝 AI Summary Generator

- Generates student-friendly summaries from saved PDF materials or Smart Notes.
- Supports long PDF summaries using chunk-based summarization.
- Shows important study points, main summary, section summaries, and key terms.
- Uses Groq API as the main AI generator.
- Uses TF-IDF fallback when Groq is unavailable.
- Generated summaries can be saved to **My AI Library**.

### 🧠 AI Quiz Generator

- Generates interactive quizzes from saved PDF materials or Smart Notes.
- Supports 3, 5, or 10 questions.
- Supports easy, medium, and hard difficulty.
- Lets users select answers and check correctness.
- Shows correct/wrong feedback, explanations, and score.
- Uses Groq API as the main quiz generator.
- Uses rule-based fallback questions when Groq is unavailable.
- Generated quizzes can be saved to **My AI Library**.

### 🃏 AI Flashcard Generator

- Generates flashcards from saved PDF materials or Smart Notes.
- Supports card count and difficulty selection.
- Provides front/back flashcard view.
- Supports flip, next, previous, shuffle, and progress tracking.
- Lets users mark cards as known, still learning, or important.
- Uses Groq API as the main flashcard generator.
- Uses fallback flashcard generation when Groq is unavailable.
- Generated flashcard decks can be saved to **My AI Library**.

### 🗂️ My AI Library

- Stores generated summaries, quizzes, and flashcard decks in PostgreSQL.
- Shows saved summaries, quizzes, flashcards, and PDF materials in one library page.
- Supports tabs for each content type.
- Supports view and delete actions.
- Supports filtering and searching by title, source, topic, question text, flashcard content, date, and word count/card count/question count.
- Keeps AI-generated study content available after refresh and across sessions.

---

## 🤖 AI/ML Features

StudyPulse AI includes a separate **FastAPI ML service** for AI/ML-powered features.

### ✅ Completed AI/ML Features

| Feature | Method | Status |
|---|---|---|
| Academic Risk Prediction | RandomForest model | ✅ Completed |
| Subject Health Score | Rule-based scoring | ✅ Completed |
| Weak Topic Detection | RandomForest model | ✅ Completed |
| PDF Text Extraction | pdfplumber | ✅ Completed |
| Saved PDF Study Materials | PostgreSQL + Prisma | ✅ Completed |
| Generate Summary | Groq API + TF-IDF fallback | ✅ Completed |
| Smart Notes AI Summary | Groq API + TF-IDF fallback | ✅ Completed |
| Interactive Quiz Generator | Groq API + rule-based fallback | ✅ Completed |
| Flashcard Generator | Groq API + fallback generation | ✅ Completed |
| My AI Library | PostgreSQL saved AI content | ✅ Completed |

### 🧠 Academic Risk Prediction

Predicts whether a student may be at low, medium, or high academic risk using study and performance-related factors.

Inputs include:

```txt
attendancePercentage
assignmentAverage
quizAverage
studyHoursPerWeek
missedDeadlines
focusSessionsCompleted
previousExamMark
```

Output includes:

```txt
riskLevel
riskScore
recommendations
```

### 📊 Subject Health Score

Calculates a subject-level health score using academic and study behavior inputs. It helps students understand whether a subject is healthy, moderate, or at risk.

### 🎯 Weak Topic Detection

Detects whether a study topic is strong, moderate, or weak using topic-level study performance data.

### 📄 PDF Text Extraction and Saved Study Materials

Extracts text from uploaded PDF study materials using `pdfplumber`.

After extraction, the PDF text is saved in PostgreSQL as a **StudyMaterial** record. This makes the extracted material reusable across Summary, Quiz, and Flashcard pages.

The saved PDF material can be used for:

```txt
Summary generation
Quiz generation
Flashcard generation
Study material preview
My AI Library PDF material view
```

### 📝 Generate Summary

The Generate Summary feature uses:

```txt
Groq API = main AI summary generator
TF-IDF extractive summarization = fallback
```

The system returns important study points, main summary, section summaries, key terms, word count, and an AI safety note.

For long PDF files, StudyPulse uses a chunk-based approach:

```txt
Saved PDF / Smart Note text
↓
Clean text
↓
Split text into chunks
↓
Summarize each chunk
↓
Merge important points
↓
Generate final summary
↓
Display section summaries
↓
Save to My AI Library
```

### 🧠 AI Quiz Generator

The Quiz Generator creates interactive quizzes from saved PDF materials or Smart Notes.

It uses:

```txt
Groq API = main quiz generator
Rule-based fallback = backup quiz generator
```

### 🃏 AI Flashcard Generator

The Flashcard Generator creates revision cards from saved PDF materials or Smart Notes.

It uses:

```txt
Groq API = main flashcard generator
Rule-based fallback = backup flashcard generator
```

---

## 🧩 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| UI/UX | Framer Motion, Lucide React, Recharts, React Hot Toast |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT, bcryptjs |
| API Communication | Axios |
| AI/ML Service | Python, FastAPI |
| ML Libraries | scikit-learn, pandas, NumPy, joblib |
| PDF Processing | pdfplumber |
| AI Summary | Groq API |
| AI Quiz Generation | Groq API |
| AI Flashcard Generation | Groq API |
| Fallback Summary | TF-IDF using scikit-learn |
| Fallback Quiz | Rule-based short-answer generation |
| Fallback Flashcards | Rule-based flashcard generation |
| API Testing | Postman, FastAPI Swagger |
| Development Tools | VS Code / Antigravity, Git, GitHub |
| Deployment Plan | Vercel, Render/Railway, Supabase/Neon |

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
├── Upload PDF
├── Generate Summary
├── Quiz Generator
├── Flashcards
└── My AI Library
        │
        ▼
Node.js + Express Backend
│
├── JWT Authentication
├── Protected REST APIs
├── Business Logic
├── Study Garden Points
├── Dashboard Analytics
├── Study Material Routes
├── AI Library Routes
├── Summary Proxy Route
├── Quiz Proxy Route
├── Flashcard Proxy Route
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
├── Study Quests
├── Study Materials
├── Saved Summaries
├── Saved Quizzes
└── Saved Flashcard Decks
        │
        ▼
Python FastAPI AI/ML Service
│
├── Academic Risk Prediction
├── Subject Health Score
├── Weak Topic Detection
├── PDF Text Extraction
├── Generate Summary
├── Generate Quiz
└── Generate Flashcards
```

---

## 📁 Folder Structure

```txt
StudyPluse_AI/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── MobileNav.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── AILibrary.jsx
│   │   │   ├── Flashcards.jsx
│   │   │   ├── GenerateSummary.jsx
│   │   │   ├── QuizGenerator.jsx
│   │   │   ├── SmartNotes.jsx
│   │   │   └── UploadPDF.jsx
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx
│   │   ├── services/
│   │   │   ├── aiLibrary.service.js
│   │   │   ├── flashcard.service.js
│   │   │   ├── quiz.service.js
│   │   │   ├── studyMaterial.service.js
│   │   │   └── summary.service.js
│   │   └── main.jsx
│   └── package.json
│
├── server/
│   ├── prisma/
│   │   ├── migrations/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── aiLibrary.controller.js
│   │   │   ├── flashcard.controller.js
│   │   │   ├── quiz.controller.js
│   │   │   ├── studyMaterial.controller.js
│   │   │   └── summary.controller.js
│   │   ├── routes/
│   │   │   ├── aiLibrary.routes.js
│   │   │   ├── flashcard.routes.js
│   │   │   ├── quiz.routes.js
│   │   │   ├── studyMaterial.routes.js
│   │   │   └── summary.routes.js
│   │   ├── services/
│   │   │   ├── aiLibrary.service.js
│   │   │   ├── flashcard.service.js
│   │   │   ├── quiz.service.js
│   │   │   ├── studyMaterial.service.js
│   │   │   └── summary.service.js
│   │   ├── app.js
│   │   └── server.js
│   └── package.json
│
├── ml-service/
│   ├── app/
│   │   ├── services/
│   │   │   ├── flashcard_service.py
│   │   │   ├── pdf_service.py
│   │   │   ├── quiz_service.py
│   │   │   ├── risk_service.py
│   │   │   ├── subject_health_service.py
│   │   │   ├── summary_service.py
│   │   │   └── weak_topic_service.py
│   │   ├── main.py
│   │   ├── schemas.py
│   │   └── utils.py
│   ├── .env.example
│   └── requirements.txt
│
├── notebooks/
│   └── StudyPulse_HuggingFace_Summary_Test.ipynb
├── docs/
│   └── screenshots/
├── README.md
├── LICENSE
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

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

### 2. Run the Backend

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
ML_SERVICE_URL="http://localhost:8000"
```

Run Prisma commands:

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

If PowerShell blocks `npx`, use:

```bash
npx.cmd prisma generate
npx.cmd prisma migrate dev
npx.cmd prisma db seed
```

Start the backend:

```bash
npm run dev
```

Backend runs at:

```txt
http://localhost:5000
```

### 3. Run the Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs at:

```txt
http://localhost:5173
```

### 4. Run the FastAPI ML Service

```bash
cd ml-service
python -m venv venv
```

For Windows PowerShell:

```bash
.\venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside `ml-service`:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

Start FastAPI:

```bash
uvicorn app.main:app --reload --port 8000
```

FastAPI runs at:

```txt
http://localhost:8000
```

FastAPI Swagger docs:

```txt
http://localhost:8000/docs
```

---

## 🔐 Demo Login

```txt
Email: demo@studypulse.ai
Password: password123
```

---

## 🔑 Environment Variables

### Server `.env`

```env
PORT=5000
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/studypulse_ai?schema=public"
JWT_SECRET="change_this_secret"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
ML_SERVICE_URL="http://localhost:8000"
```

### ML Service `.env`

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

### Important Security Note

Do not commit real `.env` files to GitHub.

The Groq API key must stay inside:

```txt
ml-service/.env
```

It should never be added to the React frontend.

React calls the Node backend only. The Node backend calls the FastAPI ML service.

---

## 📡 API Overview

### Node + Express APIs

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

POST /api/summary/generate
POST /api/quiz/generate
POST /api/flashcards/generate

POST   /api/study-materials
GET    /api/study-materials
GET    /api/study-materials/:id
DELETE /api/study-materials/:id

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

### FastAPI ML Service Endpoints

```txt
GET  /health
POST /predict-risk
POST /subject-health
POST /weak-topics
POST /extract-pdf
POST /generate-summary
POST /generate-quiz
POST /generate-flashcards
```

### Generate Summary Request

```json
{
  "text": "extracted PDF or note text here"
}
```

### Generate Quiz Request

```json
{
  "text": "extracted PDF or note text here",
  "question_count": 5,
  "difficulty": "medium"
}
```

### Generate Flashcards Request

```json
{
  "text": "extracted PDF or note text here",
  "card_count": 10,
  "difficulty": "medium"
}
```

---

## 🧠 AI Study Assistant Features

### AI Summary Experiment and Final Decision

The Generate Summary feature went through multiple experiments before the final implementation.

#### Google Colab Experiment Notebook

The Hugging Face summarization experiments were tested in Google Colab before implementation.

Notebook location:

```txt
notebooks/StudyPulse_HuggingFace_Summary_Test.ipynb
```

#### Tested Approaches

| Approach | Result | Decision |
|---|---|---|
| `sshleifer/distilbart-cnn-12-6` | Generated short summaries but missed some study details | Not selected as final main method |
| `google/flan-t5-base` | Gave very general output for some tests | Not selected |
| `facebook/bart-large-cnn` | Better than DistilBART but sometimes missed details or mixed meanings | Useful for learning, not selected as final main method |
| TF-IDF extractive summarization | More reliable because it selects important original sentences | Selected as fallback |
| Groq API | Produced better instruction-based student summaries | Selected as main AI summary method |

#### Final Decision

```txt
Groq API = Main AI summary generator
TF-IDF extractive summarization = Fallback method
```

### AI Quiz Generator

```txt
Saved PDF / Smart Note
↓
Quiz Generator Page
↓
Node.js /api/quiz/generate
↓
FastAPI /generate-quiz
↓
Try Groq Quiz Generation
↓
If Groq works: return MCQ questions with options, correct answer, and explanation
↓
If Groq fails: return fallback short-answer questions
↓
Display interactive quiz in React
↓
Save quiz to My AI Library
```

### AI Flashcard Generator

```txt
Saved PDF / Smart Note
↓
Flashcards Page
↓
Node.js /api/flashcards/generate
↓
FastAPI /generate-flashcards
↓
Try Groq Flashcard Generation
↓
If Groq works: return flashcards with front, back, category, and difficulty
↓
If Groq fails: return fallback flashcards from important sentences
↓
Display interactive flashcard deck in React
↓
Save flashcard deck to My AI Library
```

---

## 🗂️ My AI Library

My AI Library stores AI-generated study content permanently in PostgreSQL.

### Saved Content Types

```txt
Saved Summaries
Saved Quizzes
Saved Flashcard Decks
Saved PDF Materials
```

### Library Features

```txt
View saved summaries
View saved quizzes
View saved flashcard decks
View saved PDF materials
Delete saved items
Filter by date
Search by title/source/topic/content
Sort by newest, oldest, title, word count, question count, or card count
Dark/light theme support
```

---

## 🌱 Study Garden Points System

| Action | Growth Points |
|---|---:|
| Create note | +3 |
| Mark note as revised | +5 |
| Complete focus session | +10 |
| Add academic record | +3 |
| Water plant | +15 |
| Apply fertilizer | +40 |
| Complete study quest | Custom reward |

### Plant Growth Stages

| Points | Stage |
|---:|---|
| 0–20 | Seed |
| 21–50 | Small Sprout |
| 51–100 | Growing Plant |
| 101–160 | Healthy Plant |
| 161–230 | Flower Buds |
| 231+ | Blooming Flowers |

---

## 🗄️ Database Models

Main models:

```txt
User
Subject
Note
FocusSession
AcademicRecord
StudyGarden
GrowthActivity
StudyQuest
StudyMaterial
SavedSummary
SavedQuiz
SavedFlashcardDeck
```

### AI Library Models

```txt
StudyMaterial
- Stores extracted PDF text.
- Belongs to a logged-in user.
- Used as a source for Summary, Quiz, and Flashcard generation.

SavedSummary
- Stores generated AI summaries.
- Includes summary content, source type, source title, and word count.

SavedQuiz
- Stores generated quiz questions.
- Includes questions, options, correct answers, explanations, source type, and word count.

SavedFlashcardDeck
- Stores generated flashcards.
- Includes front/back cards, category, difficulty, source type, and word count.
```

---

## 📊 Current Project Status

| Module | Status |
|---|---|
| Frontend UI | ✅ Completed |
| Light/Dark Theme | ✅ Completed |
| Backend Structure | ✅ Completed |
| PostgreSQL + Prisma | ✅ Completed |
| JWT Authentication Backend | ✅ Completed |
| Frontend Authentication Integration | ✅ Completed |
| Protected Routes | ✅ Completed |
| Logout Button | ✅ Completed |
| Subjects API | ✅ Completed |
| Subjects Frontend Integration | ✅ Completed |
| Notes API | ✅ Completed |
| Smart Notes Frontend Integration | ✅ Completed |
| Focus Sessions API | ✅ Completed |
| Focus Timer Frontend Integration | ✅ Completed |
| Academic Records API | ✅ Completed |
| Academic Records Frontend Integration | ✅ Completed |
| Study Garden API | ✅ Completed |
| Study Garden Frontend Integration | ✅ Completed |
| Dashboard API | ✅ Completed |
| Dashboard Frontend Integration | ✅ Completed |
| Study Quests Integration | ✅ Completed |
| FastAPI ML Service | ✅ Completed |
| Academic Risk Prediction | ✅ Completed |
| Subject Health Score | ✅ Completed |
| Weak Topic Detection | ✅ Completed |
| PDF Text Extraction | ✅ Completed |
| Saved PDF Materials | ✅ Completed |
| AI Summary Generator | ✅ Completed |
| AI Quiz Generator | ✅ Completed |
| AI Flashcard Generator | ✅ Completed |
| Save Summaries to Database | ✅ Completed |
| Save Quizzes to Database | ✅ Completed |
| Save Flashcards to Database | ✅ Completed |
| My AI Library Page | ✅ Completed |
| My AI Library Filters | ✅ Completed |
| Deployment | 🟡 Planned |

---

## 🧪 Testing

### Backend API Testing

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
Growth activity logs
Dashboard summary
Dashboard chart data
Study material creation/list/detail/delete
AI Library summary save/list/detail/delete
AI Library quiz save/list/detail/delete
AI Library flashcard save/list/detail/delete
Summary generation route
Quiz generation route
Flashcard generation route
```

### FastAPI ML Service Testing

FastAPI endpoints were tested using Swagger UI.

Tested areas:

```txt
Academic risk prediction
Subject health score
Weak topic detection
PDF text extraction
Groq summary generation
TF-IDF fallback summary
Groq quiz generation
Rule-based fallback quiz
Groq flashcard generation
Rule-based fallback flashcards
```

### Frontend Testing

Frontend testing areas:

```txt
Login and register flow
Logout flow
Protected route access
Subjects page API integration
Smart Notes API integration
Smart Notes AI summary generation
Focus Timer save flow
Academic Records CRUD
Study Garden growth points
Dashboard summary cards
PDF upload and text extraction
Saving extracted PDF text to PostgreSQL
Saved PDF source dropdown
Generate Summary page
Save Summary modal and My AI Library save flow
AI Quiz Generator page
Answer selection and checking
Quiz score update
Save Quiz modal and My AI Library save flow
Flashcard Generator page
Flashcard flip/navigation/status tracking
Save Flashcards modal and My AI Library save flow
My AI Library tabs
My AI Library view/delete actions
My AI Library filters and sorting
Dark/light theme readability
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
Smart Notes AI Summary
Focus Timer
Study Garden
Academic Records
Study Quests
PDF Text Extraction
Saved PDF Materials Dropdown
Generate Summary Page
Summary Save Modal
Quiz Generator Setup
Generated Quiz Questions
Quiz Answer Check
Flashcard Generator
Flashcard Save Modal
My AI Library Summaries
My AI Library Quizzes
My AI Library Flashcards
My AI Library PDF Materials
My AI Library Filters
FastAPI Swagger
```

Example README image format:

```md
![Dashboard](docs/screenshots/dashboard.png)

![PDF Text Extraction](docs/screenshots/upload-pdf-extraction.png)

![Generate Summary Page](docs/screenshots/generate-summary-page.png)

![Quiz Generator](docs/screenshots/quiz-generator-page.png)

![Flashcards](docs/screenshots/flashcards-page.png)

![My AI Library](docs/screenshots/my-ai-library.png)
```

---

## 🛣️ Roadmap

### Version 1 — Full-Stack MVP

- [x] Frontend UI
- [x] Light/Dark theme
- [x] Backend setup
- [x] PostgreSQL database
- [x] Prisma schema and migrations
- [x] JWT authentication
- [x] Protected routes
- [x] Logout button
- [x] Subjects CRUD
- [x] Smart Notes CRUD
- [x] Focus session tracking
- [x] Academic records tracking
- [x] Study Garden growth points
- [x] Dashboard summary and charts
- [x] Frontend/backend API integration
- [x] Study Quests frontend/backend integration
- [ ] Final responsive UI polish
- [ ] Add final screenshots to README

### Version 2 — AI/ML Service

- [x] Create FastAPI ML service
- [x] Add ML service health endpoint
- [x] Add academic risk prediction model
- [x] Add subject health score
- [x] Add weak topic detection
- [x] Add PDF text extraction
- [x] Add Generate Summary endpoint
- [x] Add Groq summary integration
- [x] Add TF-IDF fallback summary
- [x] Connect Express backend to summary endpoint
- [x] Connect frontend Generate Summary page
- [x] Connect Smart Notes AI summary
- [x] Add Generate Quiz endpoint
- [x] Add Groq quiz generation
- [x] Add quiz fallback system
- [x] Connect Express backend to quiz endpoint
- [x] Connect frontend Quiz Generator page
- [x] Add Generate Flashcards endpoint
- [x] Add Groq flashcard generation
- [x] Add flashcard fallback system
- [x] Connect Express backend to flashcard endpoint
- [x] Connect frontend Flashcards page

### Version 3 — AI Study Assistant

- [x] PDF upload
- [x] PDF text extraction
- [x] Save extracted PDF text to database
- [x] Saved PDF materials source selection
- [x] Summary generation backend endpoint
- [x] Summary generation frontend integration
- [x] Smart Notes AI summary integration
- [x] Quiz generation backend endpoint
- [x] Quiz generation frontend integration
- [x] Interactive quiz mode
- [x] Flashcard generation
- [x] Interactive flashcard mode
- [x] Save generated summaries to database
- [x] Save generated quizzes to database
- [x] Save flashcards to database
- [x] My AI Library page
- [x] My AI Library filters

### Version 4 — Advanced Features

- [ ] Mood check-in analytics
- [ ] Burnout warning
- [ ] Revision reminders
- [ ] Flower/badge collection
- [ ] Report export
- [ ] Admin dashboard
- [ ] Full deployment

---

## 💼 Internship Value

This project demonstrates:

```txt
Full-stack application development
REST API development
JWT authentication
Protected route handling
Logout/session handling
Database design with Prisma
PostgreSQL integration
Frontend dashboard design
API integration with Axios
Gamification logic
Study analytics
Postman API testing
FastAPI ML microservice development
scikit-learn model integration
RandomForest model usage
PDF text extraction
NLP experimentation
Hugging Face model testing
Groq API integration
Fallback architecture
AI summary generation
Interactive AI quiz generation
AI flashcard generation
Saved AI content management
Search/filter/sort UI logic
Frontend state management
Real-world AI feature design
Full-stack AI system integration
```

---

## 🧠 What I Learned

Through this project, I practiced:

```txt
Building a full-stack React + Express application
Designing database models with Prisma
Connecting PostgreSQL with a backend API
Creating protected routes with JWT
Building dashboard analytics
Designing gamification logic
Creating a separate FastAPI ML service
Training and using RandomForest models
Using pdfplumber for PDF text extraction
Testing Hugging Face summarization models in Colab
Understanding limitations of AI summarization
Using Groq API for instruction-based AI summary generation
Creating a TF-IDF fallback system
Designing chunk-based summary generation for long PDFs
Creating AI-generated quizzes from study material
Creating a rule-based quiz fallback system
Creating AI-generated flashcards from study material
Saving extracted PDF text permanently in PostgreSQL
Saving AI-generated summaries, quizzes, and flashcards
Building a searchable My AI Library page
Connecting FastAPI AI services through an Express backend
Testing both success and failure paths
Improving dark/light theme readability
Handling React rendering issues safely
Documenting project decisions for portfolio and interview explanation
```

---

## 📌 CV Bullet

Built StudyPulse AI, a full-stack student productivity and academic growth platform with JWT authentication, subject and note management, focus session tracking, academic records, dashboard analytics, and a gamified Study Garden system using React, Express.js, PostgreSQL, Prisma, Node.js, and FastAPI. Integrated AI/ML features including academic risk prediction, subject health scoring, weak topic detection, PDF text extraction, AI-powered summary generation using Groq with a TF-IDF fallback system, interactive AI quiz generation, AI flashcard generation, saved PDF study materials, and a searchable My AI Library for storing generated summaries, quizzes, and flashcard decks.

---

## 👩‍💻 Author

**Paboda Fernando**  
BSc (Hons) Information Technology Undergraduate  
Sri Lanka Institute of Information Technology

---

## 📄 License

This project is licensed under the MIT License.

See the [LICENSE](LICENSE) file for details.

---

<div align="center">

### 🌱 Study smarter. Grow better. Bloom with StudyPulse AI.

</div>
