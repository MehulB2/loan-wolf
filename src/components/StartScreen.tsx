import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useGameStore } from '../hooks/useGameStore';

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

export default function StartScreen() {
  const startGame = useGameStore(s => s.startGame);

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(#00D4FF 1px, transparent 1px), linear-gradient(90deg, #00D4FF 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <motion.div
        className="relative z-10 max-w-2xl w-full text-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Badge */}
        <motion.div variants={item} className="mb-6">
          <span className="inline-block px-4 py-1.5 rounded-full border border-[#00D4FF]/30 bg-[#00D4FF]/10 text-[#00D4FF] text-xs font-mono tracking-widest uppercase">
            Fintech Arcade
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={item}
          className="text-6xl md:text-8xl font-mono font-bold mb-4 tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #00D4FF 0%, #00FF9D 50%, #00D4FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          MARKET<br />MAYHEM
        </motion.h1>

        {/* Tagline */}
        <motion.p variants={item} className="text-slate-400 text-lg mb-10 font-mono">
          Run a lending firm. Approve the right borrowers. Don't go bankrupt.
        </motion.p>

        {/* Mechanics */}
        <motion.div
          variants={item}
          className="grid grid-cols-3 gap-4 mb-10"
        >
          {[
            { dir: '→', label: 'Swipe Right', desc: 'Approve loan', color: '#00FF9D' },
            { dir: '←', label: 'Swipe Left', desc: 'Reject borrower', color: '#FF3366' },
            { dir: '↑', label: 'Swipe Up', desc: 'Premium rate +2.5%', color: '#00D4FF' },
          ].map(({ dir, label, desc, color }) => (
            <div
              key={label}
              className="rounded-xl border border-[#1E2435] bg-[#141824] p-4"
            >
              <div className="text-3xl font-mono font-bold mb-1" style={{ color }}>{dir}</div>
              <div className="text-sm font-mono font-semibold text-slate-200">{label}</div>
              <div className="text-xs text-slate-500 mt-1">{desc}</div>
            </div>
          ))}
        </motion.div>

        {/* Start Button */}
        <motion.button
          variants={item}
          onClick={startGame}
          className="px-12 py-4 rounded-xl font-mono font-bold text-lg tracking-widest uppercase cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #00D4FF, #00FF9D)',
            color: '#0A0E1A',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
        >
          START GAME
        </motion.button>

        {/* Footer */}
        <motion.p variants={item} className="mt-8 text-slate-600 text-xs font-mono">
          30 rounds · Real credit risk mechanics · Firebase leaderboard
        </motion.p>
      </motion.div>
    </div>
  );
}
