'use server';

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { Generation } from 'genkit/generation';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-pro',
});

/**
 * Generates content using the primary AI model (Gemini 2.5 Pro) with a fallback to a secondary model (Gemini 2.5 Flash).
 * @param {object} options - The options for the generate call.
 * @returns {Promise<Generation>} A promise that resolves with the generation result.
 */
export async function generateWithFallback(options: {
  prompt: string;
  history?: any[];
  config?: any;
}): Promise<Generation> {
  try {
    console.log('Attempting to generate with Gemini 2.5 Pro...');
    const result = await ai.generate(options);
    console.log('Successfully generated with Gemini 2.5 Pro.');
    return result;
  } catch (error) {
    console.warn('Gemini 2.5 Pro failed, switching to Flash.', error);

    const flashAI = genkit({
      plugins: [googleAI()],
      model: 'googleai/gemini-2.5-flash',
    });
    
    console.log('Attempting to generate with Gemini 2.5 Flash...');
    const result = await flashAI.generate(options);
    console.log('Successfully generated with Gemini 2.5 Flash.');
    return result;
  }
}
