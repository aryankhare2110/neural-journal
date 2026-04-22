'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useJournalStore } from '@/store/useJournalStore';
import { SENTIMENT_CONFIG } from '@/lib/sentiments';

const TOP_BAR_H = 86;

export function ListView() {
  const viewState = useJournalStore((s) => s.viewState);
  const viewMode = useJournalStore((s) => s.viewMode);
  const entries = useJournalStore((s) => s.entries);
  const selectedEntryId = useJournalStore((s) => s.selectedEntryId);
  const selectEntry = useJournalStore((s) => s.selectEntry);
  const setCameraTarget = useJournalStore((s) => s.setCameraTarget);
  const sentimentFilter = useJournalStore((s) => s.sentimentFilter);
  const tagFilter = useJournalStore((s) => s.tagFilter);

  const isVisible = viewState === 'Network_View' && viewMode === 'list';

  let sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (sentimentFilter) sorted = sorted.filter((e) => e.sentiment === sentimentFilter);
  if (tagFilter) sorted = sorted.filter((e) => e.tags.includes(tagFilter));

  // Group by month
  const groups: { label: string; entries: typeof sorted }[] = [];
  for (const entry of sorted) {
    const key = new Date(entry.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const last = groups[groups.length - 1];
    if (last && last.label === key) { last.entries.push(entry); }
    else { groups.push({ label: key, entries: [entry] }); }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="list-view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute left-0 right-0 bottom-0 flex flex-col pointer-events-auto"
          style={{ top: TOP_BAR_H, background: 'rgba(5,5,8,0.95)', backdropFilter: 'blur(24px)' }}
        >
          {/* Header */}
          <div className="flex-shrink-0 border-b border-white/[0.06] bg-white/[0.01]" style={{ padding: '20px 32px 16px' }}>
            <div className="flex items-end justify-between">
              <div>
                <p className="font-mono uppercase text-white/25 mb-1.5 flex items-center gap-2" style={{ fontSize: 9, letterSpacing: '0.2em' }}>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  Chronological Directory
                </p>
                <h2 className="font-semibold tracking-widest text-white/85" style={{ fontSize: 22 }}>
                  {sorted.length} {sorted.length === 1 ? 'Thought' : 'Thoughts'}
                </h2>
              </div>
              {(sentimentFilter || tagFilter) && (
                <div className="flex items-center gap-2">
                  {sentimentFilter && (
                    <span
                      className="flex items-center gap-1.5 rounded-full border font-mono uppercase bg-black/20"
                      style={{
                        fontSize: 9, letterSpacing: '0.12em', padding: '5px 12px',
                        borderColor: `${SENTIMENT_CONFIG[sentimentFilter].color}30`,
                        color: SENTIMENT_CONFIG[sentimentFilter].color,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: SENTIMENT_CONFIG[sentimentFilter].color }} />
                      {sentimentFilter}
                    </span>
                  )}
                  {tagFilter && (
                    <span
                      className="font-mono uppercase rounded-full border border-violet-500/25 bg-violet-500/[0.08] text-violet-200"
                      style={{ fontSize: 9, letterSpacing: '0.12em', padding: '5px 12px' }}
                    >
                      #{tagFilter}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-10 h-10 rounded-full border border-white/[0.08] bg-white/[0.03] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white/25" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                </div>
                <p className="font-mono uppercase text-white/25" style={{ fontSize: 10, letterSpacing: '0.2em' }}>
                  No thoughts match filters
                </p>
              </div>
            ) : (
              <div style={{ paddingBottom: 60 }} className="max-w-4xl mx-auto w-full pt-4">
                {groups.map((group) => (
                  <div key={group.label} className="mb-8">
                    {/* Month header */}
                    <div
                      className="sticky top-0 z-10 flex items-center gap-3 py-3"
                      style={{ padding: '12px 32px', background: 'linear-gradient(to bottom, rgba(5,5,8,0.97) 60%, rgba(5,5,8,0))' }}
                    >
                      <span className="font-mono uppercase text-white/35 flex-shrink-0" style={{ fontSize: 10, letterSpacing: '0.18em' }}>
                        {group.label}
                      </span>
                      <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-transparent" />
                      <span className="font-mono text-white/25 flex-shrink-0 bg-white/[0.04] px-2.5 py-0.5 rounded-full" style={{ fontSize: 9 }}>
                        {group.entries.length}
                      </span>
                    </div>

                    {/* Entries with timeline */}
                    <div className="relative mt-1">
                      <div className="absolute top-0 bottom-0 bg-white/[0.05]" style={{ left: 52, width: 2 }} />
                      <div className="space-y-2 px-3">
                        {group.entries.map((entry, _i) => {
                          const isSelected = selectedEntryId === entry.id;
                          const sc = SENTIMENT_CONFIG[entry.sentiment];
                          const wordCount = entry.content.split(/\s+/).filter(Boolean).length;
                          const readTime = Math.max(1, Math.ceil(wordCount / 200));
                          const globalIndex = sorted.indexOf(entry);

                          return (
                            <motion.button
                              key={entry.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: Math.min(globalIndex * 0.03, 0.3) }}
                              onClick={() => { selectEntry(isSelected ? null : entry.id); setCameraTarget(null); }}
                              className={`w-full text-left flex items-start rounded-xl border transition-all duration-300 group relative overflow-hidden ${
                                isSelected ? 'bg-white/[0.05] border-white/[0.08] shadow-lg' : 'bg-transparent border-transparent hover:bg-white/[0.02] hover:border-white/[0.04]'
                              }`}
                              style={{ padding: '18px 22px' }}
                            >
                              {isSelected && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-white/25 rounded-full" />}
                              
                              {/* Timeline dot */}
                              <div className="flex-shrink-0 relative flex items-center justify-center" style={{ width: 36, paddingTop: 2 }}>
                                <span
                                  className={`rounded-full border-2 border-[#0a0a0f] transition-transform duration-300 ${isSelected ? 'scale-125' : 'group-hover:scale-110'}`}
                                  style={{ width: 12, height: 12, backgroundColor: sc.color, boxShadow: `0 0 10px ${sc.color}50`, position: 'relative', zIndex: 2 }}
                                />
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0" style={{ paddingLeft: 12 }}>
                                <div className="flex items-center justify-between gap-3 mb-1.5">
                                  <h3 className="font-sans font-medium text-white/85 truncate" style={{ fontSize: 15 }}>
                                    {entry.title}
                                  </h3>
                                  <span className="font-mono uppercase text-white/25 flex-shrink-0" style={{ fontSize: 9, letterSpacing: '0.12em' }}>
                                    {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>

                                <p
                                  className="font-sans font-light text-white/50 group-hover:text-white/70 transition-colors mb-3"
                                  style={{ fontSize: 13, lineHeight: '1.65', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                                >
                                  {entry.content}
                                </p>

                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-mono uppercase flex items-center gap-1" style={{ fontSize: 9, letterSpacing: '0.12em', color: sc.color, opacity: 0.7 }}>
                                    <span className="w-1 h-1 rounded-full" style={{ backgroundColor: sc.color }} />
                                    {entry.sentiment}
                                  </span>
                                  <span className="w-0.5 h-0.5 rounded-full bg-white/10" />
                                  <span className="font-mono uppercase text-white/30" style={{ fontSize: 9, letterSpacing: '0.12em' }}>
                                    {wordCount}w · {readTime}m
                                  </span>
                                  
                                  {entry.tags.length > 0 && <span className="w-0.5 h-0.5 rounded-full bg-white/10 ml-1" />}
                                  {entry.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="font-mono uppercase text-violet-200/60 bg-violet-400/[0.08] border border-violet-400/15 rounded-full"
                                      style={{ fontSize: 8, letterSpacing: '0.08em', padding: '2px 8px' }}
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Arrow */}
                              <div className={`flex-shrink-0 self-center ml-3 transition-all duration-300 ${isSelected ? 'opacity-100 translate-x-0.5' : 'opacity-0 -translate-x-2 group-hover:opacity-30 group-hover:translate-x-0'}`}>
                                <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
