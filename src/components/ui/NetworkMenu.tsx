'use client';

import { useJournalStore } from '@/store/useJournalStore';
import { motion, AnimatePresence } from 'framer-motion';

export function NetworkMenu() {
  const viewState = useJournalStore((s) => s.viewState);
  const selectedEntryId = useJournalStore((s) => s.selectedEntryId);

  return (
    <AnimatePresence>
      {viewState === 'Network_View' && !selectedEntryId && (
        <motion.div
          key="network-menu"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
          style={{ width: 'max-content' }}
        >
          {/* Pill — padding is explicit px so text always has breathing room */}
          <div
            className="flex items-center gap-8 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl"
            style={{ padding: '0 32px', height: 44 }}
          >
            <span
              className="font-mono text-white/50 uppercase whitespace-nowrap"
              style={{ fontSize: 11, letterSpacing: '0.1em' }}
            >
              Neural Nodes
            </span>

            <div className="flex items-center gap-6">
              <button
                className="font-mono text-white/35 hover:text-white/80 transition-colors uppercase whitespace-nowrap"
                style={{ fontSize: 11, letterSpacing: '0.1em' }}
              >
                Themes
              </button>
              <button
                className="font-mono text-white/35 hover:text-white/80 transition-colors uppercase whitespace-nowrap"
                style={{ fontSize: 11, letterSpacing: '0.1em' }}
              >
                Filter
              </button>
              <div className="w-px h-3.5 bg-white/10" />
              <button
                className="font-mono text-white/70 hover:text-white transition-colors uppercase whitespace-nowrap"
                style={{ fontSize: 11, letterSpacing: '0.1em' }}
              >
                Menu
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
