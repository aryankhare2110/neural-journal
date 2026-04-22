import type { Sentiment } from '@/store/useJournalStore';

/** Central sentiment color + styling config used by all UI components */
export const SENTIMENT_CONFIG: Record<Sentiment, {
  color: string;
  emissive: string;
  label: string;
}> = {
  Happy:      { color: '#4ade80', emissive: '#22c55e', label: 'Happy' },
  Calm:       { color: '#22d3ee', emissive: '#06b6d4', label: 'Calm' },
  Sad:        { color: '#60a5fa', emissive: '#3b82f6', label: 'Sad' },
  Anxious:    { color: '#f472b6', emissive: '#ec4899', label: 'Anxious' },
  Frustrated: { color: '#fb923c', emissive: '#f97316', label: 'Frustrated' },
  Neutral:    { color: '#94a3b8', emissive: '#64748b', label: 'Neutral' },
};

export const ALL_SENTIMENTS: Sentiment[] = ['Happy', 'Calm', 'Sad', 'Anxious', 'Frustrated', 'Neutral'];
