import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../hooks/useGameStore';
import MetricsPanel from './MetricsPanel';
import CardStack from './CardStack';
import PortfolioDonut from './PortfolioDonut';
import PerformanceChart from './PerformanceChart';
import EventBanner from './EventBanner';
import { formatCurrency } from '../utils/formatters';

export default function Dashboard() {
  const lastRoundOutcomes = useGameStore(s => s.lastRoundOutcomes);
  const round = useGameStore(s => s.round);
  const maxRounds = useGameStore(s => s.maxRounds);
  const phase = useGameStore(s => s.phase);
  const mobile = useGameStore(useShallow(s => ({
    cash: s.cash,
    startingCash: s.startingCash,
    totalProfit: s.totalProfit,
    reputation: s.reputation,
  })));

  const recentOutcomes = lastRoundOutcomes.slice(-5).reverse();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#0A0E1A] flex flex-col"
    >
      {/* Event Banner */}
      <EventBanner />

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-[#1E2435] bg-[#0A0E1A] z-10">
        <div className="flex items-center gap-3">
          <span
            className="text-lg font-mono font-black tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #00D4FF, #00FF9D)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            LOAN WOLF
          </span>
          <span className="text-xs font-mono text-slate-500 hidden sm:inline">Lending Simulator</span>
        </div>
        <div className="flex items-center gap-2 md:gap-4 text-xs font-mono">
          <div className={`px-2 py-1 rounded ${phase === 'resolving' ? 'bg-[#FFB800]/10 text-[#FFB800]' : 'bg-[#00FF9D]/10 text-[#00FF9D]'}`}>
            {phase === 'resolving' ? '⏳' : '▶'}<span className="hidden sm:inline"> {phase === 'resolving' ? 'RESOLVING' : 'PLAYING'}</span>
          </div>
          <span className="text-slate-400">R<span className="hidden sm:inline">ound </span><span className="text-[#00D4FF] font-bold">{round}</span>/{maxRounds}</span>
        </div>
      </div>

      {/* Mobile-only compact metrics strip */}
      <div className="flex md:hidden items-center gap-2 px-4 py-2 border-b border-[#1E2435] bg-[#0D1120]">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-slate-500 font-mono">Cash</div>
          <div className={`text-sm font-mono font-bold truncate ${mobile.cash >= mobile.startingCash * 0.5 ? 'text-[#00FF9D]' : mobile.cash >= mobile.startingCash * 0.25 ? 'text-[#FFB800]' : 'text-[#FF3366]'}`}>
            {formatCurrency(mobile.cash)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-slate-500 font-mono">P&L</div>
          <div className={`text-sm font-mono font-bold truncate ${mobile.totalProfit >= 0 ? 'text-[#00FF9D]' : 'text-[#FF3366]'}`}>
            {mobile.totalProfit >= 0 ? '+' : ''}{formatCurrency(mobile.totalProfit)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-slate-500 font-mono">Rep</div>
          <div className={`text-sm font-mono font-bold ${mobile.reputation >= 70 ? 'text-[#00FF9D]' : mobile.reputation >= 40 ? 'text-[#FFB800]' : 'text-[#FF3366]'}`}>
            {mobile.reputation}/100
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex gap-0 overflow-hidden min-h-0">
        {/* Left: Metrics — desktop only */}
        <div className="hidden md:block w-64 flex-shrink-0 p-4 border-r border-[#1E2435] overflow-y-auto">
          <MetricsPanel />
        </div>

        {/* Center: Card Stack */}
        <div className="flex-1 flex flex-col p-3 md:p-4 min-w-0 min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            {/* Section header */}
            <div className="flex items-center justify-between mb-2 md:mb-3 flex-shrink-0">
              <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Borrower Queue</h2>
              {phase === 'playing' && (
                <span className="text-xs font-mono text-slate-600 hidden sm:inline">Tap card to flip · Drag to decide</span>
              )}
            </div>
            <div className="flex-1 min-h-0">
              <CardStack />
            </div>
          </div>
        </div>

        {/* Right: Portfolio + Outcomes — desktop only */}
        <div className="hidden md:block w-72 flex-shrink-0 p-4 border-l border-[#1E2435] overflow-y-auto space-y-4">
          <PortfolioDonut />

          {/* Recent Outcomes */}
          <div className="rounded-xl border border-[#1E2435] bg-[#141824] p-4">
            <div className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-3">Recent Outcomes</div>
            {recentOutcomes.length === 0 ? (
              <p className="text-slate-600 font-mono text-xs text-center py-3">No outcomes yet</p>
            ) : (
              <div className="space-y-2">
                {recentOutcomes.map((outcome) => {
                  const isDefault = outcome.outcome === 'default';
                  const isExpanded = expandedId === outcome.loanId;
                  return (
                    <motion.div
                      key={outcome.loanId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`rounded-lg border ${
                        isDefault
                          ? 'bg-[#FF3366]/5 border-[#FF3366]/15'
                          : 'bg-[#00FF9D]/5 border-[#00FF9D]/15'
                      }`}
                    >
                      <div className="flex items-center justify-between p-2">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{isDefault ? '❌' : '✅'}</span>
                          <span className="text-xs font-mono text-slate-300 truncate max-w-20">{outcome.borrowerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-mono font-bold ${outcome.pnl >= 0 ? 'text-[#00FF9D]' : 'text-[#FF3366]'}`}>
                            {outcome.pnl >= 0 ? '+' : ''}{formatCurrency(outcome.pnl)}
                          </span>
                          {isDefault && outcome.reason && (
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : outcome.loanId)}
                              className="w-4 h-4 rounded-full border border-[#FF3366]/40 text-[#FF3366] text-[9px] font-mono font-bold leading-none flex items-center justify-center hover:bg-[#FF3366]/20 transition-colors cursor-pointer flex-shrink-0"
                              title="Why did this default?"
                            >
                              ?
                            </button>
                          )}
                        </div>
                      </div>
                      <AnimatePresence>
                        {isExpanded && outcome.reason && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                            <p className="px-2 pb-2 text-[10px] font-mono text-slate-400 leading-relaxed border-t border-[#FF3366]/10 pt-1.5">
                              {outcome.reason}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Performance Chart */}
      <div className="h-24 md:h-48 flex-shrink-0 border-t border-[#1E2435] px-3 md:px-4 py-2 md:py-3">
        <PerformanceChart />
      </div>
    </motion.div>
  );
}
