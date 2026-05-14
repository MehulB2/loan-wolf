import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../hooks/useGameStore';
import type { EconomicEvent } from '../types/events';

export default function EventBanner() {
  const activeEvents = useGameStore(s => s.activeEvents);
  const [displayedEvent, setDisplayedEvent] = useState<EconomicEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const prevEventsRef = useRef<string[]>([]);

  useEffect(() => {
    const currentIds = activeEvents.map(e => e.id);
    const newEvents = activeEvents.filter(e => !prevEventsRef.current.includes(e.id));
    prevEventsRef.current = currentIds;

    if (newEvents.length > 0) {
      setDisplayedEvent(newEvents[0]);
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [activeEvents]);

  const severityColors = {
    high: { bg: 'bg-[#FF3366]/10', border: 'border-[#FF3366]/40', text: 'text-[#FF3366]', badge: 'bg-[#FF3366]/20 text-[#FF3366]' },
    medium: { bg: 'bg-[#FFB800]/10', border: 'border-[#FFB800]/40', text: 'text-[#FFB800]', badge: 'bg-[#FFB800]/20 text-[#FFB800]' },
    low: { bg: 'bg-[#00D4FF]/10', border: 'border-[#00D4FF]/40', text: 'text-[#00D4FF]', badge: 'bg-[#00D4FF]/20 text-[#00D4FF]' },
  };

  return (
    <AnimatePresence>
      {visible && displayedEvent && (
        <motion.div
          key={displayedEvent.id}
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-4 left-1/2 z-50 pointer-events-none"
          style={{ transform: 'translateX(-50%)' }}
        >
          <div className={`
            rounded-xl border px-5 py-3 flex items-center gap-4 shadow-2xl
            ${severityColors[displayedEvent.severity].bg}
            ${severityColors[displayedEvent.severity].border}
          `}>
            <span className="text-3xl">{displayedEvent.icon}</span>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className={`font-mono font-bold text-sm ${severityColors[displayedEvent.severity].text}`}>
                  {displayedEvent.name}
                </span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full uppercase tracking-wide ${severityColors[displayedEvent.severity].badge}`}>
                  {displayedEvent.severity}
                </span>
              </div>
              <p className="text-slate-400 font-mono text-xs">{displayedEvent.description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
