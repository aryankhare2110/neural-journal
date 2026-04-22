'use server';

import type { Sentiment } from '@/store/useJournalStore';

import { createClient } from '@/utils/supabase/server';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export interface CreateEntryResult {
  id: string;
  title: string;
  content: string;
  sentiment: Sentiment;
  intensity: number;
  textLength: number;
  date: string;
  tags: string[];
}

// ─── Local Fallback Analysis ───
// Used when AI quota is exceeded or unavailable
function localAnalysis(title: string, content: string, userTags: string[]) {
  const text = (title + ' ' + content).toLowerCase();

  // Simple keyword-based sentiment detection
  const sentimentKeywords: Record<Sentiment, string[]> = {
    Happy: ['happy', 'joy', 'great', 'amazing', 'wonderful', 'love', 'excited', 'grateful', 'blessed', 'awesome', 'fantastic', 'smile', 'laugh', 'celebrate', 'fun', 'beautiful'],
    Calm: ['calm', 'peace', 'relax', 'serene', 'quiet', 'gentle', 'still', 'mindful', 'content', 'ease', 'comfort', 'rest', 'breathe', 'tranquil', 'balanced'],
    Sad: ['sad', 'cry', 'miss', 'lost', 'lonely', 'heartbreak', 'grief', 'sorrow', 'depressed', 'hurt', 'pain', 'empty', 'tear', 'mourn', 'regret'],
    Anxious: ['anxious', 'worry', 'nervous', 'stress', 'fear', 'panic', 'overwhelm', 'uneasy', 'tense', 'dread', 'uncertain', 'restless', 'scared', 'afraid'],
    Frustrated: ['frustrated', 'angry', 'annoyed', 'irritated', 'mad', 'furious', 'stuck', 'hate', 'rage', 'ugh', 'tired', 'exhaust', 'fed up', 'sick of'],
    Neutral: ['think', 'note', 'today', 'went', 'did', 'plan', 'idea', 'maybe', 'consider', 'observe'],
  };

  let bestSentiment: Sentiment = 'Neutral';
  let bestScore = 0;

  for (const [sentiment, keywords] of Object.entries(sentimentKeywords)) {
    const score = keywords.filter((kw) => text.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestSentiment = sentiment as Sentiment;
    }
  }

  // Generate a short title from the first few words
  const words = content.trim().split(/\s+/);
  const autoTitle = title.trim() || words.slice(0, 3).join(' ') + (words.length > 3 ? '...' : '');

  // Intensity: based on punctuation and caps
  const exclamations = (content.match(/!/g) || []).length;
  const capsWords = (content.match(/[A-Z]{2,}/g) || []).length;
  const intensity = Math.min(10, Math.max(1, 3 + exclamations + capsWords));

  // Auto-generate tags from common words
  const stopWords = new Set(['the', 'a', 'an', 'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'it', 'this', 'that', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'they', 'and', 'but', 'or', 'not', 'so', 'if', 'just', 'about', 'up', 'out', 'all', 'what', 'when', 'how', 'who', 'which', 'there', 'here', 'very', 'really', 'much', 'more', 'some', 'no', 'than', 'too', 'also']);
  const wordFreq: Record<string, number> = {};
  words.forEach((w) => {
    const clean = w.toLowerCase().replace(/[^a-z]/g, '');
    if (clean.length > 2 && !stopWords.has(clean)) {
      wordFreq[clean] = (wordFreq[clean] || 0) + 1;
    }
  });
  const autoTags = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([word]) => word);

  const combinedTags = Array.from(new Set([...userTags, ...autoTags]));

  return {
    title: autoTitle,
    sentiment: bestSentiment,
    intensity,
    tags: combinedTags,
  };
}

export async function createEntry(title: string, content: string, userTags: string[]): Promise<CreateEntryResult> {
  const supabase = await createClient();
  const { data: userData, error: authError } = await supabase.auth.getUser();

  if (authError || !userData?.user) {
    throw new Error('Not authenticated');
  }

  // Try AI analysis first, fall back to local if quota exceeded
  let analysis: { title: string; sentiment: Sentiment; intensity: number; tags: string[] };

  try {
    const { object: aiAnalysis } = await generateObject({
      model: google('gemini-2.0-flash'),
      schema: z.object({
        title: z.string().describe('A very short, poetic 1-4 word title for this thought. If the user provided one, you can improve it or just use it.'),
        sentiment: z.enum(['Happy', 'Calm', 'Sad', 'Anxious', 'Frustrated', 'Neutral']).describe('The overall emotional tone of the thought.'),
        intensity: z.number().min(1).max(10).describe('The emotional intensity of the thought, from 1 (very mild) to 10 (overwhelming).'),
        tags: z.array(z.string()).describe('1 to 3 relevant lower-case single-word tags representing the core topics.'),
      }),
      prompt: `Analyze the following journal entry and extract its emotional essence. The user might have provided a title: "${title}". The user provided tags: ${userTags.join(', ')}.\n\nEntry: "${content}"`,
    });

    const combinedTags = Array.from(new Set([...userTags, ...aiAnalysis.tags]));
    analysis = { ...aiAnalysis, tags: combinedTags };
    console.log('[AI] Gemini analysis used');
  } catch (err) {
    console.warn('[AI] Gemini unavailable, using local fallback:', (err as Error).message);
    analysis = localAnalysis(title, content, userTags);
  }

  const newEntry = {
    user_id: userData.user.id,
    title: analysis.title,
    content,
    sentiment: analysis.sentiment,
    intensity: analysis.intensity,
    text_length: content.length,
    tags: analysis.tags,
    date: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('entries')
    .insert([newEntry])
    .select()
    .single();

  if (error) {
    console.error('Error inserting entry:', error);
    throw new Error('Failed to save entry to database');
  }

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    sentiment: data.sentiment as Sentiment,
    intensity: data.intensity,
    textLength: data.text_length,
    date: data.date,
    tags: data.tags,
  };
}

export async function generateIntelligenceInsight(entries: { title: string; content: string; sentiment: string; date: string }[]) {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData?.user) {
    throw new Error('Not authenticated');
  }

  if (entries.length === 0) {
    return "Start logging your thoughts to uncover deeper patterns and map your consciousness.";
  }

  try {
    const prompt = `Based on the following recent journal entries, provide a short, deep, and empathetic psychological insight (max 2 sentences) about the user's current mental state. Address them directly ("You...").\n\nEntries:\n${JSON.stringify(entries)}`;

    const { object } = await generateObject({
      model: google('gemini-2.0-flash'),
      schema: z.object({
        insight: z.string().describe('The generated psychological insight.'),
      }),
      prompt,
    });

    return object.insight;
  } catch (err) {
    console.warn('[AI] Gemini unavailable for insight, using local fallback:', (err as Error).message);

    // Local fallback: generate a simple insight from the data we have
    const sentiments = entries.map((e) => e.sentiment);
    const dominant = sentiments.sort((a, b) =>
      sentiments.filter((s) => s === b).length - sentiments.filter((s) => s === a).length
    )[0];

    const insightMap: Record<string, string> = {
      Happy: "You've been radiating positive energy recently. Your entries reflect a mind that is finding joy in the present moment.",
      Calm: "You seem to be in a grounded, reflective state. Your thoughts carry a quiet clarity that suggests inner balance.",
      Sad: "You're processing some heavy emotions right now. Remember that acknowledging pain is the first step toward healing.",
      Anxious: "Your recent thoughts suggest some inner turbulence. Consider taking a moment to breathe — your awareness of these feelings is itself a strength.",
      Frustrated: "You seem to be navigating some friction in your life. Your willingness to express it honestly is a healthy outlet.",
      Neutral: "You're in an observational mode, processing the world around you. This reflective state often precedes meaningful insights.",
    };

    return insightMap[dominant] || insightMap['Neutral'];
  }
}
