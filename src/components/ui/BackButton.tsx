'use client';

import { useJournalStore } from '@/store/useJournalStore';
import { motion, AnimatePresence } from 'framer-motion';

export function BackButton() {
  const viewState = useJournalStore((s) => s.viewState);
  const setViewState = useJournalStore((s) => s.setViewState);

  return (
    <AnimatePresence>
      {viewState === 'Network_View' && (
        <motion.button
          key="back-button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
          onClick={() => setViewState('Landing')}
          className="absolute top-8 left-8 md:top-12 md:left-12 w-12 h-12 rounded-full border border-white/20 bg-black/40 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 hover:border-white/40 transition-all z-50 cursor-pointer pointer-events-auto shadow-2xl"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
