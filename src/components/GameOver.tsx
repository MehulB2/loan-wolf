import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../hooks/useGameStore';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { submitScore, getLeaderboard, type LeaderboardEntry } from '../utils/firebase';
import Leaderboard from './Leaderboard';

export default function GameOver() {
  const state = useGameStore(s => s);
  const resetGame = useGameStore(s => s.resetGame);

  const [playerName, setPlayerName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const isWin = state.result === 'win';

  const totalLoans = state.loanHistory.length;
  const defaultedLoans = state.loanHistory.filter(l => l.status === 'defaulted').length;
  const defaultRate = totalLoans > 0 ? defaultedLoans / totalLoans : 0;

  async function handleSubmit() {
    if (!playerName.trim()) return;
    setSubmitting(true);
    try {
      await submitScore(playerName.trim(), state.score, state.round, defaultRate);
      const entries = await getLeaderboard();
      setLeaderboard(entries);
      setSubmitted(true);
      setShowLeaderboard(true);
    } catch {
      // Firebase not configured — still show play again
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  const themeColor = isWin ? '#00FF9D' : '#FF3366';
  const themeBg = isWin ? 'rgba(0,255,157,0.05)' : 'rgba(255,51,102,0.05)';
  const themeBorder = isWin ? 'rgba(0,255,157,0.2)' : 'rgba(255,51,102,0.2)';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#0A0E1A] flex items-center justify-center px-4 py-8"
    >
      {/* Background */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, ${themeColor} 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 max-w-2xl w-full">
        <motion.div
          initial={{ scale: 0.8, y: 40, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="rounded-2xl border p-8"
          style={{ background: themeBg, borderColor: themeBorder }}
        >
          {/* Title */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">{isWin ? '🏆' : '💥'}</div>
            <h1
              className="text-5xl font-mono font-black tracking-tight mb-2"
              style={{ color: themeColor }}
            >
              {isWin ? 'SURVIVED!' : 'BANKRUPT'}
            </h1>
            <p className="text-slate-400 font-mono text-sm">
              {isWin
                ? `You navigated ${state.round} rounds without going bankrupt!`
                : `Your firm collapsed in round ${state.round}.`}
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { label: 'Final Cash', value: formatCurrency(state.cash), color: state.cash >= 0 ? '#00FF9D' : '#FF3366' },
              { label: 'Total P&L', value: `${state.totalProfit >= 0 ? '+' : ''}${formatCurrency(state.totalProfit)}`, color: state.totalProfit >= 0 ? '#00FF9D' : '#FF3366' },
              { label: 'Rounds Survived', value: `${state.round} / ${state.maxRounds}`, color: '#00D4FF' },
              { label: 'Default Rate', value: formatPercent(defaultRate), color: defaultRate > 0.3 ? '#FF3366' : defaultRate > 0.15 ? '#FFB800' : '#00FF9D' },
              { label: 'Loans Issued', value: totalLoans.toString(), color: '#00D4FF' },
              { label: 'Reputation', value: `${state.reputation}/100`, color: state.reputation >= 70 ? '#00FF9D' : state.reputation >= 40 ? '#FFB800' : '#FF3366' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl border border-[#1E2435] bg-[#141824] p-4">
                <div className="text-xs text-slate-500 font-mono mb-1">{label}</div>
                <div className="text-lg font-mono font-bold" style={{ color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Score */}
          <div className="text-center mb-8 py-4 rounded-xl border border-[#FFB800]/30 bg-[#FFB800]/5">
            <div className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-1">Final Score</div>
            <div className="text-4xl font-mono font-black text-[#FFB800]">
              {Math.round(state.score).toLocaleString()}
            </div>
          </div>

          {/* Leaderboard submission */}
          {!submitted ? (
            <div className="space-y-3 mb-6">
              <div className="text-xs text-slate-500 font-mono uppercase tracking-widest text-center">Submit to Leaderboard</div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="Enter your name..."
                  maxLength={20}
                  className="flex-1 bg-[#0A0E1A] border border-[#1E2435] rounded-lg px-4 py-2 text-slate-200 font-mono text-sm placeholder-slate-600 focus:outline-none focus:border-[#00D4FF]/50"
                />
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !playerName.trim()}
                  className="px-6 py-2 rounded-lg font-mono font-bold text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  style={{ background: themeColor, color: '#0A0E1A' }}
                >
                  {submitting ? '...' : 'Submit'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center mb-4">
              <span className="text-xs font-mono text-[#00FF9D]">Score submitted!</span>
              <button
                onClick={() => setShowLeaderboard(s => !s)}
                className="ml-3 text-xs font-mono text-[#00D4FF] underline cursor-pointer"
              >
                {showLeaderboard ? 'Hide' : 'Show'} leaderboard
              </button>
            </div>
          )}

          {/* Leaderboard */}
          {showLeaderboard && leaderboard.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6"
            >
              <div className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-3 text-center">Top Players</div>
              <Leaderboard entries={leaderboard} currentPlayerName={playerName} />
            </motion.div>
          )}

          {/* Play again */}
          <button
            onClick={resetGame}
            className="w-full py-4 rounded-xl font-mono font-bold text-lg tracking-widest uppercase cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'linear-gradient(135deg, #00D4FF, #00FF9D)',
              color: '#0A0E1A',
            }}
          >
            PLAY AGAIN
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
