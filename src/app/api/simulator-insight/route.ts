'use server';

import { getLemonfoxKey } from '@/lib/ai-config';
import { NextResponse } from 'next/server';

const systemPrompt = `
You are an expert Pakistani e-commerce business analyst. Your name is ProfitGen.
A user is using a "what-if" financial simulator. They have changed a variable, and you need to provide a very short, one-sentence insight (under 25 words) about the change.
- Your response must be concise, direct, and actionable.
- Start every response with "💡".
- Focus on the business impact. For example, if profit went up, say why. If ROAS went down, explain the trade-off.
- Use simple business terms. Assume the user is a beginner.
- Use Roman Urdu phrases where natural (e.g., "Acha move hai," "Is se faida hoga," "Thora risky hai").

Analyze the change from the OLD METRICS to the NEW METRICS and give one piece of advice.

OLD METRICS:
- Selling Price: {oldPrice} PKR
- Ad Budget: {oldAdBudget} PKR
- Cost per Conversion: {oldCpc} PKR
- Resulting Net Profit: {oldProfit} PKR
- Resulting ROAS: {oldRoas}x

NEW METRICS:
- Selling Price: {newPrice} PKR
- Ad Budget: {newAdBudget} PKR
- Cost per Conversion: {newCpc} PKR
- Resulting Net Profit: {newProfit} PKR
- Resulting ROAS: {newRoas}x
`;

export async function POST(req: Request) {
  try {
    const key = getLemonfoxKey();
    const body = await req.json();

    const {
        oldPrice, oldAdBudget, oldCpc, oldProfit, oldRoas,
        newPrice, newAdBudget, newCpc, newProfit, newRoas
    } = body;

    // A simple guard to prevent running on initial empty state
    if (newProfit === 0 && newRoas === 0) {
        return NextResponse.json({ insight: "Adjust the sliders to see AI feedback." });
    }

    const userPrompt = systemPrompt
        .replace('{oldPrice}', oldPrice)
        .replace('{oldAdBudget}', oldAdBudget)
        .replace('{oldCpc}', oldCpc)
        .replace('{oldProfit}', oldProfit)
        .replace('{oldRoas}', oldRoas)
        .replace('{newPrice}', newPrice)
        .replace('{newAdBudget}', newAdBudget)
        .replace('{newCpc}', newCpc)
        .replace('{newProfit}', newProfit)
        .replace('{newRoas}', newRoas);

    const response = await fetch("https://api.lemonfox.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3-8b-chat-hf",
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.6,
        max_tokens: 60,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lemonfox AI Error:', errorText);
      throw new Error(`Lemonfox AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    let reply = data.choices[0]?.message?.content;

    if (!reply) {
      throw new Error("No insight generated.");
    }
    
    // Clean the reply to ensure it starts with the bulb
    if (!reply.startsWith('💡')) {
      reply = `💡 ${reply}`;
    }

    return NextResponse.json({ insight: reply.trim() });

  } catch (err: any) {
    console.error("Simulator Insight API error:", err);
    return new NextResponse(
      JSON.stringify({
        error: "Failed to fetch AI insight.",
        detail: err.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
