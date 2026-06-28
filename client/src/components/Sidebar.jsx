import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, FileText, Upload, BrainCircuit, HelpCircle,
  Layers, Timer, BarChart3, GraduationCap, AlertTriangle, Clock,
  Flower2, Swords, Album, Radar, HeartPulse, Smile, Flame,
  Bell, Sparkles, Library, LogOut, ClipboardList
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

const sections = [
  {
    title: 'Main',
    links: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/subjects', label: 'Subjects', icon: BookOpen },
    ],
  },
  {
    title: 'Study Tools',
    links: [
      { to: '/smart-notes', label: 'Smart Notes', icon: FileText },
      { to: '/upload-pdf', label: 'Upload PDF', icon: Upload },
      { to: '/ai-study-plan', label: 'AI Study Plan', icon: BrainCircuit },
      { to: '/quiz-generator', label: 'Quiz Generator', icon: HelpCircle },
      { to: '/flashcards', label: 'Flashcards', icon: Layers },
      { to: '/ai-library', label: 'My AI Library', icon: Library },
    ],
  },
  {
    title: 'Focus',
    links: [
      { to: '/focus-timer', label: 'Focus Timer', icon: Timer },
      { to: '/focus-analytics', label: 'Focus Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Academic',
    links: [
      { to: '/academic-records', label: 'Academic Records', icon: GraduationCap },
      { to: '/assessments', label: 'Assessments / Marks', icon: ClipboardList },
      { to: '/risk-prediction', label: 'Risk Prediction', icon: AlertTriangle },
      { to: '/risk-timeline', label: 'Risk Timeline', icon: Clock },
    ],
  },
  {
    title: 'Wellness',
    links: [
      { to: '/weak-topic-radar', label: 'Weak Topic Radar', icon: Radar },
      { to: '/subject-health', label: 'Subject Health', icon: HeartPulse },
      { to: '/mood-checkin', label: 'Mood Check-in', icon: Smile },
      { to: '/burnout-warning', label: 'Burnout Warning', icon: Flame },
      { to: '/revision-reminders', label: 'Revision Reminders', icon: Bell },
    ],
  },
  {
    title: 'Gamification',
    links: [
      { to: '/study-garden', label: 'Study Garden', icon: Flower2 },
      { to: '/study-quests', label: 'Study Quests', icon: Swords },
      { to: '/flower-collection', label: 'Flower Collection', icon: Album },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="
      fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col p-4
      border-r border-lavender/30 dark:border-white/10
      bg-[#f4ecff]/95 dark:bg-slate-950/75
      backdrop-blur-md transition-colors duration-300
      lg:flex
    ">
      {/* Logo + Theme Toggle row */}
      <div className="flex items-center justify-between h-12 px-3 mb-6 bg-white/60 dark:bg-white/8 border border-white/80 dark:border-white/12 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple dark:text-cyan-400" />
          <span className="font-extrabold text-sm tracking-tight text-text-main dark:text-white">
            StudyPulse AI 🌱
          </span>
        </div>
        <ThemeToggle size="sm" />
      </div>

      {/* Links */}
      <nav className="flex-1 overflow-y-auto space-y-4 pr-1">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-text-muted/65 dark:text-slate-500">
              {section.title}
            </p>
            {section.links.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={`
                    flex items-center gap-2.5 px-3.5 py-2 rounded-full text-xs font-bold transition-all duration-200
                    ${isActive
                      ? 'bg-purple text-white shadow-md dark:bg-cyan-500/20 dark:text-cyan-300 dark:border dark:border-cyan-400/30'
                      : 'text-text-muted hover:bg-lavender/15 hover:text-purple dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/8'
                    }
                  `}
                >
                  <link.icon className="h-4 w-4 flex-shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Profile */}
      <NavLink
        to="/profile"
        className={`
          flex items-center gap-3 px-3 py-2.5 mt-4 rounded-2xl border transition-all duration-200
          ${location.pathname === '/profile'
            ? 'bg-purple/15 border-purple/30 dark:bg-cyan-500/15 dark:border-cyan-400/25'
            : 'bg-white/40 border-lavender/10 hover:bg-white/70 dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10'
          }
        `}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple text-xs font-bold text-white shadow-sm flex-shrink-0">
          {user?.name?.charAt(0)?.toUpperCase() || 'S'}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-extrabold text-text-main dark:text-white">{user?.name || 'Student Buddy'}</p>
          <p className="truncate text-[9px] text-text-muted dark:text-slate-400">{user?.email || 'student@studypulse.ai'}</p>
        </div>
      </NavLink>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="mt-2 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-all font-semibold text-xs"
      >
        <LogOut className="h-4 w-4 flex-shrink-0" />
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
export { sections };
