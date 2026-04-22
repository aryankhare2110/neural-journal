'use client';

import { useState, useTransition, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJournalStore } from '@/store/useJournalStore';
import { createEntry } from '@/app/actions';

export function ThoughtInput() {
  const viewState = useJournalStore((s) => s.viewState);
  const viewMode = useJournalStore((s) => s.viewMode);
  const selectedEntryId = useJournalStore((s) => s.selectedEntryId);
  const addEntry = useJournalStore((s) => s.addEntry);
  const globalTags = useJournalStore((s) => s.tags);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [showSuccess, setShowSuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const isVisible = viewState === 'Network_View' && viewMode === '3d' && !selectedEntryId;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPending) return;
    const currentTitle = title.trim() || 'Untitled Thought';
    const currentContent = content;
    const currentTags = [...selectedTags];
    setTitle(''); setContent(''); setSelectedTags([]); setIsExpanded(false);
    startTransition(async () => {
      const result = await createEntry(currentTitle, currentContent, currentTags);
      addEntry({
        id: result.id, title: result.title, content: result.content,
        sentiment: result.sentiment, textLength: result.textLength,
        date: new Date(result.date), tags: result.tags,
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="thought-input"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-6 left-0 right-0 z-50 pointer-events-none flex flex-col items-center"
        >
          <AnimatePresence>
            {showSuccess && (
              <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-3 font-mono uppercase text-emerald-400/60"
                style={{ fontSize: 9, letterSpacing: '0.2em' }}>
                ✦ Thought captured
              </motion.p>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="pointer-events-auto" style={{ width: 'min(560px, calc(100% - 48px))' }}>
            <motion.div
              animate={{
                borderColor: isExpanded ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)',
                boxShadow: isExpanded ? '0 0 0 1px rgba(167,139,250,0.1), 0 8px 40px rgba(0,0,0,0.5)' : '0 4px 24px rgba(0,0,0,0.35)',
              }}
              transition={{ duration: 0.2 }}
              className="flex flex-col rounded-2xl border overflow-hidden"
              style={{ background: 'rgba(5,5,8,0.82)', backdropFilter: 'blur(32px) saturate(1.4)' }}
            >
              {/* Title */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                      placeholder="Title (optional)" disabled={isPending}
                      className="w-full bg-transparent text-white/90 placeholder:text-white/20 font-sans font-medium leading-none outline-none disabled:opacity-40 border-b border-white/[0.06]"
                      style={{ fontSize: 13, padding: '12px 18px 10px' }} autoComplete="off" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Content */}
              <div className="flex items-start gap-3" style={{ padding: '11px 14px 11px 18px' }}>
                <svg className="w-4 h-4 text-white/20 flex-shrink-0 mt-[2px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
                <textarea ref={contentRef} value={content} onChange={(e) => setContent(e.target.value)}
                  onFocus={() => setIsExpanded(true)} placeholder="Capture a thought..." disabled={isPending}
                  rows={isExpanded ? 3 : 1}
                  className="flex-1 min-w-0 bg-transparent text-white/85 placeholder:text-white/20 font-sans font-light outline-none disabled:opacity-40 resize-none"
                  style={{ fontSize: 13, lineHeight: '1.6' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e as unknown as React.FormEvent);
                    if (e.key === 'Escape') { setIsExpanded(false); (e.target as HTMLTextAreaElement).blur(); }
                  }}
                />
                <div className="flex-shrink-0 flex items-center gap-2 self-end">
                  {isExpanded && (
                    <button type="button" onClick={() => { setIsExpanded(false); setTitle(''); setContent(''); setSelectedTags([]); }}
                      className="font-mono uppercase text-white/25 hover:text-white/50 transition-colors"
                      style={{ fontSize: 9, letterSpacing: '0.12em' }}>Cancel</button>
                  )}
                  <AnimatePresence mode="wait">
                    {(content.trim() || isPending) ? (
                      <motion.button key="send" type="submit" disabled={!content.trim() || isPending}
                        initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                        whileTap={{ scale: 0.88 }}
                        className="flex-shrink-0 w-8 h-8 rounded-xl border border-white/[0.12] bg-white/[0.06] flex items-center justify-center disabled:opacity-30 hover:bg-white/[0.12] hover:border-white/25 transition-colors">
                        {isPending ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-3.5 h-3.5 border border-white/20 border-t-white/70 rounded-full" />
                        ) : (
                          <svg className="w-3.5 h-3.5 text-white/70" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.27 20.875L5.999 12Zm0 0h7.5" />
                          </svg>
                        )}
                      </motion.button>
                    ) : (
                      <motion.span key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex-shrink-0 font-mono uppercase text-white/18 select-none" style={{ fontSize: 9, letterSpacing: '0.12em' }}>⌘↵</motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Tag selector (when expanded) */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-white/[0.06]">
                    <div className="flex items-center gap-1.5 flex-wrap" style={{ padding: '8px 18px 10px' }}>
                      <span className="font-mono uppercase text-white/15 mr-1" style={{ fontSize: 8, letterSpacing: '0.1em' }}>Tags:</span>
                      {globalTags.map((tag) => {
                        const active = selectedTags.includes(tag);
                        return (
                          <button key={tag} type="button" onClick={() => toggleTag(tag)}
                            className={`font-mono uppercase rounded-full border transition-all ${
                              active ? 'text-violet-300/80 bg-violet-400/[0.12] border-violet-400/25' : 'text-white/20 border-white/[0.06] hover:border-white/[0.12]'
                            }`}
                            style={{ fontSize: 8, letterSpacing: '0.08em', padding: '2px 8px' }}>
                            #{tag}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
