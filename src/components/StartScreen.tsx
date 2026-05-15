import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useGameStore } from '../hooks/useGameStore';
import { getLeaderboard, type LeaderboardEntry } from '../utils/firebase';
import Leaderboard from './Leaderboard';

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
  const openLeaderboard = useGameStore(s => s.openLeaderboard);
  const [selectedMode, setSelectedMode] = useState<10 | 20 | 30>(20);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!showLeaderboard || entries.length > 0) return;
    setLoading(true);
    getLeaderboard().then(data => {
      setEntries(data);
      setLoading(false);
    });
  }, [showLeaderboard, entries.length]);

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
            Lending Arcade
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
          LOAN<br />WOLF
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

        {/* Mode selector */}
        <motion.div variants={item} className="flex gap-3 justify-center mb-6">
          {([
            { mode: 10 as const, label: 'Sprint', rounds: '10 rounds' },
            { mode: 20 as const, label: 'Standard', rounds: '20 rounds' },
            { mode: 30 as const, label: 'Marathon', rounds: '30 rounds' },
          ]).map(({ mode, label, rounds }) => {
            const active = selectedMode === mode;
            return (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className="flex-1 py-3 rounded-xl font-mono text-sm font-bold tracking-wide cursor-pointer transition-all border"
                style={{
                  borderColor: active ? '#00D4FF' : '#1E2435',
                  background: active ? 'rgba(0,212,255,0.1)' : '#141824',
                  color: active ? '#00D4FF' : '#64748b',
                }}
              >
                <div>{label}</div>
                <div className="text-xs font-normal opacity-70 mt-0.5">{rounds}</div>
              </button>
            );
          })}
        </motion.div>

        {/* Start Button */}
        <motion.button
          variants={item}
          onClick={() => startGame(selectedMode)}
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
        <motion.p variants={item} className="mt-6 text-slate-600 text-xs font-mono">
          30 rounds · Real credit risk mechanics · Firebase leaderboard
        </motion.p>

        {/* Made by */}
        <motion.p variants={item} className="mt-1 text-slate-700 text-xs font-mono">
          made by <span className="text-slate-500">Mehul Bisht</span>
        </motion.p>

        {/* Leaderboard Button */}
        <motion.div variants={item} className="mt-10">
          <button
            onClick={() => setShowLeaderboard(s => !s)}
            className="px-8 py-2.5 rounded-xl font-mono font-bold text-sm tracking-widest uppercase cursor-pointer border border-[#00D4FF]/30 bg-[#00D4FF]/10 text-[#00D4FF] hover:bg-[#00D4FF]/20 transition-colors"
          >
            {showLeaderboard ? 'HIDE LEADERBOARD' : '🏆 LEADERBOARD'}
          </button>
        </motion.div>

        {/* Full leaderboard link */}
        <motion.div variants={item} className="mt-3">
          <button
            onClick={openLeaderboard}
            className="text-xs font-mono text-slate-500 hover:text-[#00D4FF] transition-colors tracking-widest uppercase cursor-pointer"
          >
            VIEW FULL LEADERBOARD →
          </button>
        </motion.div>

        {/* Leaderboard Panel */}
        <AnimatePresence>
          {showLeaderboard && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl border border-[#1E2435] bg-[#141824]/80 backdrop-blur p-6 text-left">
                <div className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-4 text-center">
                  Global Top 10
                </div>
                {loading ? (
                  <div className="text-center py-6 text-slate-600 font-mono text-sm animate-pulse">
                    Loading...
                  </div>
                ) : (
                  <Leaderboard entries={entries} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
