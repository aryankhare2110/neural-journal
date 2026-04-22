'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useJournalStore } from '@/store/useJournalStore';
import { SENTIMENT_CONFIG } from '@/lib/sentiments';

export function RightPanel() {
  const viewState = useJournalStore((s) => s.viewState);
  const viewMode = useJournalStore((s) => s.viewMode);
  const entries = useJournalStore((s) => s.entries);
  const selectedEntryId = useJournalStore((s) => s.selectedEntryId);
  const selectEntry = useJournalStore((s) => s.selectEntry);

  const isVisible = viewState === 'Network_View' && viewMode === '3d' && !selectedEntryId;

  const recentEntries = [...entries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const recentSentiments = recentEntries.map(e => e.sentiment);
  let analysisText = "You've been navigating various states of mind recently. Keep mapping your thoughts to uncover deeper patterns.";
  
  if (recentSentiments.length > 0) {
    const mostFrequent = recentSentiments.sort((a,b) =>
      recentSentiments.filter(v => v===a).length
      - recentSentiments.filter(v => v===b).length
    ).pop();
    
    if (mostFrequent === 'Anxious' || mostFrequent === 'Sad' || mostFrequent === 'Frustrated') {
      analysisText = `Noticeable ${mostFrequent.toLowerCase()} patterns recently. Consider taking a moment for yourself or exploring these thoughts deeper.`;
    } else if (mostFrequent === 'Happy' || mostFrequent === 'Calm') {
      analysisText = `Your recent thoughts reflect a ${mostFrequent.toLowerCase()} state. Great job maintaining this positive balance.`;
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-8 top-28 bottom-28 z-40 flex w-[360px] flex-col gap-6 pointer-events-auto"
        >
          <section className="glass-strong rounded-[28px] border border-white/10 p-7 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
            <h3 className="mb-5 flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.2em] text-white/50 relative z-10">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/60 shadow-[0_0_8px_rgba(129,140,248,0.6)]" />
              Intelligence
            </h3>
            <div className="rounded-2xl border border-white/[0.04] bg-black/20 p-5 relative z-10">
              <p className="text-[14px] font-light leading-relaxed text-white/80">
                {analysisText}
              </p>
            </div>
          </section>

          <section className="glass-strong flex min-h-0 flex-1 flex-col rounded-[28px] border border-white/10 p-7 shadow-2xl relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 blur-[60px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />
            
            <div className="mb-6 flex items-center justify-between relative z-10">
              <h3 className="flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.2em] text-white/50">
                <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                Recent Synapses
              </h3>
              <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest text-white/50">
                10 Latest
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-2 relative z-10">
              {recentEntries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => selectEntry(entry.id)}
                  className="group w-full rounded-2xl border border-white/[0.03] bg-black/20 px-5 py-4 text-left transition-all hover:border-white/15 hover:bg-white/[0.04] hover:-translate-y-0.5"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-2 w-2 shrink-0">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: SENTIMENT_CONFIG[entry.sentiment].color }}
                      />
                      <div
                        className="absolute inset-0 rounded-full opacity-0 blur-md transition-opacity group-hover:opacity-100"
                        style={{ backgroundColor: SENTIMENT_CONFIG[entry.sentiment].color, transform: 'scale(2)' }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[14px] font-medium tracking-wide text-white/80 transition-colors group-hover:text-white">
                        {entry.title}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-white/40 font-mono">
                        <span>{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span style={{ color: SENTIMENT_CONFIG[entry.sentiment].color, opacity: 0.8 }}>{entry.sentiment}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 border-t border-white/[0.06] pt-5 relative z-10">
              <p className="text-center text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">
                Scroll & click nodes to explore
              </p>
            </div>
          </section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
