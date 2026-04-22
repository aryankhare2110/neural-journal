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

import type { User } from '@supabase/supabase-js';

interface JournalState {
  user: User | null;
  setUser: (user: User | null) => void;

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
  renameTag: (oldName: string, newName: string) => void;
  reorderTags: (tags: string[]) => void;

  entries: JournalEntry[];
  setEntries: (entries: JournalEntry[]) => void;
  fetchEntries: () => Promise<void>;
  addEntry: (entry: JournalEntry) => void;
  updateEntryTags: (id: string, tags: string[]) => void;

  selectedEntryId: string | null;
  selectEntry: (id: string | null) => void;

  cameraTarget: [number, number, number] | null;
  setCameraTarget: (target: [number, number, number] | null) => void;
}

import { createClient } from '@/utils/supabase/client';

// ---------- Store ----------
export const useJournalStore = create<JournalState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),

  viewState: 'Landing',
  setViewState: (viewState) => set({ viewState }),

  viewMode: '3d',
  setViewMode: (viewMode) => set({ viewMode }),

  sentimentFilter: null,
  setSentimentFilter: (sentimentFilter) => set({ sentimentFilter }),

  tagFilter: null,
  setTagFilter: (tagFilter) => set({ tagFilter }),

  tags: [],
  addTag: (tag) => set((state) => ({
    tags: state.tags.includes(tag) ? state.tags : [...state.tags, tag],
  })),
  removeTag: (tag) => set((state) => ({
    tags: state.tags.filter((t) => t !== tag),
    entries: state.entries.map((e) => ({
      ...e,
      tags: e.tags.filter((t) => t !== tag),
    })),
    tagFilter: state.tagFilter === tag ? null : state.tagFilter,
  })),
  renameTag: (oldName, newName) => set((state) => {
    const trimmed = newName.trim().toLowerCase();
    if (!trimmed || state.tags.includes(trimmed)) return state;
    return {
      tags: state.tags.map((t) => (t === oldName ? trimmed : t)),
      entries: state.entries.map((e) => ({
        ...e,
        tags: e.tags.map((t) => (t === oldName ? trimmed : t)),
      })),
      tagFilter: state.tagFilter === oldName ? trimmed : state.tagFilter,
    };
  }),
  reorderTags: (tags) => set({ tags }),

  entries: [],
  setEntries: (entries) => set({ entries }),
  fetchEntries: async () => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) return;
    
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('date', { ascending: false });
      
    if (!error && data) {
      const parsedEntries = data.map((e: any) => ({
        id: e.id,
        title: e.title,
        content: e.content,
        sentiment: e.sentiment,
        intensity: e.intensity,
        textLength: e.text_length,
        date: new Date(e.date),
        tags: e.tags || [],
      }));
      set({ entries: parsedEntries as JournalEntry[] });
      
      // Update tags based on fetched entries
      const allTags = new Set<string>();
      data.forEach(entry => {
        entry.tags?.forEach((t: string) => allTags.add(t));
      });
      set({ tags: Array.from(allTags) });
    }
  },
  addEntry: (entry) => set((state) => {
    // Add new tags to global pool
    const newTags = new Set([...state.tags, ...entry.tags]);
    return { 
      entries: [entry, ...state.entries],
      tags: Array.from(newTags)
    };
  }),
  updateEntryTags: (id, tags) => set((state) => ({
    entries: state.entries.map((e) => e.id === id ? { ...e, tags } : e),
  })),

  selectedEntryId: null,
  selectEntry: (id) => set({ selectedEntryId: id }),

  cameraTarget: null,
  setCameraTarget: (target) => set({ cameraTarget: target }),
}));
