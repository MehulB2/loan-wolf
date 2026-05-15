import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '../hooks/useGameStore';
import BorrowerCard, { type BorrowerCardRef } from './BorrowerCard';

export default function CardStack() {
  const currentBorrowers = useGameStore(s => s.currentBorrowers);
  const phase = useGameStore(s => s.phase);
  const approveLoan = useGameStore(s => s.approveLoan);
  const rejectBorrower = useGameStore(s => s.rejectBorrower);

  const visibleBorrowers = currentBorrowers.slice(0, 3);
  const topBorrower = visibleBorrowers[0];

  const topCardRef = useRef<BorrowerCardRef>(null);
  const processingKey = useRef(false);

  // Called by drag swipes — card's own x/y already shows the animation
  function handleSwipe(direction: 'left' | 'right' | 'up') {
    if (!topBorrower) return;
    if (direction === 'right') approveLoan(topBorrower.id, false);
    else if (direction === 'up') approveLoan(topBorrower.id, true);
    else rejectBorrower(topBorrower.id);
  }

  // Called by arrow keys — animate the card's internal motion values first
  // so overlays show and card flies correctly, then commit the action
  async function handleKeySwipe(direction: 'left' | 'right' | 'up') {
    if (!topBorrower || processingKey.current || !topCardRef.current) return;
    processingKey.current = true;
    await topCardRef.current.animateExit(direction);
    if (direction === 'right') approveLoan(topBorrower.id, false);
    else if (direction === 'up') approveLoan(topBorrower.id, true);
    else rejectBorrower(topBorrower.id);
    processingKey.current = false;
  }

  useEffect(() => {
    if (phase !== 'playing' || !topBorrower) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') handleKeySwipe('right');
      else if (e.key === 'ArrowLeft') handleKeySwipe('left');
      else if (e.key === 'ArrowUp') handleKeySwipe('up');
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [phase, topBorrower]);

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
    <div className="flex flex-col items-center justify-center h-full">
      {/* Queue indicator */}
      {currentBorrowers.length > 0 && (
        <div className="mb-4 flex items-center gap-2">
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
      <div className="relative w-full" style={{ height: 'min(460px, calc(100svh - 260px))' }}>
        <AnimatePresence>
          {visibleBorrowers.map((borrower, index) => (
            <motion.div
              key={borrower.id}
              className="absolute inset-0"
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
            >
              <BorrowerCard
                ref={index === 0 ? topCardRef : null}
                borrower={borrower}
                onSwipe={handleSwipe}
                isTop={index === 0}
                stackIndex={index}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Swipe hints */}
      {currentBorrowers.length > 0 && (
        <div className="mt-4 flex gap-8 text-xs font-mono">
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
