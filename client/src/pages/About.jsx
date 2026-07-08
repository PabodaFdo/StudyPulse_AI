import { Sparkles, GraduationCap, Cpu, Trophy, ShieldAlert } from 'lucide-react';
import Badge from '../components/Badge';

const About = () => {
  return (
    <div className="bg-transparent min-h-screen text-white py-16 px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="text-center mb-16">
        <Badge color="glass" className="mb-4">
          <GraduationCap className="h-4 w-4" /> Academic Excellence
        </Badge>
        <h1 className="text-4xl font-extrabold text-white leading-tight">
          About StudyPulse AI 🌱
        </h1>
        <p className="mt-4 text-sm sm:text-base text-white/80 max-w-2xl mx-auto font-semibold">
          We build modern, AI-powered productivity suites designed to support students and prevent academic burnout through gamification and machine learning.
        </p>
      </div>

      <div className="space-y-12">
        <section className="liquid-card p-8">
          <div className="liquid-card-content">
            <h2 className="text-xl font-extrabold text-white mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple" /> Our Mission
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-semibold">
              StudyPulse AI was founded with a singular focus: to reduce the friction of studying by uniting fractured study tools (notes, flashcards, focus track logs, calendars) in a single platform, while utilizing machine learning models to detect stress indicators early.
            </p>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="liquid-card liquid-card-hover p-6">
            <div className="liquid-card-content">
              <h3 className="text-lg font-extrabold text-white mb-2 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-purple" /> Study Garden
              </h3>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-medium">
                We leverage positive reinforcement loop models. By completing focus intervals and scoring high on curriculum quizzes, students nurture digital plants and collect unique botanical items.
              </p>
            </div>
          </div>

          <div className="liquid-card liquid-card-hover p-6">
            <div className="liquid-card-content">
              <h3 className="text-lg font-extrabold text-white mb-2 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-purple" /> Academic Risk Warnings
              </h3>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-medium">
                By monitoring weekly study intervals and mood check-ins, our ML micro-service identifies students showing early warning indicators of stress or course failure, facilitating early action.
              </p>
            </div>
          </div>
        </section>

        <section className="liquid-card p-8 text-center">
          <div className="liquid-card-content">
            <h2 className="text-lg font-extrabold text-white mb-2">Our Technology</h2>
            <p className="text-xs text-white/80 max-w-xl mx-auto mb-6 font-semibold">
              StudyPulse AI leverages modern framework setups to offer latency-free predictions and real-time active study sessions.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['React 19', 'Tailwind CSS', 'Node.js/Express', 'Python FastAPI'].map((t, idx) => (
                <div key={idx} className="bg-white/50 border border-lavender/30 rounded-full py-2.5 px-4 text-xs font-bold text-white shadow-sm">
                  {t}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
