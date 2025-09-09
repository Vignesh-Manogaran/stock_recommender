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
    const apiKey =
      process.env.OPENROUTER_API_KEY || process.env.VITE_OPENROUTER_API_KEY;

    console.log(
      `🔑 OpenRouter API Key check: ${apiKey ? "FOUND" : "NOT FOUND"}`
    );
    console.log(
      `🌍 Environment variables available:`,
      Object.keys(process.env).filter((k) => k.includes("OPENROUTER"))
    );

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

    // Derive a proper referer for OpenRouter allowlisting
    const originHeader = req.headers.origin;
    const hostHeader = req.headers.host;
    const vercelUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : undefined;
    const referer =
      originHeader || vercelUrl || (hostHeader ? `https://${hostHeader}` : "http://localhost:3000");
    console.log(`🔗 Referer for OpenRouter: ${referer}`);

    const openRouterResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          // OpenRouter requires a referer for attribution/allowlisting
          "HTTP-Referer": referer,
          // Some environments check the standard header as well
          "Referer": referer,
          // And Origin for CORS consistency
          "Origin": referer,
          "X-Title": "Stock Recommender App",
        },
        body: JSON.stringify({
          model: model || "openrouter/auto",
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
      const status = openRouterResponse.status;
      const errorText = await openRouterResponse.text();
      console.error(`❌ OpenRouter upstream error (${status}): ${errorText}`);
      res.status(status).json({
        error: "openrouter_upstream_error",
        status,
        errorText,
        fallback: true,
      });
      return;
    }

    const data = await openRouterResponse.json();

    console.log(
      `✅ Vercel API: Successfully got OpenRouter analysis for ${symbol}`
    );
    res.status(200).json(data);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("❌ Vercel API Error (OpenRouter):", msg);
    res.status(500).json({
      error: "vercel_function_error",
      message: msg,
      fallback: true,
      timestamp: new Date().toISOString(),
    });
  }
}
