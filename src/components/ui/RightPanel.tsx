'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useJournalStore } from '@/store/useJournalStore';
import { SENTIMENT_CONFIG } from '@/lib/sentiments';
import { useEffect, useState, useMemo } from 'react';
import { generateIntelligenceInsight } from '@/app/actions';

export function RightPanel() {
  const viewState = useJournalStore((s) => s.viewState);
  const viewMode = useJournalStore((s) => s.viewMode);
  const entries = useJournalStore((s) => s.entries);
  const selectedEntryId = useJournalStore((s) => s.selectedEntryId);
  const selectEntry = useJournalStore((s) => s.selectEntry);

  const isVisible = viewState === 'Network_View' && viewMode === '3d' && !selectedEntryId;

  const recentEntries = useMemo(() => {
    return [...entries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [entries]);

  const [analysisText, setAnalysisText] = useState("Analyzing your recent mental patterns...");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!isVisible || recentEntries.length === 0) return;
    
    let isMounted = true;
    setIsAnalyzing(true);

    const mappedEntries = recentEntries.map(e => ({
      title: e.title,
      content: e.content,
      sentiment: e.sentiment,
      date: new Date(e.date).toISOString()
    }));

    generateIntelligenceInsight(mappedEntries)
      .then(insight => {
        if (isMounted) {
          setAnalysisText(insight);
          setIsAnalyzing(false);
        }
      })
      .catch(err => {
        console.error(err);
        if (isMounted) {
          setAnalysisText("We couldn't generate an insight at this moment. Keep mapping your thoughts.");
          setIsAnalyzing(false);
        }
      });

    return () => { isMounted = false; };
  }, [isVisible, recentEntries]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute z-40 flex flex-col gap-4 pointer-events-auto"
          style={{ right: 24, top: 100, bottom: 96, width: 300 }}
        >
          {/* ─── Intelligence ─── */}
          <section
            className="glass-strong flex-shrink-0 rounded-2xl shadow-2xl relative overflow-hidden"
            style={{ padding: '24px 28px' }}
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
            <h3
              className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-white/45 relative z-10"
              style={{ marginBottom: 16 }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400/60 shadow-[0_0_6px_rgba(129,140,248,0.5)]" />
              Intelligence
            </h3>
            <div
              className="rounded-xl border border-white/[0.04] bg-black/25 relative z-10"
              style={{ padding: '16px 18px' }}
            >
              <p className={`text-[13px] font-light leading-[1.7] text-white/70 transition-opacity duration-300 ${isAnalyzing ? 'opacity-50 animate-pulse' : 'opacity-100'}`}>
                {analysisText}
              </p>
            </div>
          </section>

          {/* ─── Recent Synapses ─── */}
          <section
            className="glass-strong flex min-h-0 flex-1 flex-col rounded-2xl shadow-2xl relative overflow-hidden"
            style={{ padding: '24px 28px' }}
          >
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/5 blur-[60px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />
            
            <div className="flex items-center justify-between relative z-10" style={{ marginBottom: 16 }}>
              <h3 className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">
                <span className="h-1 w-1 rounded-full bg-white/25" />
                Recent Synapses
              </h3>
              <span
                className="rounded-full border border-white/[0.08] bg-black/30 text-[8px] font-mono uppercase tracking-widest text-white/35"
                style={{ padding: '4px 10px' }}
              >
                {recentEntries.length} Latest
              </span>
            </div>

            <div className="flex-1 space-y-1.5 overflow-y-auto relative z-10">
              {recentEntries.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => selectEntry(entry.id)}
                  className="group w-full rounded-xl border border-white/[0.03] bg-black/20 text-left transition-all hover:border-white/[0.1] hover:bg-white/[0.03]"
                  style={{ padding: '12px 14px' }}
                >
                  <div className="flex items-center gap-3">
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
                      <div className="truncate text-[13px] font-medium tracking-wide text-white/75 transition-colors group-hover:text-white/95">
                        {entry.title}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/35 font-mono">
                        <span>{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span className="w-0.5 h-0.5 rounded-full bg-white/15" />
                        <span style={{ color: SENTIMENT_CONFIG[entry.sentiment].color, opacity: 0.7 }}>{entry.sentiment}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-white/[0.05] relative z-10" style={{ marginTop: 12, paddingTop: 12 }}>
              <p className="text-center text-[9px] font-mono uppercase tracking-[0.2em] text-white/25">
                Scroll & click nodes to explore
              </p>
            </div>
          </section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
