'use server';

import type { Sentiment } from '@/store/useJournalStore';

export interface CreateEntryResult {
  id: string;
  title: string;
  content: string;
  sentiment: Sentiment;
  textLength: number;
  date: string;
  tags: string[];
}

const SENTIMENTS: Sentiment[] = ['Happy', 'Calm', 'Sad', 'Anxious', 'Frustrated', 'Neutral'];

export async function createEntry(title: string, content: string, tags: string[]): Promise<CreateEntryResult> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const sentiment = SENTIMENTS[Math.floor(Math.random() * SENTIMENTS.length)];
  return {
    id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title,
    content,
    sentiment,
    textLength: content.length,
    date: new Date().toISOString(),
    tags,
  };
}
