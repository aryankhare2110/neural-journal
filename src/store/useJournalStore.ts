'use client';

import { create } from 'zustand';

// ---------- Types ----------
export type Sentiment = 'Happy' | 'Calm' | 'Sad' | 'Anxious' | 'Frustrated' | 'Neutral';
export type ViewState = 'Landing' | 'Transitioning' | 'Network_View';
export type ViewMode = '3d' | 'list';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  sentiment: Sentiment;
  textLength: number;
  date: Date;
  tags: string[];
}

interface JournalState {
  viewState: ViewState;
  setViewState: (state: ViewState) => void;

  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  sentimentFilter: Sentiment | null;
  setSentimentFilter: (s: Sentiment | null) => void;

  tagFilter: string | null;
  setTagFilter: (t: string | null) => void;

  // Global tag pool
  tags: string[];
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;

  entries: JournalEntry[];
  addEntry: (entry: JournalEntry) => void;
  updateEntryTags: (id: string, tags: string[]) => void;

  selectedEntryId: string | null;
  selectEntry: (id: string | null) => void;

  cameraTarget: [number, number, number] | null;
  setCameraTarget: (target: [number, number, number] | null) => void;
}

// ---------- Dummy data ----------
const INITIAL_TAGS = ['work', 'personal', 'health', 'creativity', 'reflection'];

const DUMMY_ENTRIES: JournalEntry[] = [
  {
    id: 'entry-1',
    title: 'Project Complete',
    content: 'Today was incredible. I finally finished the project I have been working on for months. The feeling of completion is unlike anything else — pure satisfaction.',
    sentiment: 'Happy',
    textLength: 156,
    date: new Date('2026-04-06'),
    tags: ['work', 'creativity'],
  },
  {
    id: 'entry-2',
    title: 'Overwhelmed',
    content: 'Feeling a bit overwhelmed with everything on my plate. Deadlines are piling up and I am not sure I can keep up with all of it. Need to take things one step at a time.',
    sentiment: 'Anxious',
    textLength: 168,
    date: new Date('2026-04-04'),
    tags: ['work'],
  },
  {
    id: 'entry-3',
    title: 'Missing Home',
    content: 'Missing home. It has been too long since I visited.',
    sentiment: 'Sad',
    textLength: 52,
    date: new Date('2026-04-01'),
    tags: ['personal'],
  },
  {
    id: 'entry-4',
    title: 'Simple Joys',
    content: 'Had the best coffee this morning and spent the afternoon reading in the park. Sometimes the simple things are the most fulfilling. Grateful for days like these.',
    sentiment: 'Calm',
    textLength: 162,
    date: new Date('2026-03-28'),
    tags: ['personal', 'health'],
  },
  {
    id: 'entry-5',
    title: 'Presentation Anxiety',
    content: 'Presentation tomorrow and I am spiraling. What if I forget everything? What if they ask questions I cannot answer? I have prepared but it never feels like enough.',
    sentiment: 'Anxious',
    textLength: 164,
    date: new Date('2026-03-22'),
    tags: ['work'],
  },
  {
    id: 'entry-6',
    title: 'Lost Journal',
    content: 'Lost my old journal today. Years of memories just gone. I know they are still in my mind but something about having them written down made them feel more real.',
    sentiment: 'Sad',
    textLength: 159,
    date: new Date('2026-03-15'),
    tags: ['personal', 'reflection'],
  },
  {
    id: 'entry-7',
    title: 'Breakthrough',
    content: 'Breakthrough moment at work today. The algorithm finally converged and the results are beautiful. All those late nights were worth it. This is why I do what I do.',
    sentiment: 'Happy',
    textLength: 163,
    date: new Date('2026-03-08'),
    tags: ['work', 'creativity'],
  },
  {
    id: 'entry-8',
    title: 'Sleepless Night',
    content: 'Cannot sleep again. Mind racing with thoughts about the future. Where will I be in five years? Ten? The uncertainty is both terrifying and exciting at the same time.',
    sentiment: 'Frustrated',
    textLength: 166,
    date: new Date('2026-02-28'),
    tags: ['reflection', 'health'],
  },
  {
    id: 'entry-9',
    title: 'Morning Meditation',
    content: 'Started the day with a 20-minute meditation. The silence was exactly what I needed. My mind feels clear and ready for whatever comes next.',
    sentiment: 'Calm',
    textLength: 140,
    date: new Date('2026-02-20'),
    tags: ['health', 'personal'],
  },
  {
    id: 'entry-10',
    title: 'Just Another Day',
    content: 'Nothing remarkable happened today. Went through the motions — work, lunch, errands. Sometimes normal is perfectly fine.',
    sentiment: 'Neutral',
    textLength: 118,
    date: new Date('2026-02-15'),
    tags: ['reflection'],
  },
  {
    id: 'entry-11',
    title: 'Traffic Rage',
    content: 'Spent two hours stuck in traffic today. The construction has been going on for months with no end in sight. Complete waste of time and energy.',
    sentiment: 'Frustrated',
    textLength: 143,
    date: new Date('2026-02-10'),
    tags: ['personal'],
  },
  {
    id: 'entry-12',
    title: 'Weekend Plans',
    content: 'Looking forward to the weekend. No plans, no obligations. Just going to let things unfold naturally and see where the day takes me.',
    sentiment: 'Neutral',
    textLength: 132,
    date: new Date('2026-02-05'),
    tags: ['personal'],
  },
];

// ---------- Store ----------
export const useJournalStore = create<JournalState>((set) => ({
  viewState: 'Landing',
  setViewState: (viewState) => set({ viewState }),

  viewMode: '3d',
  setViewMode: (viewMode) => set({ viewMode }),

  sentimentFilter: null,
  setSentimentFilter: (sentimentFilter) => set({ sentimentFilter }),

  tagFilter: null,
  setTagFilter: (tagFilter) => set({ tagFilter }),

  tags: INITIAL_TAGS,
  addTag: (tag) => set((state) => ({
    tags: state.tags.includes(tag) ? state.tags : [...state.tags, tag],
  })),
  removeTag: (tag) => set((state) => ({
    tags: state.tags.filter((t) => t !== tag),
  })),

  entries: DUMMY_ENTRIES,
  addEntry: (entry) => set((state) => ({ entries: [entry, ...state.entries] })),
  updateEntryTags: (id, tags) => set((state) => ({
    entries: state.entries.map((e) => e.id === id ? { ...e, tags } : e),
  })),

  selectedEntryId: null,
  selectEntry: (id) => set({ selectedEntryId: id }),

  cameraTarget: null,
  setCameraTarget: (target) => set({ cameraTarget: target }),
}));
