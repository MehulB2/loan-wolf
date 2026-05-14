import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import type { Borrower } from '../types/borrower';
import { formatCurrency, formatPercent } from '../utils/formatters';
import { getCreditBand } from '../game/loanPricer';

interface Props {
  borrower: Borrower;
  onSwipe: (direction: 'left' | 'right' | 'up') => void;
  isTop: boolean;
  stackIndex: number;
}

const FLAG_LABELS: Record<string, string> = {
  unstable_income: '⚡ Unstable Income',
  gambling: '🎰 Gambling Risk',
  high_dti: '💳 High DTI',
  overdraft_history: '🏦 Overdraft History',
  volatile_cashflow: '📊 Volatile Cashflow',
};

function CreditScoreBadge({ score }: { score: number }) {
  let color = '#FF3366';
  let label = 'Poor';
  if (score >= 700) { color = '#00FF9D'; label = 'Good'; }
  else if (score >= 550) { color = '#FFB800'; label = 'Fair'; }

  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border"
      style={{ color, borderColor: color, background: `${color}15` }}
    >
      <span>{score}</span>
      <span className="opacity-70">{label}</span>
    </div>
  );
}

export default function BorrowerCard({ borrower, onSwipe, isTop, stackIndex }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStarted = useRef(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const overlayOpacity = useTransform(
    x,
    [-150, -50, 0, 50, 150],
    [1, 0.3, 0, 0.3, 1]
  );
  const overlayOpacityUp = useTransform(
    y,
    [-150, -50, 0],
    [1, 0.3, 0]
  );
  const approveOpacity = useTransform(x, [50, 150], [0, 1]);
  const rejectOpacity = useTransform(x, [-150, -50], [1, 0]);

  const dti = ((borrower.monthlyDebt * 12) / borrower.annualIncome) * 100;
  const band = getCreditBand(borrower.hiddenPD);

  const scale = 1 - stackIndex * 0.04;
  const yOffset = stackIndex * 12;
  const blur = stackIndex > 0 ? `blur(${stackIndex * 1.5}px)` : 'none';

  function handleDragStart() {
    dragStarted.current = true;
    setIsDragging(true);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    setIsDragging(false);
    dragStarted.current = false;

    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipe('right');
    } else if (info.offset.x < -threshold) {
      onSwipe('left');
    } else if (info.offset.y < -threshold) {
      onSwipe('up');
    } else {
      x.set(0);
      y.set(0);
    }
  }

  function handleClick() {
    if (!isDragging && !dragStarted.current) {
      setFlipped(f => !f);
    }
  }

  if (!isTop) {
    return (
      <div
        className="absolute w-full h-full rounded-xl border border-[#1E2435] bg-[#141824]"
        style={{
          transform: `scale(${scale}) translateY(${yOffset}px)`,
          filter: blur,
          zIndex: 10 - stackIndex,
        }}
      />
    );
  }

  return (
    <motion.div
      className="absolute w-full h-full cursor-grab active:cursor-grabbing select-none"
      style={{ x, y, rotate, zIndex: 20 }}
      drag
      dragConstraints={{ left: -300, right: 300, top: -300, bottom: 0 }}
      dragElastic={0.9}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      whileHover={{ scale: 1.01 }}
    >
      {/* Approve overlay */}
      <motion.div
        className="absolute inset-0 rounded-xl flex items-center justify-center z-10 pointer-events-none"
        style={{
          opacity: approveOpacity,
          background: 'rgba(0,255,157,0.15)',
          border: '2px solid #00FF9D',
        }}
      >
        <span className="text-4xl font-mono font-black text-[#00FF9D] rotate-[-15deg] border-4 border-[#00FF9D] px-4 py-2 rounded-lg">
          APPROVE ✓
        </span>
      </motion.div>

      {/* Reject overlay */}
      <motion.div
        className="absolute inset-0 rounded-xl flex items-center justify-center z-10 pointer-events-none"
        style={{
          opacity: rejectOpacity,
          background: 'rgba(255,51,102,0.15)',
          border: '2px solid #FF3366',
        }}
      >
        <span className="text-4xl font-mono font-black text-[#FF3366] rotate-[15deg] border-4 border-[#FF3366] px-4 py-2 rounded-lg">
          REJECT ✗
        </span>
      </motion.div>

      {/* Premium overlay */}
      <motion.div
        className="absolute inset-0 rounded-xl flex items-center justify-center z-10 pointer-events-none"
        style={{
          opacity: overlayOpacityUp,
          background: 'rgba(0,212,255,0.15)',
          border: '2px solid #00D4FF',
        }}
      >
        <span className="text-4xl font-mono font-black text-[#00D4FF] border-4 border-[#00D4FF] px-4 py-2 rounded-lg">
          PREMIUM ★
        </span>
      </motion.div>

      {/* Card content */}
      <div className="w-full h-full rounded-xl border border-[#1E2435] bg-[#141824] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-[#1E2435]">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <h3 className="text-slate-100 font-mono font-bold text-lg leading-tight">{borrower.name}</h3>
              <span className="text-xs text-slate-500 font-mono">{borrower.industry}</span>
            </div>
            <CreditScoreBadge score={borrower.creditScore} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-mono font-bold text-[#00D4FF]">{formatCurrency(borrower.loanAmount)}</span>
            <span className="text-xs text-slate-500 font-mono">· {borrower.loanPurpose}</span>
          </div>
        </div>

        {/* Body */}
        {!flipped ? (
          <div className="flex-1 px-5 py-4 space-y-3 overflow-y-auto">
            {/* Income & Debt */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0A0E1A] rounded-lg p-3">
                <div className="text-xs text-slate-500 font-mono mb-1">Annual Income</div>
                <div className="text-[#00FF9D] font-mono font-bold text-sm">{formatCurrency(borrower.annualIncome)}</div>
              </div>
              <div className="bg-[#0A0E1A] rounded-lg p-3">
                <div className="text-xs text-slate-500 font-mono mb-1">Monthly Debt</div>
                <div className="text-[#FFB800] font-mono font-bold text-sm">{formatCurrency(borrower.monthlyDebt)}</div>
              </div>
            </div>

            {/* DTI Bar */}
            <div className="bg-[#0A0E1A] rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-500 font-mono">Debt-to-Income Ratio</span>
                <span className={`text-xs font-mono font-bold ${dti > 40 ? 'text-[#FF3366]' : dti > 30 ? 'text-[#FFB800]' : 'text-[#00FF9D]'}`}>
                  {dti.toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 bg-[#1E2435] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(dti, 100)}%`,
                    background: dti > 40 ? '#FF3366' : dti > 30 ? '#FFB800' : '#00FF9D',
                  }}
                />
              </div>
            </div>

            {/* Employment & Rate */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0A0E1A] rounded-lg p-3">
                <div className="text-xs text-slate-500 font-mono mb-1">Employment</div>
                <div className="text-slate-200 font-mono font-bold text-sm">{borrower.employmentYears}yr</div>
              </div>
              <div className="bg-[#0A0E1A] rounded-lg p-3">
                <div className="text-xs text-slate-500 font-mono mb-1">Suggested Rate</div>
                <div className="text-[#00D4FF] font-mono font-bold text-sm">{formatPercent(borrower.suggestedRate)}</div>
              </div>
            </div>

            {/* Risk band */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-mono">Risk Band</span>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                band === 'Low' ? 'bg-[#00FF9D]/10 text-[#00FF9D]' :
                band === 'Medium' ? 'bg-[#FFB800]/10 text-[#FFB800]' :
                band === 'High' ? 'bg-[#FF3366]/10 text-[#FF3366]' :
                'bg-red-900/30 text-red-400'
              }`}>
                {band === 'VeryHigh' ? 'Very High' : band}
              </span>
            </div>

            {/* Behavioral flags */}
            {borrower.behavioralFlags.length > 0 && (
              <div className="space-y-1.5">
                {borrower.behavioralFlags.map(flag => (
                  <div
                    key={flag}
                    className="flex items-center gap-2 bg-[#FF3366]/10 border border-[#FF3366]/20 rounded-lg px-3 py-1.5"
                  >
                    <span className="text-xs font-mono text-[#FF3366]">{FLAG_LABELS[flag]}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Flipped - detailed view */
          <div className="flex-1 px-5 py-4 space-y-3 overflow-y-auto">
            <div className="text-xs text-[#00D4FF] font-mono uppercase tracking-widest mb-3">Detailed Analysis</div>

            <div className="space-y-2">
              {[
                { label: 'Credit Score', value: borrower.creditScore.toString(), note: borrower.creditScore >= 700 ? 'Good' : borrower.creditScore >= 550 ? 'Fair' : 'Poor' },
                { label: 'Annual Income', value: formatCurrency(borrower.annualIncome) },
                { label: 'Monthly Debt Payments', value: formatCurrency(borrower.monthlyDebt) },
                { label: 'Annual Debt Burden', value: formatCurrency(borrower.monthlyDebt * 12) },
                { label: 'DTI Ratio', value: `${dti.toFixed(1)}%`, note: dti > 43 ? 'Very High Risk' : dti > 36 ? 'High' : dti > 20 ? 'Moderate' : 'Low' },
                { label: 'Employment Years', value: `${borrower.employmentYears} years` },
                { label: 'Suggested Rate', value: formatPercent(borrower.suggestedRate) },
                { label: 'Premium Rate', value: formatPercent(borrower.suggestedRate + 0.025) },
                { label: 'Loan Purpose', value: borrower.loanPurpose },
                { label: 'Industry', value: borrower.industry },
              ].map(({ label, value, note }) => (
                <div key={label} className="flex justify-between items-center py-1.5 border-b border-[#1E2435]">
                  <span className="text-xs text-slate-500 font-mono">{label}</span>
                  <div className="text-right">
                    <span className="text-xs text-slate-200 font-mono font-bold">{value}</span>
                    {note && <span className="text-xs text-slate-500 font-mono ml-1">({note})</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer hint */}
        <div className="px-5 pb-3 pt-2 border-t border-[#1E2435]">
          <p className="text-xs text-slate-600 font-mono text-center">
            {flipped ? 'Tap to flip back · Drag to decide' : 'Tap for details · Drag to decide'}
          </p>
          <div className="flex justify-center gap-4 mt-2">
            <span className="text-xs font-mono text-[#FF3366]">← Reject</span>
            <span className="text-xs font-mono text-[#00D4FF]">↑ Premium</span>
            <span className="text-xs font-mono text-[#00FF9D]">Approve →</span>
          </div>
        </div>
      </div>

      {/* Invisible overlay to prevent drag-triggered click */}
      <motion.div
        className="absolute inset-0 rounded-xl z-20 pointer-events-none"
        style={{ opacity: overlayOpacity }}
      />
    </motion.div>
  );
}
