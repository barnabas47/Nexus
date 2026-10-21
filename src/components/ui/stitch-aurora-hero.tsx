'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowUp, Compass, SlidersHorizontal } from 'lucide-react';

interface StitchAuroraHeroProps {
  badgeText?: string;
  titleLine1?: string;
  titleLine2?: string;
  subtitle?: string;
  inputPlaceholder?: string;
  suggestionPills?: string[];
  onSubmit?: (val: string) => void;
}

export const StitchAuroraHero: React.FC<StitchAuroraHeroProps> = ({
  badgeText = 'Stitch BETA',
  titleLine1 = 'Design at the',
  titleLine2 = 'speed of AI',
  subtitle = 'Transform ideas into UI designs for mobile and web applications',
  inputPlaceholder = 'Milyen natív alkalmazást tervezzünk?',
  suggestionPills = [
    'AI-powered sports tracker for Fire TV',
    'Self-hosted MCP Agent dashboard',
    'Real-time ambient health monitor with Bee',
  ],
  onSubmit,
}) => {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="relative min-h-screen w-full bg-[#050508] text-white flex flex-col items-center justify-center px-4 overflow-hidden selection:bg-cyan-500 selection:text-black">
      {/* 1. Subtle Dot Matrix Overlay */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-25"
        style={{
          backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* 2. Living Aurora Glowing Mesh Gradient (21st.dev / Stitch aesthetic) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* Deep Violet Wave */}
        <motion.div
          animate={{
            x: ['-20%', '15%', '-20%'],
            y: ['0%', '15%', '0%'],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-32 left-1/2 h-[550px] w-[900px] -translate-x-1/2 rounded-[100%] bg-gradient-to-tr from-purple-700/40 via-indigo-600/30 to-transparent blur-[140px]"
        />

        {/* Electric Cyan / Azure Glow */}
        <motion.div
          animate={{
            x: ['20%', '-25%', '20%'],
            y: ['10%', '-15%', '10%'],
            scale: [1.1, 0.9, 1.1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-20 left-1/4 h-[420px] w-[650px] rounded-[100%] bg-gradient-to-r from-cyan-500/35 via-blue-600/30 to-transparent blur-[120px]"
        />

        {/* Magenta Accent Pulse */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.45, 0.2],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-10 right-1/4 h-[380px] w-[550px] rounded-[100%] bg-gradient-to-l from-fuchsia-600/35 to-pink-500/20 blur-[130px]"
        />
      </div>

      {/* 3. Top Floating Header / Badge */}
      <header className="absolute top-8 left-8 right-8 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg tracking-tight text-white">Stitch</span>
          <span className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[10px] uppercase tracking-wider text-neutral-300 backdrop-blur-md">
            {badgeText}
          </span>
        </div>
        <button className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-black transition-all duration-200 hover:bg-neutral-200 hover:shadow-lg hover:shadow-white/10 active:scale-95">
          Try now
        </button>
      </header>

      {/* 4. Main Hero Typography (Ultra-minimal, impactful) */}
      <main className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center mt-12">
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-7xl md:text-8xl font-medium tracking-tight text-white leading-[1.05]"
        >
          {titleLine1} <br />
          <span className="bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent">
            {titleLine2}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-xl text-base sm:text-lg text-neutral-400 font-normal tracking-normal"
        >
          {subtitle}
        </motion.p>

        {/* 5. Translucent Floating Glass Command / Prompt Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-10 w-full max-w-2xl rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.6)] transition-all duration-300 focus-within:border-white/25 focus-within:shadow-[0_20px_50px_rgba(112,0,255,0.15)]"
        >
          <textarea
            rows={2}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={inputPlaceholder}
            className="w-full resize-none bg-transparent p-2 text-base text-white placeholder:text-neutral-500 focus:outline-none"
          />

          {/* Bottom Card Controls & Pill Badges */}
          <div className="mt-2 flex items-center justify-between pt-2 border-t border-white/[0.06]">
            <div className="flex items-center gap-1.5">
              <button className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-neutral-200 transition-colors hover:bg-white/20">
                <Compass className="h-3.5 w-3.5 text-neutral-400" />
                Alkalmazás
              </button>
              <button className="flex items-center gap-1.5 rounded-full bg-transparent px-3 py-1 text-xs text-neutral-400 transition-colors hover:bg-white/10 hover:text-white">
                Web
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button className="rounded-full p-2 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors">
                <SlidersHorizontal className="h-4 w-4" />
              </button>
              <button
                onClick={() => onSubmit && onSubmit(inputValue)}
                disabled={!inputValue.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition-all hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-white"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* 6. Quick Suggestion Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-2xl"
        >
          {suggestionPills.map((pill, idx) => (
            <button
              key={idx}
              onClick={() => setInputValue(pill)}
              className="group flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1.5 text-xs text-neutral-400 backdrop-blur-md transition-all duration-200 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
            >
              <Sparkles className="h-3 w-3 text-cyan-400/70 group-hover:text-cyan-300 transition-colors" />
              <span>{pill}</span>
            </button>
          ))}
        </motion.div>
      </main>
    </div>
  );
};
