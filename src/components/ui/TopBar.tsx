'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
  const removeTag = useJournalStore((s) => s.removeTag);
  const renameTag = useJournalStore((s) => s.renameTag);
  const reorderTags = useJournalStore((s) => s.reorderTags);
  const entries = useJournalStore((s) => s.entries);
  const setViewState = useJournalStore((s) => s.setViewState);

  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ tag: string; x: number; y: number } | null>(null);
  const [renamingTag, setRenamingTag] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Drag state
  const [draggedTag, setDraggedTag] = useState<string | null>(null);
  const [dragOverTag, setDragOverTag] = useState<string | null>(null);

  const isVisible = viewState === 'Network_View';

  const handleAddTag = () => {
    const trimmed = newTagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      addTag(trimmed);
    }
    setNewTagInput('');
    setShowTagInput(false);
  };

  const handleContextMenu = (e: React.MouseEvent, tag: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ tag, x: e.clientX, y: e.clientY });
  };

  const handleRenameStart = (tag: string) => {
    setRenamingTag(tag);
    setRenameInput(tag);
    setContextMenu(null);
  };

  const handleRenameSubmit = () => {
    if (renamingTag && renameInput.trim()) {
      renameTag(renamingTag, renameInput.trim());
    }
    setRenamingTag(null);
    setRenameInput('');
  };

  const handleDelete = (tag: string) => {
    removeTag(tag);
    setContextMenu(null);
  };

  // Close context menu on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    if (contextMenu) {
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }
  }, [contextMenu]);

  // Focus rename input
  useEffect(() => {
    if (renamingTag && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingTag]);

  // Drag handlers
  const handleDragStart = useCallback((tag: string) => {
    setDraggedTag(tag);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, tag: string) => {
    e.preventDefault();
    if (tag !== draggedTag) {
      setDragOverTag(tag);
    }
  }, [draggedTag]);

  const handleDrop = useCallback((targetTag: string) => {
    if (!draggedTag || draggedTag === targetTag) return;
    const newTags = [...tags];
    const fromIdx = newTags.indexOf(draggedTag);
    const toIdx = newTags.indexOf(targetTag);
    newTags.splice(fromIdx, 1);
    newTags.splice(toIdx, 0, draggedTag);
    reorderTags(newTags);
    setDraggedTag(null);
    setDragOverTag(null);
  }, [draggedTag, tags, reorderTags]);

  const handleDragEnd = useCallback(() => {
    setDraggedTag(null);
    setDragOverTag(null);
  }, []);

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
              
              <div className="w-px h-4 bg-white/10 mx-2" />
              
              <button
                onClick={async () => {
                  const { createClient } = await import('@/utils/supabase/client');
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  useJournalStore.getState().setUser(null);
                  useJournalStore.getState().setViewState('Landing');
                }}
                className="text-white/30 hover:text-red-400 transition-colors flex items-center gap-1.5 ml-1"
                title="Log Out"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                </svg>
              </button>
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
              const isDragging = draggedTag === tag;
              const isDragOver = dragOverTag === tag;

              if (renamingTag === tag) {
                return (
                  <form
                    key={`rename-${tag}`}
                    onSubmit={(e) => { e.preventDefault(); handleRenameSubmit(); }}
                    className="flex-shrink-0"
                  >
                    <input
                      ref={renameInputRef}
                      type="text"
                      value={renameInput}
                      onChange={(e) => setRenameInput(e.target.value)}
                      onBlur={handleRenameSubmit}
                      onKeyDown={(e) => { if (e.key === 'Escape') { setRenamingTag(null); setRenameInput(''); } }}
                      className="font-mono uppercase rounded-full border border-violet-400/40 bg-violet-400/[0.1] text-violet-200 outline-none"
                      style={{ fontSize: 8, letterSpacing: '0.1em', padding: '3px 10px', width: 90 }}
                    />
                  </form>
                );
              }

              return (
                <button
                  key={tag}
                  draggable
                  onDragStart={() => handleDragStart(tag)}
                  onDragOver={(e) => handleDragOver(e, tag)}
                  onDrop={() => handleDrop(tag)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setTagFilter(active ? null : tag)}
                  onContextMenu={(e) => handleContextMenu(e, tag)}
                  className={`font-mono uppercase rounded-full flex-shrink-0 transition-all duration-150 border cursor-grab active:cursor-grabbing ${
                    isDragging ? 'opacity-30 scale-95' : ''
                  } ${isDragOver ? 'ring-1 ring-violet-400/40' : ''} ${
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

            {/* Add tag button — consistent with tag pill styling */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-1">
              <AnimatePresence mode="wait">
                {!showTagInput ? (
                  <motion.button
                    key="add-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowTagInput(true)}
                    className="font-mono uppercase rounded-full flex-shrink-0 transition-all duration-150 border text-white/20 hover:text-white/40 border-white/[0.05] hover:border-white/[0.1]"
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
                    className="overflow-hidden flex items-center border border-white/[0.05] rounded-full px-3 py-0.5"
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
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') { setShowTagInput(false); setNewTagInput(''); }
                        }}
                        className="flex-1 bg-transparent text-white/80 placeholder:text-white/20 font-mono outline-none text-[9px] lowercase tracking-wider"
                      />
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Context Menu */}
          <AnimatePresence>
            {contextMenu && (
              <motion.div
                ref={contextMenuRef}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.12 }}
                className="fixed z-[100] rounded-xl border border-white/[0.1] bg-[#0c0c12]/95 backdrop-blur-xl shadow-2xl overflow-hidden"
                style={{ left: contextMenu.x, top: contextMenu.y, minWidth: 160 }}
              >
                <div className="py-1.5">
                  <button
                    onClick={() => handleRenameStart(contextMenu.tag)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
                    style={{ fontSize: 12 }}
                  >
                    <svg className="w-3.5 h-3.5 text-white/40" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    <span className="font-mono uppercase tracking-wider" style={{ fontSize: 10 }}>Rename</span>
                  </button>
                  <button
                    onClick={() => handleDelete(contextMenu.tag)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-red-400/70 hover:text-red-300 hover:bg-red-500/[0.08] transition-colors"
                    style={{ fontSize: 12 }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                    <span className="font-mono uppercase tracking-wider" style={{ fontSize: 10 }}>Delete</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.header>
      )}
    </AnimatePresence>
  );
}
