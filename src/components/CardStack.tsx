import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../hooks/useGameStore';
import BorrowerCard from './BorrowerCard';

export default function CardStack() {
  const currentBorrowers = useGameStore(s => s.currentBorrowers);
  const phase = useGameStore(s => s.phase);
  const approveLoan = useGameStore(s => s.approveLoan);
  const rejectBorrower = useGameStore(s => s.rejectBorrower);

  const visibleBorrowers = currentBorrowers.slice(0, 3);
  const topBorrower = visibleBorrowers[0];

  function handleSwipe(direction: 'left' | 'right' | 'up') {
    if (!topBorrower) return;
    if (direction === 'right') {
      approveLoan(topBorrower.id, false);
    } else if (direction === 'up') {
      approveLoan(topBorrower.id, true);
    } else {
      rejectBorrower(topBorrower.id);
    }
  }

  if (phase === 'resolving') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-2 border-[#00D4FF] border-t-transparent rounded-full"
        />
        <p className="text-[#00D4FF] font-mono text-sm animate-pulse">Resolving loans...</p>
      </div>
    );
  }

  if (currentBorrowers.length === 0 && phase === 'playing') {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-6xl"
        >
          ✓
        </motion.div>
        <p className="text-[#00FF9D] font-mono text-lg font-bold">Round Complete</p>
        <p className="text-slate-500 font-mono text-sm">Processing outcomes...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-full min-h-0">
      {/* Queue indicator */}
      {currentBorrowers.length > 0 && (
        <div className="mb-2 md:mb-3 flex items-center gap-2 flex-shrink-0">
          {currentBorrowers.map((b, i) => (
            <div
              key={b.id}
              className={`w-2 h-2 rounded-full transition-all ${i === 0 ? 'bg-[#00D4FF] w-4' : 'bg-[#1E2435]'}`}
            />
          ))}
          <span className="text-slate-500 font-mono text-xs ml-1">
            {currentBorrowers.length} remaining
          </span>
        </div>
      )}

      {/* Card Stack */}
      <div className="relative w-full flex-1 min-h-0" style={{ maxHeight: '460px' }}>
        <AnimatePresence>
          {visibleBorrowers.map((borrower, index) => (
            <motion.div
              key={borrower.id}
              className="absolute inset-0"
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{
                x: index === 0 ? 0 : 0,
                opacity: 0,
                scale: 0.8,
                transition: { duration: 0.3 },
              }}
            >
              <BorrowerCard
                borrower={borrower}
                onSwipe={handleSwipe}
                isTop={index === 0}
                stackIndex={index}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Mobile: tap buttons */}
      {currentBorrowers.length > 0 && phase === 'playing' && (
        <div className="flex md:hidden gap-2 mt-3 w-full flex-shrink-0">
          <button
            onClick={() => handleSwipe('left')}
            className="flex-1 py-3 rounded-xl font-mono font-bold text-sm border border-[#FF3366]/40 bg-[#FF3366]/10 text-[#FF3366] active:scale-95 transition-transform select-none"
          >
            ✗ Reject
          </button>
          <button
            onClick={() => handleSwipe('up')}
            className="px-5 py-3 rounded-xl font-mono font-bold text-base border border-[#00D4FF]/40 bg-[#00D4FF]/10 text-[#00D4FF] active:scale-95 transition-transform select-none"
            title="Premium rate"
          >
            ★
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="flex-1 py-3 rounded-xl font-mono font-bold text-sm border border-[#00FF9D]/40 bg-[#00FF9D]/10 text-[#00FF9D] active:scale-95 transition-transform select-none"
          >
            Approve ✓
          </button>
        </div>
      )}

      {/* Desktop: swipe hints */}
      {currentBorrowers.length > 0 && (
        <div className="hidden md:flex mt-4 gap-8 text-xs font-mono flex-shrink-0">
          <span className="text-[#FF3366] flex items-center gap-1">
            <span>←</span> Reject
          </span>
          <span className="text-[#00D4FF] flex items-center gap-1">
            <span>↑</span> Premium
          </span>
          <span className="text-[#00FF9D] flex items-center gap-1">
            Approve <span>→</span>
          </span>
        </div>
      )}
    </div>
  );
}
