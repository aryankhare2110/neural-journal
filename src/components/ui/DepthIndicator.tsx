'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useSpring, motionValue } from 'framer-motion';
import { useJournalStore } from '@/store/useJournalStore';

export const scrollDepthMV = motionValue(0);

export function DepthIndicator() {
  const viewState = useJournalStore((s) => s.viewState);
  const viewMode = useJournalStore((s) => s.viewMode);
  const selectedEntryId = useJournalStore((s) => s.selectedEntryId);
  const entries = useJournalStore((s) => s.entries);
  const [showHint, setShowHint] = useState(true);

  const springDepth = useSpring(scrollDepthMV, { stiffness: 90, damping: 20 });

  useEffect(() => {
    return scrollDepthMV.on('change', (v) => {
      if (v > 0.02) setShowHint(false);
    });
  }, []);

  useEffect(() => {
    if (viewState === 'Network_View') setShowHint(true);
  }, [viewState]);

  const isVisible =
    viewState === 'Network_View' && viewMode === '3d' && !selectedEntryId;

  const dates = entries.map((e) => new Date(e.date).getTime());
  const oldest = dates.length ? new Date(Math.min(...dates)) : null;
  const newest = dates.length ? new Date(Math.max(...dates)) : null;
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="depth-indicator"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="absolute top-24 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30"
        >
          <div className="flex items-center gap-4">
            {newest && (
              <span className="font-mono text-[8px] tracking-widest uppercase text-white/20 whitespace-nowrap">
                {fmt(newest)}
              </span>
            )}

            <div className="relative h-px w-64 rounded-full bg-white/[0.07] overflow-hidden">
              <motion.div
                className="absolute top-0 left-0 h-full rounded-full bg-white/40"
                style={{ scaleX: springDepth, originX: 0, width: '100%' }}
              />
            </div>

            {oldest && (
              <span className="font-mono text-[8px] tracking-widest uppercase text-white/20 whitespace-nowrap">
                {fmt(oldest)}
              </span>
            )}
          </div>

          <AnimatePresence>
            {showHint && (
              <motion.div
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.4 } }}
                className="absolute top-full mt-2 flex flex-col items-center gap-1"
              >
                <motion.svg
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-3 h-3 text-white/25"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </motion.svg>
                <span className="font-mono text-[8px] tracking-widest uppercase text-white/18 whitespace-nowrap">
                  Scroll
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
