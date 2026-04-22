import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!content) {
      return new Response('Content is required', { status: 400 });
    }

    const result = await generateObject({
      model: google('gemini-1.5-pro'),
      schema: z.object({
        title: z.string().describe('A very short, poetic 1-4 word title for this thought.'),
        sentiment: z.enum(['Happy', 'Calm', 'Sad', 'Anxious', 'Frustrated', 'Neutral']).describe('The overall emotional tone of the thought.'),
        intensity: z.number().min(1).max(10).describe('The emotional intensity of the thought, from 1 (very mild) to 10 (overwhelming).'),
        tags: z.array(z.string()).describe('1 to 3 relevant lower-case single-word tags representing the core topics.'),
      }),
      prompt: `Analyze the following journal entry and extract its emotional essence.\n\nEntry: "${content}"`,
    });

    return Response.json(result.object);
  } catch (error) {
    console.error('Error analyzing thought:', error);
    return new Response('Failed to analyze thought', { status: 500 });
  }
}
