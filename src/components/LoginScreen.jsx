import React from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

const FEATURES = [
  { emoji: '🏋️', text: 'Track workouts & meals' },
  { emoji: '📊', text: 'Monitor your progress' },
  { emoji: '✨', text: 'Build daily rituals' },
  { emoji: '🌸', text: 'Join the community' },
];

const FLOATERS = [
  { emoji: '🌸', style: { top: '10%', left: '8%' }, delay: 0 },
  { emoji: '💗', style: { top: '20%', right: '10%' }, delay: 0.4 },
  { emoji: '✨', style: { top: '60%', left: '5%' }, delay: 0.8 },
  { emoji: '🦋', style: { bottom: '20%', right: '8%' }, delay: 0.2 },
  { emoji: '🌷', style: { bottom: '10%', left: '12%' }, delay: 0.6 },
  { emoji: '🍑', style: { top: '40%', right: '5%' }, delay: 1 },
];

export default function LoginScreen() {
  return (
    <div className="min-h-screen bg-sniff-gradient flex items-center justify-center p-4 relative overflow-hidden">

      {/* Floating emojis */}
      {FLOATERS.map((f, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl select-none pointer-events-none"
          style={f.style}
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: f.delay }}
        >
          {f.emoji}
        </motion.div>
      ))}

      {/* Blurred blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full bg-secondary/40 blur-3xl pointer-events-none" />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-8 sm:p-10 w-full max-w-sm text-center"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mb-2"
        >
          <div className="font-display text-5xl text-primary">NymFit</div>
          <div className="text-xs tracking-[0.3em] uppercase text-muted-foreground mt-1">your glow-up companion</div>
        </motion.div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">✦</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-2 mb-8"
        >
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 + i * 0.07 }}
              className="bg-accent/50 rounded-2xl p-3 text-left"
            >
              <div className="text-lg mb-1">{f.emoji}</div>
              <div className="text-[11px] text-foreground/70 leading-snug">{f.text}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => base44.auth.redirectToLogin(window.location.href)}
          className="w-full bg-primary text-white py-3.5 rounded-full font-medium text-sm shadow-md hover:bg-primary/90 transition-colors"
        >
          sign in / create account ♡
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="text-[10px] text-muted-foreground mt-4 leading-relaxed"
        >
          your wellness journey starts here 🌸
        </motion.p>
      </motion.div>
    </div>
  );
}