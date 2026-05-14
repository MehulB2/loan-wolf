import { useGameStore } from '../hooks/useGameStore';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { calculatePortfolioEL } from '../game/defaultEngine';

export default function MetricsPanel() {
  const state = useGameStore(s => s);

  const portfolioValue = state.activeLoans
    .filter(l => l.status === 'active')
    .reduce((sum, l) => sum + l.amount, 0);

  const portfolioEL = calculatePortfolioEL(state.activeLoans, state.activeEvents);

  const totalLoans = state.loanHistory.length;
  const defaultedLoans = state.loanHistory.filter(l => l.status === 'defaulted').length;
  const defaultRate = totalLoans > 0 ? defaultedLoans / totalLoans : 0;

  const totalDecisions = totalLoans + state.activeLoans.filter(l => l.status === 'active').length;
  const approvalRate = totalDecisions > 0 ? (totalLoans + state.activeLoans.filter(l => l.status === 'active').length) / Math.max(totalDecisions, 1) : 0;

  const activeActiveLoans = state.activeLoans.filter(l => l.status === 'active');
  const avgRate = activeActiveLoans.length > 0
    ? activeActiveLoans.reduce((sum, l) => sum + l.interestRate, 0) / activeActiveLoans.length
    : 0;

  const liquidityRatio = (state.cash + portfolioValue) > 0
    ? state.cash / (state.cash + portfolioValue)
    : 1;

  const profitColor = state.totalProfit >= 0 ? 'text-[#00FF9D]' : 'text-[#FF3366]';
  const cashColor = state.cash >= state.startingCash * 0.5 ? 'text-[#00FF9D]' : state.cash >= state.startingCash * 0.25 ? 'text-[#FFB800]' : 'text-[#FF3366]';

  return (
    <div className="h-full overflow-y-auto space-y-3 pr-1">
      {/* Cash */}
      <div className="rounded-xl border border-[#1E2435] bg-[#141824] p-4">
        <div className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-1">Cash Balance</div>
        <div className={`text-2xl font-mono font-bold ${cashColor}`}>{formatCurrency(state.cash)}</div>
      </div>

      {/* P&L */}
      <div className="rounded-xl border border-[#1E2435] bg-[#141824] p-4">
        <div className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-1">Total P&L</div>
        <div className={`text-xl font-mono font-bold ${profitColor}`}>
          {state.totalProfit >= 0 ? '+' : ''}{formatCurrency(state.totalProfit)}
        </div>
      </div>

      {/* Portfolio */}
      <div className="rounded-xl border border-[#1E2435] bg-[#141824] p-4 space-y-2">
        <div className="text-xs text-slate-500 font-mono uppercase tracking-widest">Portfolio</div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-400 font-mono">Value</span>
          <span className="text-xs text-[#00D4FF] font-mono font-bold">{formatCurrency(portfolioValue)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-400 font-mono">Est. Risk Exposure</span>
          <span className="text-xs text-[#FFB800] font-mono font-bold">{formatCurrency(portfolioEL)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-400 font-mono">Active Loans</span>
          <span className="text-xs text-slate-200 font-mono">{activeActiveLoans.length}</span>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2">
        <MetricTile label="Default Rate" value={formatPercent(defaultRate)} color={defaultRate > 0.3 ? '#FF3366' : defaultRate > 0.15 ? '#FFB800' : '#00FF9D'} />
        <MetricTile label="Approval Rate" value={formatPercent(approvalRate)} color="#00D4FF" />
        <MetricTile label="Avg Rate" value={formatPercent(avgRate)} color="#00D4FF" />
        <MetricTile label="Liquidity" value={formatPercent(liquidityRatio)} color={liquidityRatio > 0.5 ? '#00FF9D' : liquidityRatio > 0.25 ? '#FFB800' : '#FF3366'} />
      </div>

      {/* Reputation */}
      <div className="rounded-xl border border-[#1E2435] bg-[#141824] p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Reputation</span>
          <span className={`text-xs font-mono font-bold ${state.reputation >= 70 ? 'text-[#00FF9D]' : state.reputation >= 40 ? 'text-[#FFB800]' : 'text-[#FF3366]'}`}>
            {state.reputation}/100
          </span>
        </div>
        <div className="h-2 bg-[#0A0E1A] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${state.reputation}%`,
              background: state.reputation >= 70 ? '#00FF9D' : state.reputation >= 40 ? '#FFB800' : '#FF3366',
            }}
          />
        </div>
      </div>

      {/* Round Progress */}
      <div className="rounded-xl border border-[#1E2435] bg-[#141824] p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-500 font-mono uppercase tracking-widest">Round</span>
          <span className="text-xs font-mono text-[#00D4FF] font-bold">{state.round} / {state.maxRounds}</span>
        </div>
        <div className="h-2 bg-[#0A0E1A] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00D4FF] rounded-full transition-all duration-500"
            style={{ width: `${(state.round / state.maxRounds) * 100}%` }}
          />
        </div>
      </div>

      {/* Score */}
      <div className="rounded-xl border border-[#1E2435] bg-[#141824] p-4">
        <div className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-1">Score</div>
        <div className="text-xl font-mono font-bold text-[#FFB800]">{Math.round(state.score).toLocaleString()}</div>
      </div>

      {/* Active Events */}
      {state.activeEvents.length > 0 && (
        <div className="rounded-xl border border-[#FF3366]/30 bg-[#FF3366]/5 p-4">
          <div className="text-xs text-[#FF3366] font-mono uppercase tracking-widest mb-2">Active Events</div>
          <div className="space-y-2">
            {state.activeEvents.map(event => (
              <div key={event.id} className="flex items-center gap-2">
                <span className="text-base">{event.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-mono text-slate-200 truncate">{event.name}</div>
                  <div className="text-xs font-mono text-slate-500">{event.roundsRemaining}rd left</div>
                </div>
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  event.severity === 'high' ? 'bg-[#FF3366]' :
                  event.severity === 'medium' ? 'bg-[#FFB800]' : 'bg-[#00D4FF]'
                }`} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MetricTile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-[#1E2435] bg-[#141824] p-3">
      <div className="text-xs text-slate-500 font-mono mb-1">{label}</div>
      <div className="text-sm font-mono font-bold" style={{ color }}>{value}</div>
    </div>
  );
}
