// Vercel Serverless Function for Alpha Vantage API Proxy
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const { symbol, function: fn } = req.query;
    const apiKey =
      process.env.ALPHA_VANTAGE_API_KEY ||
      process.env.VITE_ALPHA_VANTAGE_API_KEY;

    // Convert Indian stock symbols for Alpha Vantage
    const cleanSymbol = symbol.replace(".NS", "").replace(".BO", "");
    console.log(`🔄 Symbol conversion: ${symbol} → ${cleanSymbol}`);

    if (!apiKey) {
      console.log("⚠️ Alpha Vantage API key not configured");
      res.status(503).json({
        error: "Alpha Vantage API key not configured",
        fallback: true,
      });
      return;
    }

    // Default to GLOBAL_QUOTE if no function specified
    const functionType = fn || "GLOBAL_QUOTE";

    const alphaUrl = `https://www.alphavantage.co/query?function=${functionType}&symbol=${cleanSymbol}&apikey=${apiKey}`;

    console.log(`📡 Vercel API: Fetching Alpha Vantage data for ${symbol}`);

    const response = await fetch(alphaUrl, {
      headers: {
        "User-Agent": "StockRecommender/1.0",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Alpha Vantage API returned ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();

    // Check if API returned an error or rate limit message
    if (data["Error Message"] || data["Note"]) {
      throw new Error(data["Error Message"] || data["Note"]);
    }

    console.log(
      `✅ Vercel API: Successfully fetched Alpha Vantage data for ${symbol}`
    );
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Vercel API Error (Alpha Vantage):", error.message);
    res.status(500).json({
      error: "Failed to fetch from Alpha Vantage",
      message: error.message,
      fallback: true,
      timestamp: new Date().toISOString(),
    });
  }
}
