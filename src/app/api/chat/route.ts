// Replace Gemini with Lemonfox OpenAI-compatible endpoint
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.LEMONFOX_API_KEY,
  baseURL: "https://api.lemonfox.ai/v1", // Lemonfox endpoint
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const completion = await client.chat.completions.create({
    model: "meta-llama/llama-3.3-70b-instruct",
    messages: [
      {
        role: "system",
        content: `You are a professional marketing strategist for Pakistani online stores. 
Give actionable, realistic advice, ad-copy ideas, and growth strategies. Avoid repeating greetings.`,
      },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 700,
  });

  const reply = completion.choices[0].message?.content || "No response.";

  return Response.json({ reply });
}
