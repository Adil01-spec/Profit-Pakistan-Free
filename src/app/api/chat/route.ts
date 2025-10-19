// Direct fetch to Lemonfox OpenAI-compatible endpoint
export async function POST(req: Request) {
  const { messages } = await req.json();

  if (!process.env.LEMONFOX_API_KEY) {
    return new Response(
      JSON.stringify({
        error:
          'API key not found. Please set LEMONFOX_API_KEY in your environment variables.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  const systemPrompt = {
    role: 'system',
    content:
      'You are an AI marketing assistant that helps Pakistani e-commerce brands create marketing campaigns, ad copies, and product descriptions. Give actionable, realistic advice. Avoid repeating greetings.',
  };

  try {
    const response = await fetch('https://api.lemonfox.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.LEMONFOX_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct',
        messages: [systemPrompt, ...messages],
        temperature: 0.7,
        max_tokens: 700,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Lemonfox API Error:', errorBody);
      return new Response(
        JSON.stringify({
          error: `API request failed with status ${response.status}`,
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const completion = await response.json();
    const reply = completion.choices[0]?.message?.content || 'No response.';

    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Request failed:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
