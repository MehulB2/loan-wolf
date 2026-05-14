import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useGameStore } from '../hooks/useGameStore';
import { formatCurrency } from '../utils/formatters';

interface TooltipPayload {
  color: string;
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string | number;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#141824] border border-[#1E2435] rounded-lg p-3 shadow-xl">
      <p className="text-xs text-slate-500 font-mono mb-2">Round {label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-xs text-slate-400 font-mono">{p.name}:</span>
          <span className="text-xs font-mono font-bold" style={{ color: p.color }}>
            {formatCurrency(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function PerformanceChart() {
  const roundHistory = useGameStore(s => s.roundHistory);
  const startingCash = useGameStore(s => s.startingCash);

  if (roundHistory.length === 0) {
    return (
      <div className="rounded-xl border border-[#1E2435] bg-[#141824] p-4 flex items-center justify-center h-full">
        <p className="text-slate-600 font-mono text-xs">No data yet — complete a round to see performance</p>
      </div>
    );
  }

  const data = roundHistory.map(r => ({
    round: r.round,
    'Cash Balance': Math.round(r.cash),
    'Cumulative P&L': Math.round(r.cash - startingCash),
  }));

  return (
    <div className="rounded-xl border border-[#1E2435] bg-[#141824] p-4 h-full">
      <div className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-3">Performance History</div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <defs>
            <linearGradient id="cashGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00FF9D" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00FF9D" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2435" />
          <XAxis
            dataKey="round"
            stroke="#374151"
            tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'monospace' }}
            tickLine={false}
          />
          <YAxis
            stroke="#374151"
            tick={{ fill: '#6B7280', fontSize: 10, fontFamily: 'monospace' }}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', color: '#9CA3AF' }}
          />
          <Area
            type="monotone"
            dataKey="Cash Balance"
            stroke="#00D4FF"
            strokeWidth={2}
            fill="url(#cashGradient)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="Cumulative P&L"
            stroke="#00FF9D"
            strokeWidth={2}
            fill="url(#profitGradient)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
