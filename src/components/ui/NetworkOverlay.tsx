'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useJournalStore, type Sentiment } from '@/store/useJournalStore';
import { SENTIMENT_CONFIG, ALL_SENTIMENTS } from '@/lib/sentiments';

function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function NetworkOverlay() {
  const viewState = useJournalStore((s) => s.viewState);
  const viewMode = useJournalStore((s) => s.viewMode);
  const selectedEntryId = useJournalStore((s) => s.selectedEntryId);
  const entries = useJournalStore((s) => s.entries);

  // Only show on 3D view, when no entry is selected
  const isVisible = viewState === 'Network_View' && viewMode === '3d' && !selectedEntryId;

  const totalWords = entries.reduce((sum, e) => sum + e.content.split(/\s+/).filter(Boolean).length, 0);
  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const newestEntry = sorted[0] ?? null;

  const counts: Record<Sentiment, number> = {} as Record<Sentiment, number>;
  for (const s of ALL_SENTIMENTS) counts[s] = 0;
  for (const e of entries) counts[e.sentiment]++;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="network-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="absolute inset-0 pointer-events-none select-none"
          style={{ top: 86, zIndex: 25 }}
        >
          {/* ─── Bottom Left: Status ─── */}
          <div className="absolute bottom-20 left-8 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-[6px] h-[6px] rounded-full bg-emerald-400/60 animate-pulse" />
              <span
                className="font-mono uppercase text-white/40"
                style={{ fontSize: 10, letterSpacing: '0.15em' }}
              >
                System Active
              </span>
            </div>
          </div>

          {/* ─── Bottom Right: Instructions ─── */}
          <div className="absolute bottom-20 right-8 flex flex-col items-end gap-2 text-right max-w-[220px]">
            <span
              className="font-mono uppercase text-white/15"
              style={{ fontSize: 8, letterSpacing: '0.2em' }}
            >
              ////// Interact
            </span>
            <p
              className="font-mono uppercase text-white/25 leading-relaxed"
              style={{ fontSize: 9, letterSpacing: '0.12em' }}
            >
              Click a node to view. Scroll to travel through time.
            </p>
          </div>

          {/* ─── Vignette ─── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(5,5,8,0.5) 100%)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
