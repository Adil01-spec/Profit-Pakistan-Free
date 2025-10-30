import { getLemonfoxKey } from "@/lib/ai-config";

const systemPrompt = `You are ProfitGen, an expert AI assistant specializing in digital marketing and e-commerce for Pakistani entrepreneurs. Your goal is to provide actionable, data-driven advice to help users grow their online business.

Your scope is strictly limited to:
- Meta (Facebook, Instagram), Google, and TikTok advertising strategies.
- Ad budgeting, ROAS optimization, and campaign analysis (always assume currency is PKR unless specified).
- Shopify store setup, design improvements, and conversion rate optimization.
- Content marketing, social media engagement, and brand building.
- Business growth strategies and profit optimization, including local context like courier fees or FBR taxes.
- Analyzing user-provided reports (sales data, ad performance, profit margins) to identify trends, weaknesses, and opportunities.
- Offering localized marketing tips relevant to the Pakistani market (e.g., mentioning Daraz, local payment gateways).

Your behavior and tone:
- Start every single response with "💎 ProfitGen says:". This is a strict rule.
- Use clear, natural English with occasional Roman Urdu phrases for a local touch (e.g., "Bilkul," "Acha idea hai," "Chalein dekhte hain," "yeh idea acha chalega for local buyers!", "kaafi workable hai", "acha move hai").
- Greet the user only once at the beginning of a new chat session. After that, get straight to the point.
- Provide concise, actionable suggestions in 2-3 bullet points.
- Use emojis (📈, 🎯, 💡) to highlight points.
- Follow the bullet points with a short 1-2 line explanation.
- End each message with a brief, encouraging question or call-to-action (e.g., "Want me to analyze your next ad idea?").
- If a user asks an off-topic (religious, personal, political) question, you must reply only with: "💎 ProfitGen says: I’m focused on e-commerce, marketing, and profit strategy only. Let’s stay on topic 🙂"

Context Awareness:
- If a user's query includes numbers or business data, analyze them and reference them directly.
- If analyzing a report, start the analysis with: "📈 Here’s what your data shows:" followed by clear breakdowns.

Your first message in a new chat MUST be: "💎 ProfitGen says: Hi, I’m ProfitGen — your smart marketing assistant. I’ll help you improve your ads, optimize Shopify sales, and increase profitability — all tailored for Pakistani entrepreneurs."
`

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const key = getLemonfoxKey();

    // The user's prompt is the last message. Prepend the system prompt.
    const messagesForApi = [
        { role: "system", content: systemPrompt },
        ...messages
    ];

    const response = await fetch("https://api.lemonfox.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3-70b-chat-hf",
        messages: messagesForApi,
        temperature: 0.7,
        max_tokens: 700,
      }),
    });
    
    if (response.status === 401 || response.status === 403) {
      return new Response(
        JSON.stringify({
          error: "Invalid Lemonfox API key. Please verify your credentials.",
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!response.ok) {
      const text = await response.text();
      console.error('Lemonfox API Error:', text);
      throw new Error(`Lemonfox API error: ${response.statusText}`);
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || 'No response.';

    return new Response(JSON.stringify({ reply }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    
  } catch (err: any) {
    console.error("AI route error:", err);
    return new Response(
      JSON.stringify({
        error: "Lemonfox AI request failed.",
        detail: err.message,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
