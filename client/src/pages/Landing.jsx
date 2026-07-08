import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Brain, Timer, Trophy, TrendingUp, Sparkle,
  CheckCircle2, FileText, Layers, AlertTriangle
} from 'lucide-react';
import Badge from '../components/Badge';
import FloatingDecorations from '../components/FloatingDecorations';
import VideoHeroSection from '../components/ui/video-hero-section';

const solutionFeatures = [
  {
    title: 'Smart Notes',
    description: 'Upload lecture PDFs and get immediate auto-summarized study guides.',
    icon: FileText,
    color: 'from-purple-500/10 to-transparent'
  },
  {
    title: 'AI Quiz Generator',
    description: 'Generate adaptive quizzes and cards tailored to your curriculum in seconds.',
    icon: Brain,
    color: 'from-pink-500/10 to-transparent'
  },
  {
    title: 'Focus Sessions',
    description: 'Pomodoro-style sessions that track your study hours and alert on burnout risks.',
    icon: Timer,
    color: 'from-orange-500/10 to-transparent'
  },
  {
    title: 'Academic Risk Prediction',
    description: 'Advanced predictive analytics help identify grades at risk before exams occur.',
    icon: TrendingUp,
    color: 'from-red-500/10 to-transparent'
  }
];

const dilemmaCards = [
  {
    title: 'Too many formats to track',
    description: 'Notes, PDFs, quizzes, deadlines, and study sessions are scattered across different tools, making progress hard to manage.',
    icon: Layers,
    bgClass: 'bg-purple-100 dark:bg-purple-900/30',
    textClass: 'text-purple-600 dark:text-purple-400'
  },
  {
    title: 'No early warning systems',
    description: 'Students often realize they are falling behind only after marks drop, deadlines are missed, or exam pressure increases.',
    icon: AlertTriangle,
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    textClass: 'text-red-600 dark:text-red-400'
  },
  {
    title: 'No gamified incentives',
    description: 'Traditional learning tools do not motivate students daily or reward consistent study habits.',
    icon: Trophy,
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-600 dark:text-green-400'
  }
];

const journeySteps = [
  { step: '1', title: 'Upload or write notes', icon: '📝' },
  { step: '2', title: 'Generate summaries and quizzes', icon: '✨' },
  { step: '3', title: 'Track focus sessions', icon: '⏱️' },
  { step: '4', title: 'Monitor risk and progress', icon: '📈' },
  { step: '5', title: 'Grow your Study Garden', icon: '🌱' }
];

const Landing = () => {
  return (
    <div className="bg-transparent text-text-main overflow-x-hidden min-h-screen relative transition-colors duration-300">
      <FloatingDecorations />

      {/* ─── Hero Section ─── */}
      <VideoHeroSection />

      {/* ─── Dashboard Preview Section ─── */}
      <section className="px-4 py-20 lg:px-8 max-w-5xl mx-auto z-10 relative">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="relative rounded-[28px] bg-white/20 dark:bg-slate-950/40 backdrop-blur-md border border-white/30 dark:border-slate-700/30 p-2 shadow-2xl"
        >
          {/* Subtle gradient behind */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 rounded-[28px] pointer-events-none" />
          
          <div className="rounded-[20px] bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/50 dark:border-slate-700/50 shadow-inner p-4 sm:p-8 overflow-hidden relative z-10">
            {/* Window controls mimic */}
            <div className="flex items-center justify-between border-b border-lavender/10 dark:border-white/10 pb-4 mb-8">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
                <span className="ml-3 text-[11px] font-bold text-text-muted/70 uppercase tracking-widest font-mono hidden sm:inline-block">studypulse_dashboard.exe</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-3 py-1.5 rounded-full shadow-sm">
                <Sparkle className="h-3.5 w-3.5" /> AI Model Online
              </div>
            </div>

            {/* Simulated Grid layout */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="app-card p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Study Garden</span>
                  <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Trophy className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="text-xl font-extrabold text-text-main">Healthy Plant 🌱</div>
                <p className="text-sm text-text-muted mt-1 font-medium">145 Growth Points</p>
                <div className="w-full bg-lavender/20 dark:bg-slate-700 h-2.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-full w-[65%]" />
                </div>
              </div>

              <div className="app-card p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Focus Sessions</span>
                  <div className="p-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <Timer className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <div className="text-xl font-extrabold text-text-main">12 Sessions</div>
                <p className="text-sm text-text-muted mt-1 font-medium">+15% focus vs last week</p>
                <div className="flex gap-2 mt-4 justify-between items-end h-10">
                  {[20, 35, 10, 45, 25, 55, 30].map((v, i) => (
                    <div key={i} className="flex-1 bg-lavender/40 dark:bg-slate-600 rounded-full hover:bg-purple-400 transition-colors cursor-pointer" style={{ height: `${v}%` }} />
                  ))}
                </div>
              </div>

              <div className="app-card p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-text-muted font-bold uppercase tracking-wider">Risk Assessment</span>
                  <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="text-xl font-extrabold text-purple-600 dark:text-purple-400">Low Risk (8%)</div>
                <p className="text-sm text-text-muted mt-1 font-medium">Optimized performance indicators</p>
                <div className="flex items-center gap-2 mt-4 text-sm text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-900/20 py-2 px-3 rounded-lg">
                  <CheckCircle2 className="h-4 w-4" /> Keep studying Calculus!
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Student Dilemma Section ─── */}
      <section className="px-6 py-24 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge color="glass" className="mb-4 inline-flex">Why students struggle</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">The Student Dilemma</h2>
            <p className="text-white/80 mt-4 text-lg font-medium leading-relaxed">
              Traditional academic systems fail to address modern students' learning challenges.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dilemmaCards.map((p, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="app-card p-8 rounded-[24px] hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${p.bgClass} ${p.textClass}`}>
                  <p.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-text-main mb-3">{p.title}</h3>
                <p className="text-text-muted font-medium leading-relaxed">{p.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How StudyPulse Solves It Section ─── */}
      <section className="px-6 py-24 bg-transparent relative z-10 border-t border-purple-50 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge color="glass" className="mb-4 inline-flex">The Solution</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">How StudyPulse AI helps</h2>
            <p className="text-white/80 mt-4 text-lg font-medium leading-relaxed">
              A smart academic companion that connects notes, quizzes, focus sessions, risk prediction, and progress tracking in one place.
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {solutionFeatures.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative overflow-hidden app-card p-8 rounded-[24px] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-slate-800 flex items-center justify-center mb-6 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-text-main mb-3">{f.title}</h3>
                  <p className="text-sm text-text-muted font-medium leading-relaxed">{f.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Learning Journey Section ─── */}
      <section className="px-6 py-24 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Your study flow, simplified</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {journeySteps.map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 rounded-2xl app-soft-card shadow-md flex items-center justify-center text-2xl z-10 group-hover:scale-110 transition-transform duration-300">
                  {step.icon}
                </div>
                {i !== journeySteps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full h-[2px] bg-gradient-to-r from-purple-200 to-pink-200 dark:from-slate-700 dark:to-slate-600 -z-10" />
                )}
                <div className="mt-4 flex flex-col items-center">
                  <span className="text-xs font-bold text-pink-300 mb-1 tracking-widest uppercase drop-shadow-sm">Step {step.step}</span>
                  <p className="text-sm font-bold text-white drop-shadow-md">{step.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA Section ─── */}
      <section className="px-4 py-24 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-purple-600 to-pink-500 shadow-2xl">
            {/* Decorative glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/20 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2" />
            
            <div className="relative z-10 px-6 py-16 sm:py-20 text-center flex flex-col items-center">
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6 max-w-2xl">
                Ready to study smarter?
              </h2>
              <p className="text-white/90 font-medium text-lg max-w-xl mb-10 leading-relaxed">
                Start organizing your learning, tracking progress, and improving academic performance with StudyPulse AI.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <Link to="/register">
                  <button className="w-full sm:w-auto px-8 py-4 bg-white text-purple-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    Get Started Free
                  </button>
                </Link>
                <Link to="/login">
                  <button className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 backdrop-blur-md transition-all">
                    Go to Dashboard
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
