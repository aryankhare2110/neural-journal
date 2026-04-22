'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useJournalStore, type Sentiment } from '@/store/useJournalStore';
import { SENTIMENT_CONFIG, ALL_SENTIMENTS } from '@/lib/sentiments';

function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;
  
  const uniqueDateStrings = Array.from(new Set(dates.map(d => d.toDateString()))).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let currentCheck = new Date(today);
  
  if (uniqueDateStrings.includes(currentCheck.toDateString())) {
    streak++;
    currentCheck.setDate(currentCheck.getDate() - 1);
  } else {
    currentCheck.setDate(currentCheck.getDate() - 1);
    if (uniqueDateStrings.includes(currentCheck.toDateString())) {
      streak++;
      currentCheck.setDate(currentCheck.getDate() - 1);
    } else {
      return 0;
    }
  }

  while (uniqueDateStrings.includes(currentCheck.toDateString())) {
    streak++;
    currentCheck.setDate(currentCheck.getDate() - 1);
  }

  return streak;
}

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

export function LeftPanel() {
  const viewState = useJournalStore((s) => s.viewState);
  const viewMode = useJournalStore((s) => s.viewMode);
  const entries = useJournalStore((s) => s.entries);
  const selectedEntryId = useJournalStore((s) => s.selectedEntryId);

  const isVisible = viewState === 'Network_View' && viewMode === '3d' && !selectedEntryId;

  const totalThoughts = entries.length;
  const totalWords = entries.reduce((acc, entry) => acc + entry.content.split(/\s+/).filter(Boolean).length, 0);
  
  const dates = entries.map(e => new Date(e.date));
  const uniqueDays = new Set(dates.map(d => d.toDateString())).size;
  const streak = calculateStreak(dates);

  const sorted = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const newestEntry = sorted[0] ?? null;

  const sentimentCounts = entries.reduce((acc, entry) => {
    acc[entry.sentiment] = (acc[entry.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<Sentiment, number>);
  const metrics = [
    { label: 'Synapses', value: totalThoughts.toString() },
    { label: 'Words', value: totalWords.toString() },
    { label: 'Days', value: uniqueDays.toString() },
    { label: 'Streak', value: streak.toString(), suffix: '🔥' },
  ];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-8 top-28 bottom-28 z-40 flex w-[360px] flex-col gap-6 pointer-events-auto"
        >
          <section className="glass-strong flex-shrink-0 rounded-[28px] border border-white/10 p-7 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[50px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
            
            <div className="mb-7 flex items-center justify-between relative z-10">
              <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
                Metrics Overview
              </h3>
              {newestEntry && (
                <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[10px] font-medium uppercase tracking-widest text-white/50">
                  Last: {formatRelativeDate(newestEntry.date)}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 relative z-10">
              {metrics.map((metric) => (
                <article
                  key={metric.label}
                  className="group rounded-2xl border border-white/[0.04] bg-black/20 px-5 py-5 transition-all hover:bg-black/40 hover:border-white/10"
                >
                  <div className="mb-4 flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/20 group-hover:bg-white/40 transition-colors" />
                    <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/40">
                      {metric.label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-semibold tracking-tight text-white/90">
                      {metric.value}
                    </span>
                    {metric.suffix && (
                      <span className="text-sm font-medium text-white/40">{metric.suffix}</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="glass-strong flex min-h-0 flex-1 flex-col rounded-[28px] border border-white/10 p-7 shadow-2xl relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 blur-[60px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />
            
            <div className="mb-7 flex items-center justify-between relative z-10">
              <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-white/50">
                Mood Patterns
              </h3>
              <span className="text-[10px] font-medium uppercase tracking-widest text-white/30">
                Distribution
              </span>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto pr-2 relative z-10">
              {ALL_SENTIMENTS.map((sentiment) => {
                const count = sentimentCounts[sentiment] || 0;
                const percentage = totalThoughts > 0 ? (count / totalThoughts) * 100 : 0;
                const config = SENTIMENT_CONFIG[sentiment];

                return (
                  <div key={sentiment} className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: config.color, boxShadow: `0 0 8px ${config.color}60` }}
                        />
                        <span className="text-[13px] font-medium tracking-wide text-white/70">
                          {sentiment}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-white/40">
                        {count} <span className="opacity-50">({percentage.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-black/40 border border-white/[0.02]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.85, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{
                          backgroundColor: config.color,
                          boxShadow: `0 0 10px ${config.color}80`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
