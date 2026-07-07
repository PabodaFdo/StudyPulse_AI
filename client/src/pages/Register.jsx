import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import FloatingDecorations from '../components/FloatingDecorations';
import AuthMascotOrbit from '../components/AuthMascotOrbit';
import studyGirlReading from '../assets/characters/study-girl-reading.png';

import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setIsLoading(true);
    try {
      await register(name, email, password);
      toast.success('Registration successful! Welcome aboard! 🌱');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent overflow-hidden relative">
      <FloatingDecorations />

      <main className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-7xl grid-cols-1 items-center gap-10 px-6 py-10 lg:grid-cols-2 z-10">
        <AuthMascotOrbit
          image={studyGirlReading}
          title="Start Your Study Journey"
          subtitle="Create your account and grow your Study Garden."
          icons={["🌱", "📝", "⭐", "📘", "✨"]}
        />

        <div className="w-full max-w-md mx-auto rounded-[28px] bg-white/70 backdrop-blur-xl border border-white/60 shadow-xl dark:bg-slate-950/70 dark:border-slate-700/60 p-8 md:p-10 relative text-center">
          <div className="liquid-card-content space-y-6">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-text-main">Create your study account</h2>
            </div>

            <form className="space-y-4 text-left" onSubmit={handleSubmit}>
              <Input
                id="full-name"
                name="name"
                type="text"
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={User}
                required
              />

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

              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                label="Confirm Password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={Lock}
                required
              />

              <Button
                type="submit"
                className="w-full justify-center mt-4"
                disabled={isLoading}
                variant="clay"
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'} <ArrowRight className="h-4 w-4" />
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
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-purple hover:underline">
                Log in instead
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
