import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useGameStore } from '../hooks/useGameStore';
import { formatCurrency } from '../utils/formatters';

const INDUSTRY_COLORS: Record<string, string> = {
  'Real Estate': '#00D4FF',
  'Technology': '#00FF9D',
  'Healthcare': '#FFB800',
  'Retail': '#FF3366',
  'Mining': '#A78BFA',
  'Construction': '#FB923C',
  'Finance': '#34D399',
  'Hospitality': '#F472B6',
  'Agriculture': '#86EFAC',
  'Manufacturing': '#60A5FA',
};

interface TooltipPayload {
  name: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#141824] border border-[#1E2435] rounded-lg p-3 shadow-xl">
      <p className="text-xs text-slate-400 font-mono">{payload[0].name}</p>
      <p className="text-sm text-[#00D4FF] font-mono font-bold">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export default function PortfolioDonut() {
  const allLoans = useGameStore(s => s.activeLoans);
  const activeLoans = allLoans.filter(l => l.status === 'active');

  const industryMap = new Map<string, number>();
  for (const loan of activeLoans) {
    industryMap.set(loan.industry, (industryMap.get(loan.industry) ?? 0) + loan.amount);
  }

  const data = Array.from(industryMap.entries()).map(([name, value]) => ({ name, value }));
  const totalValue = data.reduce((sum, d) => sum + d.value, 0);

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-[#1E2435] bg-[#141824] p-4 flex flex-col items-center justify-center" style={{ minHeight: '200px' }}>
        <div className="text-slate-600 font-mono text-xs text-center">No active loans yet</div>
        <div className="text-slate-700 font-mono text-xs mt-1">Approve borrowers to see portfolio</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1E2435] bg-[#141824] p-4">
      <div className="text-xs text-slate-500 font-mono uppercase tracking-widest mb-2">Portfolio by Industry</div>
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={INDUSTRY_COLORS[entry.name] ?? '#6B7280'}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '9px', fontFamily: 'monospace', color: '#9CA3AF' }}
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ top: '-20px' }}>
          <div className="text-center">
            <div className="text-xs text-slate-500 font-mono">Total</div>
            <div className="text-sm text-[#00D4FF] font-mono font-bold">{formatCurrency(totalValue)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
