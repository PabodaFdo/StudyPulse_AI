import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, FileText, Upload, BrainCircuit, HelpCircle,
  Layers, Timer, BarChart3, GraduationCap, AlertTriangle, Clock,
  Flower2, Swords, Album, Radar, HeartPulse, Smile, Flame,
  Bell, Sparkles, Library, LogOut, ClipboardList, ChevronLeft, ChevronRight
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
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('studypulse-sidebar-collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('studypulse-sidebar-collapsed', JSON.stringify(newState));
    window.dispatchEvent(new CustomEvent('sidebar-collapse-change', { detail: { collapsed: newState } }));
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className={`
      fixed left-3 top-3 z-40 hidden h-[calc(100vh-24px)] flex-col p-4
      rounded-[28px] bg-white/58 backdrop-blur-2xl border border-white/55 shadow-xl shadow-slate-300/20 dark:bg-slate-950/58 dark:border-slate-600/45 dark:shadow-none
      transition-all duration-300 ease-in-out
      lg:flex
      ${isCollapsed ? 'w-[84px]' : 'w-[280px]'}
    `}>
      {/* Logo + Theme Toggle row */}
      <div className={`shrink-0 flex items-center mb-6 bg-white/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 rounded-2xl shadow-sm transition-all duration-300 ease-in-out ${isCollapsed ? 'justify-center flex-col h-auto py-3 px-0 gap-3' : 'justify-between h-12 px-4'}`}>
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple dark:text-cyan-400" />
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                StudyPulse AI 🌱
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle size="sm" />
              <button
                onClick={toggleCollapse}
                aria-label="Collapse sidebar"
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5 text-purple dark:text-cyan-400 shrink-0" />
            <ThemeToggle size="sm" />
            <button
              onClick={toggleCollapse}
              aria-label="Expand sidebar"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Links */}
      <nav className={`flex-1 overflow-y-auto space-y-5 ${isCollapsed ? 'pr-0' : 'pr-2'} [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full`}>
        {sections.map((section) => (
          <div key={section.title} className="space-y-1.5">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 whitespace-nowrap">
                {section.title}
              </p>
            )}
            {section.links.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  title={isCollapsed ? link.label : undefined}
                  className={`
                    group flex items-center transition-all duration-200 font-semibold
                    ${isCollapsed ? 'justify-center w-11 h-11 mx-auto rounded-2xl' : 'gap-3 px-4 py-3 w-full rounded-2xl'}
                    ${isActive
                      ? isCollapsed
                        ? 'bg-cyan-100/75 border border-cyan-300/70 text-cyan-700 shadow-md shadow-cyan-200/40 dark:bg-cyan-950/40 dark:border-cyan-500/40 dark:text-cyan-300'
                        : 'bg-cyan-100/70 border border-cyan-300/70 text-cyan-800 shadow-sm shadow-cyan-200/40 dark:bg-cyan-950/40 dark:border-cyan-500/40 dark:text-cyan-300'
                      : isCollapsed
                        ? 'text-slate-600 hover:text-cyan-700 hover:bg-white/45 border border-transparent dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-cyan-300'
                        : 'text-slate-700 hover:text-cyan-700 hover:bg-white/40 border border-transparent dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-cyan-300'
                    }
                  `}
                >
                  <link.icon className={`h-5 w-5 flex-shrink-0 transition-colors ${isActive ? 'text-cyan-700 dark:text-cyan-300' : 'text-slate-500 group-hover:text-cyan-600 dark:text-slate-400 dark:group-hover:text-cyan-300'}`} />
                  {!isCollapsed && <span className="truncate text-[13px]">{link.label}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={`shrink-0 mt-4 space-y-2 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
        {/* Profile */}
        <NavLink
          to="/profile"
          title={isCollapsed ? (user?.name || 'Demo Student') : undefined}
          className={`flex items-center transition-all duration-200 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 hover:bg-slate-100/80 dark:hover:bg-white/10
            ${isCollapsed ? 'p-2 justify-center w-11 h-11' : 'gap-3 px-3 py-3'}
          `}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 text-xs font-bold text-white shadow-sm flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'D'}
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-800 dark:text-white">{user?.name || 'Demo Student'}</p>
              <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">{user?.email || 'demo@studypulse.ai'}</p>
            </div>
          )}
        </NavLink>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : undefined}
          className={`group flex items-center transition-all duration-200 rounded-xl text-slate-600 hover:text-red-500 hover:bg-white/40 dark:text-slate-300 dark:hover:text-red-400 dark:hover:bg-white/10
            ${isCollapsed ? 'justify-center w-11 h-11 p-2' : 'gap-3 px-4 py-3 w-full font-semibold text-xs'}
          `}
        >
          <LogOut className="h-4 w-4 flex-shrink-0 transition-colors group-hover:text-red-500 dark:group-hover:text-red-400" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
export { sections };
