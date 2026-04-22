'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJournalStore, type Sentiment, type ViewMode } from '@/store/useJournalStore';
import { SENTIMENT_CONFIG, ALL_SENTIMENTS } from '@/lib/sentiments';

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: '3d', label: '3D' },
  { value: 'list', label: 'List' },
];

export function TopBar() {
  const viewState = useJournalStore((s) => s.viewState);
  const viewMode = useJournalStore((s) => s.viewMode);
  const setViewMode = useJournalStore((s) => s.setViewMode);
  const sentimentFilter = useJournalStore((s) => s.sentimentFilter);
  const setSentimentFilter = useJournalStore((s) => s.setSentimentFilter);
  const tagFilter = useJournalStore((s) => s.tagFilter);
  const setTagFilter = useJournalStore((s) => s.setTagFilter);
  const tags = useJournalStore((s) => s.tags);
  const addTag = useJournalStore((s) => s.addTag);
  const entries = useJournalStore((s) => s.entries);
  const setViewState = useJournalStore((s) => s.setViewState);

  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  const isVisible = viewState === 'Network_View';

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      addTag(trimmed);
    }
    setNewTagInput('');
    setShowTagInput(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.header
          key="topbar"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-0 left-0 right-0 z-40 pointer-events-auto select-none"
          style={{
            background: 'rgba(5,5,8,0.75)',
            backdropFilter: 'blur(24px) saturate(1.3)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Main row */}
          <div className="flex items-center justify-between relative" style={{ height: 52, padding: '0 24px' }}>
            {/* Left: Branding + back */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewState('Landing')}
                className="text-white/30 hover:text-white/70 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="font-semibold tracking-[0.12em] text-white/85" style={{ fontSize: 14 }}>
                Neural Journal
              </h1>
              <span className="w-px h-4 bg-white/10" />
              <span className="font-mono uppercase text-white/25" style={{ fontSize: 9, letterSpacing: '0.15em' }}>
                {entries.length} thoughts
              </span>
            </div>

            {/* Center: View Mode Switcher */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center rounded-lg border border-white/[0.08] bg-white/[0.03] overflow-hidden">
              {VIEW_MODES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setViewMode(value)}
                  className={`relative font-mono uppercase transition-all duration-200 ${
                    viewMode === value
                      ? 'text-white/90 bg-white/[0.1]'
                      : 'text-white/30 hover:text-white/60 hover:bg-white/[0.04]'
                  }`}
                  style={{ fontSize: 10, letterSpacing: '0.14em', padding: '8px 18px' }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Right: Sentiment Filter Pills */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSentimentFilter(null)}
                className={`font-mono uppercase rounded-full transition-all duration-150 ${
                  sentimentFilter === null
                    ? 'text-white/80 bg-white/[0.1] border border-white/[0.15]'
                    : 'text-white/25 hover:text-white/50 border border-transparent'
                }`}
                style={{ fontSize: 9, letterSpacing: '0.12em', padding: '5px 12px' }}
              >
                All
              </button>
              {ALL_SENTIMENTS.map((s) => {
                const cfg = SENTIMENT_CONFIG[s];
                const active = sentimentFilter === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSentimentFilter(active ? null : s)}
                    className={`flex items-center gap-1.5 rounded-full transition-all duration-150 border ${
                      active
                        ? 'bg-white/[0.08] border-white/[0.12]'
                        : 'border-transparent hover:bg-white/[0.04]'
                    }`}
                    style={{ padding: '5px 10px' }}
                  >
                    <span
                      className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: cfg.color,
                        boxShadow: active ? `0 0 6px ${cfg.color}80` : 'none',
                      }}
                    />
                    <span
                      className="font-mono uppercase"
                      style={{
                        fontSize: 8,
                        letterSpacing: '0.1em',
                        color: active ? cfg.color : 'rgba(255,255,255,0.3)',
                      }}
                    >
                      {s}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secondary row: Tag filters */}
          <div
            className="flex items-center gap-2 border-t border-white/[0.04] overflow-x-auto no-scrollbar"
            style={{ padding: '6px 24px', height: 34 }}
          >
            <span
              className="font-mono uppercase text-white/15 flex-shrink-0 mr-1"
              style={{ fontSize: 8, letterSpacing: '0.15em' }}
            >
              Tags
            </span>

            <button
              onClick={() => setTagFilter(null)}
              className={`font-mono uppercase rounded-full flex-shrink-0 transition-all duration-150 ${
                tagFilter === null
                  ? 'text-white/60 bg-white/[0.08] border border-white/[0.12]'
                  : 'text-white/20 hover:text-white/40 border border-transparent'
              }`}
              style={{ fontSize: 8, letterSpacing: '0.1em', padding: '3px 10px' }}
            >
              all
            </button>

            {tags.map((tag) => {
              const active = tagFilter === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setTagFilter(active ? null : tag)}
                  className={`font-mono uppercase rounded-full flex-shrink-0 transition-all duration-150 border ${
                    active
                      ? 'text-violet-300/80 bg-violet-400/[0.1] border-violet-400/20'
                      : 'text-white/20 hover:text-white/40 border-white/[0.05] hover:border-white/[0.1]'
                  }`}
                  style={{ fontSize: 8, letterSpacing: '0.1em', padding: '3px 10px' }}
                >
                  #{tag}
                </button>
              );
            })}

            {/* Add tag inline interaction */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <AnimatePresence mode="wait">
                {!showTagInput ? (
                  <motion.button
                    key="add-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowTagInput(true)}
                    className="flex items-center justify-center gap-1 font-mono uppercase text-white/50 hover:text-white transition-all rounded-full border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10 whitespace-nowrap flex-shrink-0"
                    style={{ fontSize: 8, letterSpacing: '0.1em', padding: '3px 10px' }}
                  >
                    + tag
                  </motion.button>
                ) : (
                  <motion.div
                    key="add-input"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 140, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="overflow-hidden flex items-center bg-white/5 border border-white/10 rounded-full px-3 py-1"
                  >
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleAddTag();
                      }}
                      className="flex items-center w-full"
                    >
                      <input
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        placeholder="new tag..."
                        autoFocus
                        onBlur={() => {
                          if (!newTagInput) setShowTagInput(false);
                        }}
                        className="flex-1 bg-transparent text-white/80 placeholder:text-white/20 font-mono outline-none text-[9px] lowercase tracking-wider"
                      />
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
