// Vercel Serverless Function for Financial Data APIs (FMP, etc.)
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
    const { provider, symbol, endpoint } = req.query;

    let apiUrl;
    let headers = {
      "User-Agent": "StockRecommender/1.0",
      Accept: "application/json",
    };

    switch (provider) {
      case "fmp":
        const fmpKey = process.env.FINANCIAL_MODELING_PREP_API_KEY;
        if (!fmpKey) {
          throw new Error("Financial Modeling Prep API key not configured");
        }

        if (endpoint === "quote") {
          apiUrl = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${fmpKey}`;
        } else if (endpoint === "profile") {
          apiUrl = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${fmpKey}`;
        } else {
          apiUrl = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${fmpKey}`;
        }
        break;

      case "polygon":
        const polygonKey = process.env.POLYGON_API_KEY;
        if (!polygonKey) {
          throw new Error("Polygon API key not configured");
        }
        apiUrl = `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apikey=${polygonKey}`;
        break;

      case "iex":
        const iexKey = process.env.IEX_API_KEY;
        if (!iexKey) {
          throw new Error("IEX Cloud API key not configured");
        }
        apiUrl = `https://cloud.iexapis.com/stable/stock/${symbol}/quote?token=${iexKey}`;
        break;

      default:
        res
          .status(400)
          .json({ error: "Invalid provider. Use: fmp, polygon, or iex" });
        return;
    }

    console.log(
      `📡 Vercel API: Fetching ${provider.toUpperCase()} data for ${symbol}`
    );

    const response = await fetch(apiUrl, { headers });

    if (!response.ok) {
      throw new Error(
        `${provider.toUpperCase()} API returned ${response.status}: ${
          response.statusText
        }`
      );
    }

    const data = await response.json();

    console.log(
      `✅ Vercel API: Successfully fetched ${provider.toUpperCase()} data for ${symbol}`
    );
    res.status(200).json(data);
  } catch (error) {
    console.error(
      `❌ Vercel API Error (${req.query.provider}):`,
      error.message
    );
    res.status(500).json({
      error: `Failed to fetch from ${req.query.provider || "financial API"}`,
      message: error.message,
      fallback: true,
      timestamp: new Date().toISOString(),
    });
  }
}
