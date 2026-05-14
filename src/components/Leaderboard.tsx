import type { LeaderboardEntry } from '../utils/firebase';
import { formatPercent } from '../utils/formatters';

interface Props {
  entries: LeaderboardEntry[];
  currentPlayerName?: string;
}

export default function Leaderboard({ entries, currentPlayerName }: Props) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-slate-600 font-mono text-sm">No entries yet — be the first!</div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-7 gap-2 px-3 py-2 text-xs text-slate-500 font-mono uppercase tracking-wider">
        <span>#</span>
        <span className="col-span-2">Name</span>
        <span className="text-right">Round</span>
        <span className="text-right col-span-2">Score</span>
        <span className="text-right">Default%</span>
      </div>
      {entries.map((entry, index) => {
        const isCurrentPlayer = entry.name === currentPlayerName;
        const survived = entry.round >= 30;
        return (
          <div
            key={index}
            className={`grid grid-cols-7 gap-2 px-3 py-2 rounded-lg font-mono text-sm transition-colors ${
              isCurrentPlayer
                ? 'bg-[#00D4FF]/10 border border-[#00D4FF]/30'
                : 'bg-[#141824] border border-[#1E2435]'
            }`}
          >
            <span className={`font-bold ${index === 0 ? 'text-[#FFB800]' : index === 1 ? 'text-slate-300' : index === 2 ? 'text-[#FB923C]' : 'text-slate-500'}`}>
              {index + 1}
            </span>
            <span className={`col-span-2 truncate ${isCurrentPlayer ? 'text-[#00D4FF] font-bold' : 'text-slate-200'}`}>
              {entry.name}
              {isCurrentPlayer && <span className="text-xs ml-1 opacity-70">(you)</span>}
            </span>
            <span className={`text-right text-xs font-bold ${survived ? 'text-[#00FF9D]' : 'text-[#FF3366]'}`}>
              {entry.round}/30
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
  );
}
