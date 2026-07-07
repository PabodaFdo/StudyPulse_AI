import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import studyGirlReading from '../../assets/characters/study-girl-reading.png';

export default function VideoHeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-72px)] w-full overflow-hidden bg-black flex items-center justify-center px-4 py-10">
      <video
        autoPlay
        loop
        muted
        playsInline
        poster="/images/hero-poster.jpg"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/videos/hero-bg.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 grid w-full max-w-[1280px] min-h-[620px] md:grid-cols-2">
            
        {/* Left Side - Blur only here */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex h-full flex-col justify-center items-center lg:items-start text-center lg:text-left bg-black/35 px-10 py-16 backdrop-blur-xl md:border-r md:border-white/20 lg:px-16"
        >
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-md shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-pink-300" /> Introducing StudyPulse AI 2.0
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white">
            Study smarter,<br/>
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
            {/* Decorative soft glow behind the image (without blurring the background) */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
            
            <img
              src={studyGirlReading}
              alt="StudyPulse AI students"
              className="relative z-10 w-full drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500"
            />
            
            {/* Floating badges */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="absolute top-1/4 -left-10 z-20 rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-md shadow-2xl flex items-center gap-3"
            >
              <div className="text-2xl">🧠</div>
              <div className="text-white text-xs font-bold leading-tight">AI Generated<br/><span className="text-white/70 font-normal">Quizzes</span></div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="absolute bottom-1/4 -right-10 z-20 rounded-2xl border border-white/20 bg-white/10 p-3.5 backdrop-blur-md shadow-2xl flex items-center gap-3"
            >
              <div className="text-2xl">🌱</div>
              <div className="text-white text-xs font-bold leading-tight">Study Garden<br/><span className="text-white/70 font-normal">Level 12</span></div>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
