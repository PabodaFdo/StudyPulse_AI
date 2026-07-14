
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import studyGirlReading from '../../assets/characters/study-girl-reading.png';

const innerFeatures = [
  { icon: '🧠', title: 'Generate Quizzes' },
  { icon: '🗂️', title: 'Generate Flashcards' },
  { icon: '📝', title: 'Smart Auto-Notes' },
];

const outerFeatures = [
  { icon: '⏱️', title: 'Track Focus' },
  { icon: '📈', title: 'Predict Risk' },
  { icon: '🌱', title: 'Grow Garden' },
];

export default function VideoHeroSection() {
  const { theme } = useTheme();
  const videoSrc = theme === 'dark' ? '/videos/hero-dark.mp4' : '/videos/hero-bg.mp4';

  return (
    <section className="relative min-h-[calc(100vh-72px)] w-full overflow-hidden bg-black flex items-center justify-center px-4 py-10">
      <video
        key={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 grid w-full max-w-[1280px] min-h-[620px] md:grid-cols-2">

        {/* Left Side - Blur only here */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex h-full flex-col justify-center items-center lg:items-start text-center lg:text-left px-10 py-16 lg:px-16"
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-md shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-pink-300" /> Introducing StudyPulse AI 2.0
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white">
            Study smarter,<br />
            <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent drop-shadow-sm">
              grow better
            </span>
          </h1>
          <p className="mt-6 max-w-lg text-sm sm:text-base text-white/80 leading-relaxed font-medium">
            StudyPulse AI helps students organize notes, generate quizzes, track focus sessions, predict academic risk, and grow a virtual Study Garden through consistent learning.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-start">
            <Link to="/register">
              <button className="flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-gray-900 hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link to="/login">
              <button className="flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white hover:bg-white/20 transition-all backdrop-blur-md shadow-lg">
                View Dashboard
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Right Side - Visuals (No Blur) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative hidden md:flex h-full items-center justify-center bg-transparent px-8 py-10"
        >
          <div className="relative w-full max-w-[400px]">
            {/* Bright glow behind the image to highlight the characters */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/20 dark:bg-blue-500/10 rounded-full filter blur-[80px] opacity-100 z-0 animate-pulse"></div>
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-purple-400/50 dark:bg-blue-500/50 rounded-full mix-blend-screen filter blur-[60px] opacity-80 animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-pink-400/50 dark:bg-blue-700/50 rounded-full mix-blend-screen filter blur-[60px] opacity-80 animate-pulse" style={{ animationDelay: '1s' }}></div>

            <img
              src={studyGirlReading}
              alt="StudyPulse AI students"
              className="relative z-10 w-full drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-[1.02] transition-transform duration-500"
            />

            {/* Inner Planetary Orbit (Behind children) */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 w-[340px] h-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-pink-400/60 dark:border-blue-400/80 border-dashed z-0 pointer-events-none shadow-[0_0_20px_rgba(236,72,153,0.2)] dark:shadow-[0_0_30px_rgba(59,130,246,0.6)]"
            >
              {innerFeatures.map((feature, index) => {
                const angle = (index / innerFeatures.length) * 360;
                const x = 50 + 50 * Math.cos((angle * Math.PI) / 180);
                const y = 50 + 50 * Math.sin((angle * Math.PI) / 180);
                
                return (
                  <div
                    key={index}
                    className="absolute"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                      className="rounded-xl border border-pink-300/50 dark:border-blue-400/50 bg-pink-500/20 dark:bg-blue-900/50 px-3 py-2 backdrop-blur-md shadow-[0_0_15px_rgba(236,72,153,0.4)] dark:shadow-[0_0_15px_rgba(59,130,246,0.4)] flex items-center gap-2 pointer-events-auto hover:bg-pink-500/30 dark:hover:bg-blue-800/60 transition-colors cursor-default"
                    >
                      <div className="text-lg">{feature.icon}</div>
                      <div className="text-white text-[11px] font-bold leading-tight whitespace-nowrap">
                        {feature.title}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>

            {/* Outer Planetary Orbit (In front of children) */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 w-[520px] h-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-purple-400/60 dark:border-blue-400/80 border-dashed z-20 pointer-events-none shadow-[0_0_20px_rgba(168,85,247,0.2)] dark:shadow-[0_0_30px_rgba(59,130,246,0.6)]"
            >
              {outerFeatures.map((feature, index) => {
                const angle = (index / outerFeatures.length) * 360;
                const x = 50 + 50 * Math.cos((angle * Math.PI) / 180);
                const y = 50 + 50 * Math.sin((angle * Math.PI) / 180);
                
                return (
                  <div
                    key={index}
                    className="absolute"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                      className="rounded-xl border border-purple-300/50 dark:border-blue-400/50 bg-purple-500/20 dark:bg-blue-900/50 px-3 py-2 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.4)] dark:shadow-[0_0_15px_rgba(59,130,246,0.4)] flex items-center gap-2 pointer-events-auto hover:bg-purple-500/30 dark:hover:bg-blue-800/60 transition-colors cursor-default"
                    >
                      <div className="text-lg">{feature.icon}</div>
                      <div className="text-white text-[11px] font-bold leading-tight whitespace-nowrap">
                        {feature.title}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </motion.div>

      </div>

      {/* Vintage Color Mix Transition */}
      <div className="absolute bottom-0 w-full h-48 bg-gradient-to-t from-[#c2410c]/50 via-[#ea580c]/20 to-transparent mix-blend-color pointer-events-none z-10" />
      <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none z-10" />
      
    </section>
  );
}
