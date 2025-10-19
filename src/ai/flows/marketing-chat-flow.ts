
'use server';
/**
 * 🔧 Fix AI Chat Greeting Loop + Context Loss
 * This setup ensures Gemini remembers full chat history
 * and greets only once at the start of the conversation.
 */
import { generateWithFallback } from '@/ai/genkit';
import { z } from 'zod';
import {ai} from '@/ai/genkit';

const MessageSchema = z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
});

type Message = z.infer<typeof MessageSchema>;

export async function runChat(messages: Message[]): Promise<string> {
    const systemPrompt = `You are a helpful and friendly marketing assistant for Pakistani e-commerce store owners. Your goal is to provide concise, actionable advice. Keep your responses short and to the point.`;
    
    // The first message from the user will be combined with the system prompt.
    // Subsequent messages will be part of the history.
    const userPrompt = messages.find(m => m.role === 'user')?.content || '';
    const history = messages.length > 1 ? messages.slice(0, -1) : [];

    const result = await generateWithFallback({
        prompt: userPrompt,
        history: [
            { role: 'system', content: systemPrompt },
            ...history
        ],
    });
    
    return result.text;
}

const marketingChatFlow = ai.defineFlow(
    {
        name: 'marketingChatFlow',
        inputSchema: z.array(MessageSchema),
        outputSchema: z.string(),
    },
    async (messages) => {
        const result = await generateWithFallback({
            prompt: `You are a helpful and friendly marketing assistant for Pakistani e-commerce store owners. Your goal is to provide concise, actionable advice. Keep your responses short and to the point.`,
            history: messages,
            config: {
                temperature: 0.7
            },
        });
        
        return result.text;
    }
);
