const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const subjectRoutes = require('./routes/subject.routes');
const noteRoutes = require('./routes/note.routes');
const focusRoutes = require('./routes/focus.routes');
const academicRoutes = require('./routes/academic.routes');
const gardenRoutes = require('./routes/garden.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const questRoutes = require('./routes/quest.routes');
const riskRoutes = require('./routes/risk.routes');
const subjectHealthRoutes = require('./routes/subjectHealth.routes');
const weakTopicRoutes = require('./routes/weakTopic.routes');
const pdfRoutes = require('./routes/pdf.routes');
const summaryRoutes = require('./routes/summary.routes');
const quizRoutes = require('./routes/quiz.routes');
const flashcardRoutes = require('./routes/flashcard.routes');
const aiLibraryRoutes = require('./routes/aiLibrary.routes');
const studyMaterialRoutes = require('./routes/studyMaterial.routes');
const quizAttemptRoutes = require('./routes/quizAttempt.routes');
const assessmentRoutes = require('./routes/assessment.routes');
const moodRoutes = require('./routes/mood.routes');
const burnoutRoutes = require('./routes/burnout.routes');
const revisionRoutes = require('./routes/revision.routes');
const flowerRoutes = require('./routes/flower.routes');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/focus-sessions', focusRoutes);
app.use('/api/academic-records', academicRoutes);
app.use('/api/study-garden', gardenRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/subject-health', subjectHealthRoutes);
app.use('/api/weak-topics', weakTopicRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/summaries', summaryRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/ai-library', aiLibraryRoutes);
app.use('/api/study-materials', studyMaterialRoutes);
app.use('/api/quiz-attempts', quizAttemptRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/burnout', burnoutRoutes);
app.use('/api/revision', revisionRoutes);
app.use('/api/flowers', flowerRoutes);
// Error Handler
app.use(errorHandler);

module.exports = app;
