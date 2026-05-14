import { motion } from 'framer-motion';
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
  const phase = useGameStore(s => s.phase);

  const recentOutcomes = lastRoundOutcomes.slice(-5).reverse();

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
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#1E2435] bg-[#0A0E1A] z-10">
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
          <span className="text-xs font-mono text-slate-500">Lending Simulator</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className={`px-2 py-1 rounded ${phase === 'resolving' ? 'bg-[#FFB800]/10 text-[#FFB800]' : 'bg-[#00FF9D]/10 text-[#00FF9D]'}`}>
            {phase === 'resolving' ? '⏳ RESOLVING' : '▶ PLAYING'}
          </div>
          <span className="text-slate-400">Round <span className="text-[#00D4FF] font-bold">{round}</span> / 30</span>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex gap-0 overflow-hidden" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        {/* Left: Metrics */}
        <div className="w-64 flex-shrink-0 p-4 border-r border-[#1E2435] overflow-y-auto">
          <MetricsPanel />
        </div>

        {/* Center: Card Stack */}
        <div className="flex-1 flex flex-col p-4 min-w-0">
          <div className="flex-1 flex flex-col">
            {/* Section header */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest">Borrower Queue</h2>
              {phase === 'playing' && (
                <span className="text-xs font-mono text-slate-600">Tap card to flip · Drag to decide</span>
              )}
            </div>
            <div className="flex-1">
              <CardStack />
            </div>
          </div>
        </div>

        {/* Right: Portfolio + Outcomes */}
        <div className="w-72 flex-shrink-0 p-4 border-l border-[#1E2435] overflow-y-auto space-y-4">
          <PortfolioDonut />

          {/* Recent Outcomes */}
          <div className="rounded-xl border border-[#1E2435] bg-[#141824] p-4">
            <div className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-3">Recent Outcomes</div>
            {recentOutcomes.length === 0 ? (
              <p className="text-slate-600 font-mono text-xs text-center py-3">No outcomes yet</p>
            ) : (
              <div className="space-y-2">
                {recentOutcomes.map((outcome) => (
                  <motion.div
                    key={outcome.loanId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      outcome.outcome === 'repaid'
                        ? 'bg-[#00FF9D]/5 border border-[#00FF9D]/15'
                        : 'bg-[#FF3366]/5 border border-[#FF3366]/15'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{outcome.outcome === 'repaid' ? '✅' : '❌'}</span>
                      <span className="text-xs font-mono text-slate-300 truncate max-w-24">{outcome.borrowerName}</span>
                    </div>
                    <span className={`text-xs font-mono font-bold ${outcome.pnl >= 0 ? 'text-[#00FF9D]' : 'text-[#FF3366]'}`}>
                      {outcome.pnl >= 0 ? '+' : ''}{formatCurrency(outcome.pnl)}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Performance Chart */}
      <div className="h-48 flex-shrink-0 border-t border-[#1E2435] px-4 py-3">
        <PerformanceChart />
      </div>
    </motion.div>
  );
}
