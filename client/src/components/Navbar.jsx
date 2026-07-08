import { Link, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import Button from './Button';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/30 dark:bg-slate-950/40 backdrop-blur-md border-b border-white/20 dark:border-slate-700/30 transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-base sm:text-lg font-extrabold tracking-tight">
          <Sparkles className="h-5 w-5 text-white dark:text-cyan-400" />
          <span className="text-white">
            StudyPulse AI 🌱
          </span>
        </Link>

        <div className="flex items-center gap-5">
          <div className="hidden items-center gap-2 text-xs sm:text-sm font-bold text-white dark:text-slate-300 sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`transition px-3 py-1.5 rounded-full hover:bg-white/20 dark:hover:text-cyan-300 ${
                  location.pathname === link.to
                    ? 'bg-white/20 dark:text-cyan-300 dark:bg-cyan-400/10'
                    : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              to="/login"
              className={`text-xs sm:text-sm font-bold transition px-3 py-1.5 rounded-full ${
                location.pathname === '/login'
                  ? 'text-white bg-white/20 dark:text-cyan-300 dark:bg-cyan-400/10'
                  : 'text-white dark:text-slate-300 hover:bg-white/20 dark:hover:text-white'
              }`}
            >
              Log in
            </Link>
            <Link to="/register">
              <Button size="sm" variant="clay">
                Sign up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
