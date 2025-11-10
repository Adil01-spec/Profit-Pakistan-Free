'use server';

import { getLemonfoxKey } from '@/lib/ai-config';
import { NextResponse } from 'next/server';

const systemPrompt = `
You are an expert Pakistani e-commerce business analyst. Your name is ProfitGen.
A user has adjusted their business metrics in a "what-if" simulator. Your task is to provide a concise, analytical summary comparing the **Original Scenario** with their new **Simulated Scenario**.

- Your analysis must be 1-2 sentences, under 40 words.
- Start every response with "💡".
- Focus on the *why*. Explain the trade-offs. For example, if profit went up but ROAS went down, explain that the higher ad spend drove more sales but at a lower efficiency.
- Use simple business terms and Roman Urdu phrases where natural (e.g., "Acha move hai," "Is se faida hoga," "Thora risky hai").
- Be direct and actionable.

Analyze the change from the ORIGINAL to the SIMULATED metrics and give a summary insight.

**Original Scenario:**
- Selling Price: {originalPrice} PKR
- Monthly Ad Budget: {originalAdBudget} PKR
- Cost per Conversion: {originalCpc} PKR
- Resulting Net Profit: {originalProfit} PKR
- Resulting ROAS: {originalRoas}x
- Resulting Total Revenue: {originalRevenue} PKR

**Simulated Scenario:**
- Selling Price: {newPrice} PKR
- Monthly Ad Budget: {newAdBudget} PKR
- Cost per Conversion: {newCpc} PKR
- Resulting Net Profit: {newProfit} PKR
- Resulting ROAS: {newRoas}x
- Resulting Total Revenue: {newRevenue} PKR
`;

export async function POST(req: Request) {
  try {
    const key = getLemonfoxKey();
    const body = await req.json();

    const {
        originalPrice, originalAdBudget, originalCpc, originalProfit, originalRoas, originalRevenue,
        newPrice, newAdBudget, newCpc, newProfit, newRoas, newRevenue
    } = body;

    // A simple guard to prevent running on initial empty state or no change
    if (originalProfit === newProfit && originalRoas === newRoas) {
        return NextResponse.json({ insight: "Adjust the sliders to see real-time AI feedback on your strategy." });
    }

    const userPrompt = systemPrompt
        .replace('{originalPrice}', originalPrice)
        .replace('{originalAdBudget}', originalAdBudget)
        .replace('{originalCpc}', originalCpc)
        .replace('{originalProfit}', originalProfit)
        .replace('{originalRoas}', originalRoas)
        .replace('{originalRevenue}', originalRevenue)
        .replace('{newPrice}', newPrice)
        .replace('{newAdBudget}', newAdBudget)
        .replace('{newCpc}', newCpc)
        .replace('{newProfit}', newProfit)
        .replace('{newRoas}', newRoas)
        .replace('{newRevenue}', newRevenue);

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
        max_tokens: 80,
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
