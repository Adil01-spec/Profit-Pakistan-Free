
'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

export async function getAIResponse(userMessage: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a friendly AI marketing assistant for a Pakistani entrepreneur.
Give practical, creative, and concise responses related to:
- product marketing
- Meta or TikTok ads
- e-commerce strategy
Keep tone: helpful, optimistic, and to-the-point.
User: ${userMessage}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "⚠️ I'm having trouble connecting right now. Please try again shortly.";
  }
}
