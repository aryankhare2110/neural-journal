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
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

/* ─── Donut Chart ─── */
function DonutChart({ sentimentCounts, totalThoughts }: { sentimentCounts: Record<string, number>; totalThoughts: number }) {
  const size = 150;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  const activeSentiments = ALL_SENTIMENTS.filter(s => (sentimentCounts[s] || 0) > 0);
  const gapDeg = activeSentiments.length > 1 ? 4 : 0;
  const totalGapPct = (gapDeg * activeSentiments.length / 360) * 100;
  const availPct = 100 - totalGapPct;

  const segments: { sentiment: Sentiment; pct: number; color: string; offset: number }[] = [];
  let cOffset = 0;
  for (const s of ALL_SENTIMENTS) {
    const count = sentimentCounts[s] || 0;
    if (count === 0) continue;
    const pct = (count / totalThoughts) * availPct;
    segments.push({ sentiment: s, pct, color: SENTIMENT_CONFIG[s].color, offset: cOffset });
    cOffset += pct + (gapDeg / 360) * 100;
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
        {segments.map((seg, i) => {
          const dash = (seg.pct / 100) * circumference;
          const off = -(seg.offset / 100) * circumference;
          return (
            <motion.circle
              key={seg.sentiment}
              cx={center} cy={center} r={radius}
              fill="none" stroke={seg.color} strokeWidth={strokeWidth} strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={off}
              initial={{ strokeDasharray: `0 ${circumference}` }}
              animate={{ strokeDasharray: `${dash} ${circumference - dash}` }}
              transition={{ duration: 0.9, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{ filter: `drop-shadow(0 0 5px ${seg.color}50)` }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-semibold text-white/85 tracking-tight">{totalThoughts}</span>
        <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-white/30 mt-0.5">entries</span>
      </div>
    </div>
  );
}

export function LeftPanel() {
  const viewState = useJournalStore((s) => s.viewState);
  const viewMode = useJournalStore((s) => s.viewMode);
  const entries = useJournalStore((s) => s.entries);
  const selectedEntryId = useJournalStore((s) => s.selectedEntryId);

  const isVisible = viewState === 'Network_View' && viewMode === '3d' && !selectedEntryId;

  const totalThoughts = entries.length;
  const totalWords = entries.reduce((acc, e) => acc + e.content.split(/\s+/).filter(Boolean).length, 0);
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
          className="absolute z-40 flex flex-col gap-4 pointer-events-auto"
          style={{ left: 24, top: 100, bottom: 96, width: 300 }}
        >
          {/* ─── Metrics Overview ─── */}
          <section
            className="glass-strong flex-shrink-0 rounded-2xl shadow-2xl overflow-hidden relative"
            style={{ padding: '28px 28px 24px 28px' }}
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-white/5 blur-[50px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />

            <div className="flex items-center justify-between relative z-10" style={{ marginBottom: 20 }}>
              <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">
                Metrics Overview
              </h3>
              {newestEntry && (
                <span className="rounded-full border border-white/[0.08] bg-black/30 text-[8px] font-mono uppercase tracking-widest text-white/40" style={{ padding: '4px 10px' }}>
                  Last: {formatRelativeDate(newestEntry.date)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
              {metrics.map((m) => (
                <article
                  key={m.label}
                  className="group rounded-xl border border-white/[0.04] bg-black/25 transition-all hover:bg-black/40 hover:border-white/[0.08]"
                  style={{ padding: '16px 16px' }}
                >
                  <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
                    <span className="h-1 w-1 rounded-full bg-white/20 group-hover:bg-white/40 transition-colors" />
                    <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-white/35">
                      {m.label}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-semibold tracking-tight text-white/85">{m.value}</span>
                    {m.suffix && <span className="text-xs text-white/35">{m.suffix}</span>}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* ─── Mood Patterns (Donut) ─── */}
          <section
            className="glass-strong flex min-h-0 flex-1 flex-col rounded-2xl shadow-2xl relative overflow-hidden"
            style={{ padding: '24px 28px' }}
          >
            <div className="absolute bottom-0 left-0 w-36 h-36 bg-white/5 blur-[60px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />

            <div className="flex items-center justify-between relative z-10" style={{ marginBottom: 16 }}>
              <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/45">
                Mood Patterns
              </h3>
              <span className="text-[9px] font-mono uppercase tracking-widest text-white/25">
                Distribution
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative z-10 overflow-y-auto">
              <div style={{ marginBottom: 16 }}>
                <DonutChart sentimentCounts={sentimentCounts} totalThoughts={totalThoughts} />
              </div>

              <div className="grid grid-cols-2 gap-x-5 gap-y-2 w-full">
                {ALL_SENTIMENTS.map((s) => {
                  const count = sentimentCounts[s] || 0;
                  const pct = totalThoughts > 0 ? (count / totalThoughts) * 100 : 0;
                  return (
                    <div key={s} className="flex items-center gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: SENTIMENT_CONFIG[s].color, boxShadow: `0 0 5px ${SENTIMENT_CONFIG[s].color}40` }}
                      />
                      <span className="text-[10px] font-medium tracking-wide text-white/55 truncate flex-1">
                        {s}
                      </span>
                      <span className="text-[9px] font-mono text-white/30 flex-shrink-0">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
