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
    <nav className="sticky top-0 z-50 border-b border-white/50 dark:border-slate-700/50 bg-white/55 dark:bg-slate-950/55 backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-base sm:text-lg font-extrabold tracking-tight">
          <Sparkles className="h-5 w-5 text-purple dark:text-cyan-400" />
          <span className="text-text-main dark:text-white">
            StudyPulse AI 🌱
          </span>
        </Link>

        <div className="flex items-center gap-5">
          <div className="hidden items-center gap-5 text-xs sm:text-sm font-bold text-text-muted dark:text-slate-300 sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`transition hover:text-purple dark:hover:text-cyan-300 ${
                  location.pathname === link.to
                    ? 'text-purple dark:text-cyan-300'
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
              className="text-xs sm:text-sm font-bold text-text-muted dark:text-slate-300 hover:text-purple dark:hover:text-white px-3 py-2 transition"
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
