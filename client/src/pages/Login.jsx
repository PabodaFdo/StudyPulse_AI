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
    <div className="min-h-screen bg-transparent overflow-hidden relative">
      <FloatingDecorations />

      <main className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl grid-cols-1 items-center gap-10 px-6 py-10 lg:grid-cols-2 z-10">
        <AuthMascotOrbit
          image={studyGirlWelcome}
          title="Welcome Back"
          subtitle="Your Study Garden is waiting to grow."
          icons={["📚", "🧠", "⏱️", "🌱", "✨"]}
        />

        <div className="w-full max-w-md mx-auto rounded-[28px] bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl dark:bg-slate-950/70 dark:border-slate-700/60 p-8 md:p-10 relative text-center">
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
