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

          {/* Panel Content */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-[70] flex h-full w-[500px] flex-col border-l border-white/[0.08] bg-[#030305]/95 shadow-[-30px_0_60px_rgba(0,0,0,0.7)] backdrop-blur-3xl pointer-events-auto"
          >
            <div className="absolute top-0 right-0 w-96 h-96 blur-[100px] rounded-full pointer-events-none opacity-20" style={{ backgroundColor: config.color, transform: 'translate(30%, -30%)' }} />

            <header className="flex items-center justify-between border-b border-white/[0.06] px-10 py-8 relative z-10">
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
                <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-white/50">
                  {entry.sentiment} Perspective
                </span>
              </div>
              <button
                onClick={handleClose}
                className="group -mr-2 rounded-full border border-white/[0.05] bg-white/[0.02] p-2.5 text-white/40 transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div className="flex-1 space-y-10 overflow-y-auto px-10 py-10 relative z-10">
              <section className="space-y-4">
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/30">
                  {formatFullDate(entry.date)}
                </p>
                <h2 className="text-[36px] font-semibold leading-[1.1] tracking-tight text-white/95">
                  {entry.title}
                </h2>
              </section>

              <section className="rounded-[24px] border border-white/[0.04] bg-white/[0.02] p-8 shadow-inner relative overflow-hidden group hover:border-white/[0.08] transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/10 group-hover:bg-white/30 transition-colors" />
                <p className="text-[16px] font-light leading-[1.8] text-white/80 whitespace-pre-wrap">
                  {entry.content}
                </p>
              </section>

              <section className="grid grid-cols-2 gap-4">
                <div className="rounded-[24px] border border-white/[0.04] bg-black/40 p-6 flex flex-col justify-between hover:border-white/[0.08] transition-colors">
                  <span className="mb-4 block text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Metrics
                  </span>
                  <div>
                    <div className="flex items-end gap-2 mb-1">
                      <p className="text-3xl font-medium text-white">{wordCount}</p>
                      <p className="text-sm text-white/40 mb-1">words</p>
                    </div>
                    <p className="text-[11px] font-mono uppercase tracking-[0.15em] text-white/30 mt-2">
                      {readTime} min read
                    </p>
                  </div>
                </div>
                <div className="rounded-[24px] border border-white/[0.04] bg-black/40 p-6 flex flex-col justify-between hover:border-white/[0.08] transition-colors">
                  <span className="mb-4 block text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Intensity
                  </span>
                  <div className="mt-auto pb-1">
                    <div className="flex justify-between text-[10px] font-mono text-white/30 mb-2">
                      <span>Mild</span>
                      <span>Strong</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.05] border border-white/[0.05]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (entry.textLength / 300) * 100)}%` }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: config.color, boxShadow: `0 0 12px ${config.color}` }}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-[24px] border border-white/[0.04] bg-black/40 p-7 hover:border-white/[0.08] transition-colors">
                <div className="mb-6 flex items-center justify-between border-b border-white/[0.06] pb-4">
                  <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Synaptic Tags
                  </span>
                  <button
                    onClick={() => setIsEditingTags(!isEditingTags)}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-white/60 transition-all hover:bg-white/10 hover:text-white"
                  >
                    {isEditingTags ? 'Done' : 'Manage'}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {isEditingTags ? (
                    globalTags.map((tag) => {
                      const active = entry.tags.includes(tag);
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`rounded-full border px-4 py-2 text-[11px] font-mono uppercase tracking-[0.15em] transition-all ${
                            active
                              ? 'border-violet-500/50 bg-violet-500/20 text-violet-200'
                              : 'border-white/10 bg-white/5 text-white/40 hover:border-white/30 hover:text-white/80'
                          }`}
                        >
                          #{tag}
                        </button>
                      );
                    })
                  ) : entry.tags.length > 0 ? (
                    entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-mono uppercase tracking-[0.15em] text-white/70"
                      >
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-[12px] font-mono italic text-white/30">No tags assigned.</span>
                  )}
                </div>
              </section>
            </div>

            <footer className="flex gap-4 border-t border-white/[0.06] bg-black/60 px-10 py-8 relative z-10">
              <button className="group flex-1 rounded-2xl border border-white/10 bg-white/5 py-4 text-[11px] font-mono uppercase tracking-[0.25em] text-white/70 transition-all hover:bg-white/10 hover:border-white/20">
                <span className="group-hover:text-white transition-colors">Export Thought</span>
              </button>
              <button className="flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400/60 transition-all hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/40">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
