import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import FloatingDecorations from '../components/FloatingDecorations';
import AuthMascotOrbit from '../components/AuthMascotOrbit';
import studyGirlWelcome from '../assets/characters/study-girl-welcome.png';

import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back, Student! 🌱');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen liquid-page-bg overflow-hidden relative">
      <FloatingDecorations />

      <main className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl grid-cols-1 items-center gap-10 px-6 py-10 lg:grid-cols-2 z-10">
        <AuthMascotOrbit
          image={studyGirlWelcome}
          title="Welcome Back"
          subtitle="Your Study Garden is waiting to grow."
          icons={["📚", "🧠", "⏱️", "🌱", "✨"]}
        />

        <div className="w-full max-w-md mx-auto liquid-card p-8 md:p-10 relative text-center border-2 border-white/40">
          <div className="liquid-card-content space-y-6">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-text-main">Continue your learning journey</h2>
            </div>

            <form className="space-y-4 text-left" onSubmit={handleSubmit}>
              <Input
                id="email-address"
                name="email"
                type="email"
                label="Email Address"
                placeholder="student@studypulse.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={Mail}
                required
              />

              <Input
                id="password"
                name="password"
                type="password"
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                required
              />

              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <label className="flex items-center gap-2 text-text-muted cursor-pointer font-bold">
                  <input type="checkbox" className="rounded border-lavender/40 text-purple focus:ring-purple" />
                  Remember me
                </label>
                <a href="#" className="font-bold text-purple hover:underline">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full justify-center mt-4"
                disabled={isLoading}
                variant="clay"
              >
                {isLoading ? 'Signing in...' : 'Sign in'} <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-lavender/30" />
              </div>
              <span className="relative bg-white/80 px-3 text-[10px] uppercase font-bold text-text-muted/60 rounded-full">
                or connect with
              </span>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => toast.success('Google OAuth selected')}
                className="flex items-center justify-center gap-2 rounded-full border-2 border-lavender/20 bg-white/70 hover:bg-lavender/10 px-4 py-2 text-xs font-bold text-text-main cursor-pointer transition shadow-sm"
              >
                🔍 Google
              </button>
              <button
                type="button"
                onClick={() => toast.success('Github OAuth selected')}
                className="flex items-center justify-center gap-2 rounded-full border-2 border-lavender/20 bg-white/70 hover:bg-lavender/10 px-4 py-2 text-xs font-bold text-text-main cursor-pointer transition shadow-sm"
              >
                💻 GitHub
              </button>
            </div>

            <p className="text-center text-xs sm:text-sm text-text-muted font-medium">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-purple hover:underline">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
