
import { getLemonfoxKey } from "@/lib/ai-config";
import { NextResponse } from 'next/server';

const prompt = `Generate one short, practical daily marketing or business tip for Pakistani e-commerce sellers. Keep it under 25 words.`;

export async function GET() {
  try {
    const key = getLemonfoxKey();

    const response = await fetch("https://api.lemonfox.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3-8b-chat-hf",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
        max_tokens: 50,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lemonfox AI Error:', errorText);
      throw new Error(`Lemonfox AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content;

    if (!reply) {
      throw new Error("No insight generated.");
    }
    
    // Sometimes the model might include its own preamble, so we clean it.
    const cleanedReply = reply.replace(/^(.*?:\s*)/, '').trim();

    return NextResponse.json({ insight: cleanedReply });

  } catch (err: any) {
    console.error("Daily Insight API error:", err);
    return new NextResponse(
      JSON.stringify({
        error: "Failed to fetch daily insight.",
        detail: err.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
