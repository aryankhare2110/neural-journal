'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useJournalStore } from '@/store/useJournalStore';

export function StatusIndicator() {
  const viewState = useJournalStore((s) => s.viewState);
  const entries = useJournalStore((s) => s.entries);

  return (
    <AnimatePresence>
      {viewState === 'Network_View' && (
        <motion.div
          key="status"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          // Moved to bottom-left but high enough to sit clearly above the Next.js dev badge
          className="absolute bottom-24 left-8 flex items-center gap-2.5 pointer-events-none"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/70 animate-pulse" />
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-white/40">
            {entries.length} Synapses Active
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
