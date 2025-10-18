
'use server';
/**
 * @fileOverview A marketing assistant AI flow.
 *
 * - runChat: A function that handles the AI chat interaction.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MessageSchema = z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
});

type Message = z.infer<typeof MessageSchema>;

export async function runChat(messages: Message[]): Promise<string> {
    return marketingChatFlow(messages);
}

const marketingChatFlow = ai.defineFlow(
    {
        name: 'marketingChatFlow',
        inputSchema: z.array(MessageSchema),
        outputSchema: z.string(),
    },
    async (messages) => {
        const result = await ai.generate({
            prompt: `You are a helpful and friendly marketing assistant for Pakistani e-commerce store owners. Your goal is to provide concise, actionable advice. Keep your responses short and to the point.`,
            history: messages,
            config: {
                temperature: 0.7
            },
        });
        
        return result.text;
    }
);
