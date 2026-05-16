import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../hooks/useGameStore';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { getLeaderboard, type LeaderboardEntry } from '../utils/firebase';
import Leaderboard from './Leaderboard';

export default function GameOver() {
  const state = useGameStore(useShallow(s => ({
    result: s.result,
    cash: s.cash,
    totalProfit: s.totalProfit,
    round: s.round,
    maxRounds: s.maxRounds,
    reputation: s.reputation,
    loanHistory: s.loanHistory,
    score: s.score,
    playerName: s.playerName,
  })));
  const resetGame = useGameStore(s => s.resetGame);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  const isWin = state.result === 'win';

  const totalLoans = state.loanHistory.length;
  const defaultedLoans = state.loanHistory.filter(l => l.status === 'defaulted').length;
  const defaultRate = totalLoans > 0 ? defaultedLoans / totalLoans : 0;

  useEffect(() => {
    getLeaderboard().then(entries => {
      setLeaderboard(entries);
      setLoadingLeaderboard(false);
    });
  }, []);

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
            <div className="text-xs text-slate-600 font-mono mt-1">
              Submitted as <span className="text-slate-400">{state.playerName}</span>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="mb-6">
            <div className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-3 text-center">Top Players</div>
            {loadingLeaderboard ? (
              <div className="text-center py-6 text-slate-600 font-mono text-sm animate-pulse">
                Loading leaderboard...
              </div>
            ) : (
              <Leaderboard entries={leaderboard} currentPlayerName={state.playerName} />
            )}
          </div>

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
