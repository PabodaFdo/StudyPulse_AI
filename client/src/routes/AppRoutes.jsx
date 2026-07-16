import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';

// Public Pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import About from '../pages/About';

// Student Dashboard Pages
import Dashboard from '../pages/Dashboard';
import Subjects from '../pages/Subjects';
import SmartNotes from '../pages/SmartNotes';
import UploadPDF from '../pages/UploadPDF';

import QuizGenerator from '../pages/QuizGenerator';
import Flashcards from '../pages/Flashcards';
import AILibrary from '../pages/AILibrary';
import FocusTimer from '../pages/FocusTimer';
import FocusAnalytics from '../pages/FocusAnalytics';
import AcademicRecords from '../pages/AcademicRecords';
import RiskPrediction from '../pages/RiskPrediction';
import RiskTimeline from '../pages/RiskTimeline';
import StudyGarden from '../pages/StudyGarden';
import StudyQuests from '../pages/StudyQuests';
import FlowerCollection from '../pages/FlowerCollection';
import WeakTopicRadar from '../pages/WeakTopicRadar';
import SubjectHealth from '../pages/SubjectHealth';
import MoodCheckIn from '../pages/MoodCheckIn';
import BurnoutWarning from '../pages/BurnoutWarning';
import RevisionReminders from '../pages/RevisionReminders';
import Profile from '../pages/Profile';
import Assessments from '../pages/Assessments';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Layout and Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
      </Route>

      {/* Student Layout and Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/subjects" element={<Subjects />} />
          
          {/* Support both sidebar and standard routes */}
          <Route path="/smart-notes" element={<SmartNotes />} />
          <Route path="/notes" element={<SmartNotes />} />

          <Route path="/upload-pdf" element={<UploadPDF />} />
          <Route path="/generate-summary" element={<Navigate to="/smart-notes" replace />} />

          <Route path="/quiz-generator" element={<QuizGenerator />} />
          <Route path="/quizzes" element={<QuizGenerator />} />

          <Route path="/flashcards" element={<Flashcards />} />

          <Route path="/ai-library" element={<AILibrary />} />

          <Route path="/focus-timer" element={<FocusTimer />} />
          <Route path="/focus" element={<FocusTimer />} />

          <Route path="/focus-analytics" element={<FocusAnalytics />} />
          <Route path="/academic-records" element={<AcademicRecords />} />
          <Route path="/risk-prediction" element={<RiskPrediction />} />
          <Route path="/risk-timeline" element={<RiskTimeline />} />
          <Route path="/study-garden" element={<StudyGarden />} />
          <Route path="/study-quests" element={<StudyQuests />} />

          <Route path="/flower-collection" element={<FlowerCollection />} />
          <Route path="/flowers" element={<FlowerCollection />} />

          <Route path="/weak-topic-radar" element={<WeakTopicRadar />} />
          <Route path="/weak-topics" element={<WeakTopicRadar />} />

          <Route path="/subject-health" element={<SubjectHealth />} />
          <Route path="/mood-checkin" element={<MoodCheckIn />} />
          <Route path="/burnout-warning" element={<BurnoutWarning />} />
          <Route path="/revision-reminders" element={<RevisionReminders />} />
          <Route path="/assessments" element={<Assessments />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
