// Vercel Serverless Function for Yahoo Finance API Proxy
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
    const { endpoint, symbol, modules } = req.query;

    let yahooUrl;
    if (endpoint === "quote") {
      yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    } else if (endpoint === "summary") {
      const moduleParams =
        modules || "price,financialData,defaultKeyStatistics,summaryDetail";
      yahooUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=${moduleParams}`;
    } else {
      res.status(400).json({ error: "Invalid endpoint" });
      return;
    }

    console.log(`📡 Vercel API: Fetching ${yahooUrl}`);

    const response = await fetch(yahooUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Yahoo Finance API returned ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();

    console.log(`✅ Vercel API: Successfully fetched data for ${symbol}`);
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Vercel API Error:", error.message);
    res.status(500).json({
      error: "Failed to fetch from Yahoo Finance",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
