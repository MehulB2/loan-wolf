import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../hooks/useGameStore';
import { getAllLeaderboard, type LeaderboardEntry } from '../utils/firebase';
import { formatPercent } from '../utils/formatters';

const PAGE_SIZE = 25;

function ModeBadge({ maxRounds }: { maxRounds?: number }) {
  const mode = maxRounds || 30;
  const label = mode === 10 ? 'S' : mode === 20 ? 'M' : 'L';
  const color = mode === 10 ? '#00D4FF' : mode === 20 ? '#FFB800' : '#00FF9D';
  return (
    <span
      className="text-[10px] font-mono font-bold px-1 py-0.5 rounded border"
      style={{ color, borderColor: color, background: `${color}15` }}
    >
      {label}
    </span>
  );
}

export default function LeaderboardPage() {
  const closeLeaderboard = useGameStore(s => s.closeLeaderboard);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    getAllLeaderboard().then(data => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  const totalPages = Math.ceil(entries.length / PAGE_SIZE);
  const pageEntries = entries.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="min-h-screen bg-[#0A0E1A] text-slate-200 font-mono px-4 py-10"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={closeLeaderboard}
            className="text-slate-500 hover:text-slate-300 transition-colors text-sm tracking-widest uppercase cursor-pointer"
          >
            ← BACK
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #00D4FF 0%, #00FF9D 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              LEADERBOARD
            </h1>
            {!loading && (
              <p className="text-slate-500 text-xs mt-1 tracking-widest uppercase">
                {entries.length} {entries.length === 1 ? 'player' : 'players'} registered
              </p>
            )}
          </div>
          <div className="w-16" />
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-[#1E2435] bg-[#141824] overflow-hidden">
          {/* Column headers */}
          <div className="grid grid-cols-8 gap-2 px-4 py-3 text-xs text-slate-500 uppercase tracking-wider border-b border-[#1E2435]">
            <span>#</span>
            <span className="col-span-2">Name</span>
            <span className="text-center">Mode</span>
            <span className="text-right">Round</span>
            <span className="text-right col-span-2">Score</span>
            <span className="text-right">Default%</span>
          </div>

          {loading ? (
            <div className="text-center py-16 text-slate-600 text-sm animate-pulse">
              Loading...
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-16 text-slate-600 text-sm">
              No entries yet — be the first!
            </div>
          ) : (
            <div>
              {pageEntries.map((entry, i) => {
                const rank = page * PAGE_SIZE + i;
                const max = entry.maxRounds || 30;
                const survived = entry.round >= max;
                return (
                  <div
                    key={`${entry.name}-${entry.timestamp}`}
                    className="grid grid-cols-8 gap-2 px-4 py-3 border-b border-[#1E2435]/50 last:border-0 hover:bg-[#1E2435]/30 transition-colors text-sm"
                  >
                    <span className={`font-bold ${rank === 0 ? 'text-[#FFB800]' : rank === 1 ? 'text-slate-300' : rank === 2 ? 'text-[#FB923C]' : 'text-slate-500'}`}>
                      {rank + 1}
                    </span>
                    <span className="col-span-2 truncate text-slate-200">{entry.name}</span>
                    <span className="flex items-center justify-center">
                      <ModeBadge maxRounds={entry.maxRounds} />
                    </span>
                    <span className={`text-right text-xs font-bold ${survived ? 'text-[#00FF9D]' : 'text-[#FF3366]'}`}>
                      {entry.round}/{max}
                    </span>
                    <span className={`text-right col-span-2 font-bold ${survived ? 'text-[#00FF9D]' : 'text-[#FF3366]'}`}>
                      {Math.round(entry.score).toLocaleString()}
                    </span>
                    <span className={`text-right text-xs ${entry.defaultRate > 0.3 ? 'text-[#FF3366]' : entry.defaultRate > 0.15 ? 'text-[#FFB800]' : 'text-[#00FF9D]'}`}>
                      {formatPercent(entry.defaultRate)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-5 py-2 rounded-lg border border-[#1E2435] text-sm text-slate-400 hover:text-slate-200 hover:border-[#00D4FF]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              ← PREV
            </button>
            <span className="text-slate-500 text-xs tracking-widest">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-5 py-2 rounded-lg border border-[#1E2435] text-sm text-slate-400 hover:text-slate-200 hover:border-[#00D4FF]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              NEXT →
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
