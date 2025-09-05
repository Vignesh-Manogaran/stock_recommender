// Vercel Serverless Function for OpenRouter API Proxy
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.log("⚠️ OpenRouter API key not configured");
      res.status(503).json({
        error: "OpenRouter API key not configured",
        fallback: true,
      });
      return;
    }

    const { symbol, prompt, model } = req.body;

    if (!symbol || !prompt) {
      res.status(400).json({ error: "Symbol and prompt are required" });
      return;
    }

    console.log(`📡 Vercel API: Fetching OpenRouter analysis for ${symbol}`);

    const openRouterResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : "http://localhost:3000",
          "X-Title": "Stock Recommender App",
        },
        body: JSON.stringify({
          model: model || "meta-llama/llama-3.1-8b-instruct:free",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      }
    );

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      throw new Error(
        `OpenRouter API returned ${openRouterResponse.status}: ${errorText}`
      );
    }

    const data = await openRouterResponse.json();

    console.log(
      `✅ Vercel API: Successfully got OpenRouter analysis for ${symbol}`
    );
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Vercel API Error (OpenRouter):", error.message);
    res.status(500).json({
      error: "Failed to get AI analysis from OpenRouter",
      message: error.message,
      fallback: true,
      timestamp: new Date().toISOString(),
    });
  }
}
