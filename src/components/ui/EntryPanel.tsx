'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJournalStore } from '@/store/useJournalStore';
import { SENTIMENT_CONFIG } from '@/lib/sentiments';

function formatFullDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function EntryPanel() {
  const entries = useJournalStore((s) => s.entries);
  const selectedEntryId = useJournalStore((s) => s.selectedEntryId);
  const selectEntry = useJournalStore((s) => s.selectEntry);
  const setCameraTarget = useJournalStore((s) => s.setCameraTarget);
  const globalTags = useJournalStore((s) => s.tags);
  const updateEntryTags = useJournalStore((s) => s.updateEntryTags);

  const entry = entries.find((e) => e.id === selectedEntryId) ?? null;
  const [isEditingTags, setIsEditingTags] = useState(false);

  const handleClose = () => {
    selectEntry(null);
    setCameraTarget(null);
    setIsEditingTags(false);
  };

  const toggleTag = (tag: string) => {
    if (!entry) return;
    const newTags = entry.tags.includes(tag)
      ? entry.tags.filter((t) => t !== tag)
      : [...entry.tags, tag];
    updateEntryTags(entry.id, newTags);
  };

  if (!entry) return null;

  const config = SENTIMENT_CONFIG[entry.sentiment];
  const wordCount = entry.content.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const intensityPct = Math.min(100, (entry.textLength / 300) * 100);

  return (
    <AnimatePresence>
      {entry && (
        <>
          {/* Background Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] pointer-events-auto"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-[70] flex h-full flex-col border-l border-white/[0.08] bg-[#060609]/95 shadow-[-30px_0_60px_rgba(0,0,0,0.7)] backdrop-blur-3xl pointer-events-auto"
            style={{ width: '100%', maxWidth: 480 }}
          >
            {/* Ambient glow */}
            <div
              className="absolute top-0 right-0 w-80 h-80 blur-[120px] rounded-full pointer-events-none opacity-15"
              style={{ backgroundColor: config.color, transform: 'translate(30%, -30%)' }}
            />

            {/* ─── Header ─── */}
            <header
              className="flex-shrink-0 flex items-center justify-between border-b border-white/[0.06] relative z-10"
              style={{ padding: '20px 32px' }}
            >
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center h-4 w-4">
                  <div
                    className="absolute inset-0 rounded-full opacity-40 blur-[6px]"
                    style={{ backgroundColor: config.color }}
                  />
                  <div
                    className="h-2.5 w-2.5 rounded-full relative z-10"
                    style={{ backgroundColor: config.color, boxShadow: `0 0 12px ${config.color}` }}
                  />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-white/50">
                  {entry.sentiment} Perspective
                </span>
              </div>
              <button
                onClick={handleClose}
                className="group rounded-full border border-white/[0.08] bg-white/[0.03] p-2 text-white/40 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                <svg className="w-4 h-4 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            {/* ─── Scrollable Content ─── */}
            <div className="flex-1 overflow-y-auto relative z-10">
              <div style={{ padding: '32px 32px 40px 32px' }}>

                {/* Title & Date */}
                <section style={{ marginBottom: 28 }}>
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30" style={{ marginBottom: 10 }}>
                    {formatFullDate(entry.date)}
                  </p>
                  <h2 className="text-[28px] font-semibold leading-[1.15] tracking-tight text-white/95">
                    {entry.title}
                  </h2>
                </section>

                {/* Content Block */}
                <section
                  className="rounded-2xl border border-white/[0.05] bg-white/[0.02] relative overflow-hidden group hover:border-white/[0.08] transition-colors"
                  style={{ padding: '24px 28px', marginBottom: 24 }}
                >
                  <div
                    className="absolute top-0 bottom-0 bg-white/[0.06] group-hover:bg-white/20 transition-colors"
                    style={{ left: 0, width: 3, borderRadius: 2 }}
                  />
                  <p className="text-[15px] font-light leading-[1.85] text-white/75 whitespace-pre-wrap">
                    {entry.content}
                  </p>
                </section>

                {/* Metrics Row */}
                <section className="grid grid-cols-2 gap-3" style={{ marginBottom: 24 }}>
                  {/* Word Count */}
                  <div
                    className="rounded-2xl border border-white/[0.05] bg-white/[0.02] flex flex-col hover:border-white/[0.08] transition-colors"
                    style={{ padding: '20px 22px' }}
                  >
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/35 flex items-center gap-1.5" style={{ marginBottom: 16 }}>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Metrics
                    </span>
                    <div className="mt-auto">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-semibold text-white/90 tracking-tight">{wordCount}</span>
                        <span className="text-[12px] text-white/35">words</span>
                      </div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-white/25" style={{ marginTop: 6 }}>
                        {readTime} min read
                      </p>
                    </div>
                  </div>

                  {/* Intensity */}
                  <div
                    className="rounded-2xl border border-white/[0.05] bg-white/[0.02] flex flex-col hover:border-white/[0.08] transition-colors"
                    style={{ padding: '20px 22px' }}
                  >
                    <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-white/35 flex items-center gap-1.5" style={{ marginBottom: 16 }}>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Intensity
                    </span>
                    <div className="mt-auto">
                      <div className="flex justify-between text-[9px] font-mono text-white/25" style={{ marginBottom: 8 }}>
                        <span>Mild</span>
                        <span>Strong</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${intensityPct}%` }}
                          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: config.color, boxShadow: `0 0 10px ${config.color}` }}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Tags */}
                <section
                  className="rounded-2xl border border-white/[0.05] bg-white/[0.02] hover:border-white/[0.08] transition-colors"
                  style={{ padding: '22px 24px' }}
                >
                  <div
                    className="flex items-center justify-between border-b border-white/[0.05]"
                    style={{ paddingBottom: 14, marginBottom: 16 }}
                  >
                    <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Synaptic Tags
                    </span>
                    <button
                      onClick={() => setIsEditingTags(!isEditingTags)}
                      className="rounded-full border border-white/[0.08] bg-white/[0.03] text-[9px] font-mono uppercase tracking-[0.18em] text-white/50 transition-all hover:bg-white/[0.08] hover:text-white/80"
                      style={{ padding: '5px 14px' }}
                    >
                      {isEditingTags ? 'Done' : 'Manage'}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {isEditingTags ? (
                      globalTags.map((tag) => {
                        const active = entry.tags.includes(tag);
                        return (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`rounded-full border text-[10px] font-mono uppercase tracking-[0.12em] transition-all ${
                              active
                                ? 'border-violet-500/40 bg-violet-500/15 text-violet-200'
                                : 'border-white/[0.08] bg-white/[0.03] text-white/35 hover:border-white/20 hover:text-white/70'
                            }`}
                            style={{ padding: '6px 14px' }}
                          >
                            #{tag}
                          </button>
                        );
                      })
                    ) : entry.tags.length > 0 ? (
                      entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/[0.08] bg-white/[0.03] text-[10px] font-mono uppercase tracking-[0.12em] text-white/60"
                          style={{ padding: '6px 14px' }}
                        >
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] font-mono italic text-white/25">No tags assigned.</span>
                    )}
                  </div>
                </section>
              </div>
            </div>

            {/* ─── Footer ─── */}
            <footer
              className="flex-shrink-0 flex gap-3 border-t border-white/[0.06] bg-black/40 relative z-10"
              style={{ padding: '20px 32px' }}
            >
              <button
                className="group flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] text-[10px] font-mono uppercase tracking-[0.2em] text-white/60 transition-all hover:bg-white/[0.08] hover:border-white/15 hover:text-white"
                style={{ padding: '14px 0' }}
              >
                Export Thought
              </button>
              <button
                className="flex items-center justify-center rounded-xl border border-red-500/15 bg-red-500/[0.06] text-red-400/50 transition-all hover:bg-red-500/15 hover:text-red-300 hover:border-red-500/30"
                style={{ width: 48, height: 48 }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
