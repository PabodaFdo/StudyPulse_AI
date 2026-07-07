import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sparkles, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { sections } from './Sidebar';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="lg:hidden">
      {/* Top bar */}
      <div className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-lavender/30 dark:border-white/10 bg-[#f4ecff]/95 dark:bg-slate-950/75 px-4 backdrop-blur-md transition-colors duration-300">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple dark:text-cyan-400" />
          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
            StudyPulse AI 🌱
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle size="sm" />
          <button
            onClick={() => setOpen(!open)}
            className="rounded-xl p-1.5 border border-lavender/30 dark:border-white/15 bg-white/70 dark:bg-white/8 text-text-main dark:text-white transition hover:bg-white dark:hover:bg-white/14"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-[#241b4b]/20 dark:bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="fixed right-0 top-14 bottom-0 z-50 w-72 overflow-y-auto border-l border-lavender/30 dark:border-white/10 bg-[#f8f3ff] dark:bg-slate-950/95 px-4 py-6 transition-colors duration-300"
            >
              {sections.map((section) => (
                <div key={section.title} className="mb-4">
                  <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {section.title}
                  </p>
                  {section.links.map((link) => {
                    const isActive = location.pathname === link.to;
                    return (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        onClick={() => setOpen(false)}
                        className={`flex items-center gap-3 rounded-full px-4 py-2.5 text-xs font-bold transition
                          ${isActive
                            ? 'bg-purple text-white shadow-md dark:bg-cyan-500/20 dark:text-cyan-300'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-purple dark:text-slate-400 dark:hover:bg-white/8 dark:hover:text-white'
                          }`}
                      >
                        <link.icon className="h-4 w-4 flex-shrink-0" />
                        <span>{link.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              ))}

              <NavLink
                to="/profile"
                onClick={() => setOpen(false)}
                className={`mt-2 flex items-center gap-3 rounded-full px-4 py-2.5 text-xs font-bold transition
                  ${location.pathname === '/profile'
                    ? 'bg-purple text-white dark:bg-cyan-500/20 dark:text-cyan-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/8 dark:hover:text-white'
                  }`}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple text-white text-[10px] font-bold flex-shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase() || 'S'}
                </div>
                <span className="truncate">{user?.name || 'Profile'}</span>
              </NavLink>

              <button
                onClick={handleLogout}
                className="mt-2 flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-xs font-bold transition text-slate-700 dark:text-slate-200 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span>Logout</span>
              </button>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileNav;
