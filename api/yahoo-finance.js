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
    console.log(`🔍 Request details: ${endpoint} for ${symbol}`);

    // Add random delay to avoid rate limiting
    await new Promise((resolve) =>
      setTimeout(resolve, Math.random() * 1000 + 500)
    );

    const response = await fetch(yahooUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Ch-Ua":
          '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"macOS"',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.log(`❌ Yahoo Finance Error Body: ${errorBody}`);
      throw new Error(
        `Yahoo Finance API returned ${response.status}: ${
          response.statusText
        }. Body: ${errorBody.substring(0, 200)}`
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
