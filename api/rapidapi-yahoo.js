/**
 * Vercel Serverless Function for RapidAPI Yahoo Finance
 * Proxy to avoid CORS issues and protect API keys
 * Uses multiple fallback API patterns
 */

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const { symbol, endpoint = "stock", period = "1y" } = req.query;

    if (!symbol) {
      return res.status(400).json({
        error: "Missing required parameter: symbol",
        timestamp: new Date().toISOString(),
      });
    }

    // Check for API key
    const rapidApiKey =
      process.env.RAPIDAPI_KEY || process.env.VITE_RAPIDAPI_KEY;
    if (!rapidApiKey) {
      console.log("❌ RapidAPI key not found in environment variables");
      return res.status(500).json({
        error: "RapidAPI key not configured",
        message: "RAPIDAPI_KEY environment variable not set",
        fallback: true,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`📡 RapidAPI Yahoo: ${endpoint} request for ${symbol}`);
    console.log(`🔑 RapidAPI key available: ${rapidApiKey.substring(0, 8)}...`);

    // Format symbol for Yahoo Finance (Indian stocks)
    let yahooSymbol = symbol;
    if (!symbol.includes(".")) {
      const cleanSymbol = symbol.replace("_25", "").replace("_", "");
      yahooSymbol = `${cleanSymbol}.NS`; // Add NSE suffix for Indian stocks
    }

    console.log(`🔄 Symbol conversion: ${symbol} -> ${yahooSymbol}`);

    // CORRECT RapidAPI endpoints from working examples
    const apiConfigs = [
      {
        name: "Yahoo Finance Real Time 1",
        baseUrl: "https://yahoo-finance-real-time1.p.rapidapi.com",
        host: "yahoo-finance-real-time1.p.rapidapi.com",
        endpoints: {
          stock: `/stock/get-summary?symbol=${yahooSymbol}&lang=en-IN&region=IN`,
          quote: `/stock/get-quote-summary?symbol=${yahooSymbol}&lang=en-IN&region=IN`,
          financials: `/stock/get-financials?symbol=${yahooSymbol}&lang=en-IN&region=IN`,
          statistics: `/stock/get-statistics?symbol=${yahooSymbol}&lang=en-IN&region=IN`,
          balancesheet: `/stock/get-balance-sheet?symbol=${yahooSymbol}&lang=en-IN&region=IN`,
          cashflow: `/stock/get-cashflow?symbol=${yahooSymbol}&lang=en-IN&region=IN`,
          analysis: `/stock/get-analysis?symbol=${yahooSymbol}&lang=en-IN&region=IN`,
          historical: `/stock/get-chart?symbol=${yahooSymbol}&period=${period}&lang=en-IN&region=IN`,
        },
      },
      {
        name: "Yahoo Finance Real Time (Original)",
        baseUrl: "https://yahoo-finance-real-time-api.p.rapidapi.com",
        host: "yahoo-finance-real-time-api.p.rapidapi.com",
        endpoints: {
          stock: `/stock/${yahooSymbol}`,
          quote: `/stock/${yahooSymbol}`,
          financials: `/financials/${yahooSymbol}`,
          statistics: `/statistics/${yahooSymbol}`,
          balancesheet: `/balance-sheet/${yahooSymbol}`,
          cashflow: `/cashflow/${yahooSymbol}`,
          analysis: `/analysis/${yahooSymbol}`,
          historical: `/historical/${yahooSymbol}?period=${period}`,
        },
      },
      {
        name: "Yahoo Finance15",
        baseUrl: "https://yahoo-finance15.p.rapidapi.com",
        host: "yahoo-finance15.p.rapidapi.com",
        endpoints: {
          stock: `/api/yahoo/qu/quote/${yahooSymbol}`,
          quote: `/api/yahoo/qu/quote/${yahooSymbol}`,
          financials: `/api/yahoo/fi/financials/${yahooSymbol}`,
          statistics: `/api/yahoo/st/statistics/${yahooSymbol}`,
          balancesheet: `/api/yahoo/bs/balance-sheet/${yahooSymbol}`,
          cashflow: `/api/yahoo/cf/cashflow/${yahooSymbol}`,
          analysis: `/api/yahoo/an/analysis/${yahooSymbol}`,
          historical: `/api/yahoo/hi/history/${yahooSymbol}/${period}`,
        },
      },
    ];

    let lastError = null;

    // Try each API configuration
    for (const config of apiConfigs) {
      try {
        console.log(`🔄 Trying ${config.name} API...`);

        const apiUrl = config.baseUrl + config.endpoints[endpoint];
        if (!config.endpoints[endpoint]) {
          console.log(
            `⚠️ ${config.name}: Endpoint '${endpoint}' not supported`
          );
          continue;
        }

        console.log(`🌐 Making request to: ${apiUrl}`);

        // Add random delay to avoid rate limiting
        await new Promise((resolve) =>
          setTimeout(resolve, Math.random() * 300 + 100)
        );

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": rapidApiKey,
            "X-RapidAPI-Host": config.host,
            "Content-Type": "application/json",
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.log(
            `❌ ${config.name} Error ${response.status}: ${errorBody.substring(
              0,
              100
            )}`
          );
          lastError = `${config.name}: ${response.status} ${response.statusText}`;
          continue; // Try next API
        }

        const data = await response.json();

        // Check if response contains actual data
        if (
          !data ||
          (typeof data === "object" && Object.keys(data).length === 0)
        ) {
          console.log(`⚠️ ${config.name}: Empty response`);
          continue; // Try next API
        }

        // Success! Add metadata and return
        const responseData = {
          ...data,
          _metadata: {
            source: `RapidAPI ${config.name}`,
            symbol: symbol,
            yahooSymbol: yahooSymbol,
            endpoint: endpoint,
            apiUsed: config.name,
            timestamp: new Date().toISOString(),
          },
        };

        console.log(`✅ ${config.name}: Success for ${yahooSymbol}`);
        return res.status(200).json(responseData);
      } catch (error) {
        console.log(`❌ ${config.name} failed:`, error.message);
        lastError = `${config.name}: ${error.message}`;
        continue; // Try next API
      }
    }

    // All APIs failed
    console.log(`❌ All RapidAPI configurations failed for ${yahooSymbol}`);
    return res.status(500).json({
      error: "All RapidAPI Yahoo Finance endpoints failed",
      message: `Tried ${apiConfigs.length} different APIs. Last error: ${lastError}`,
      symbol: symbol,
      yahooSymbol: yahooSymbol,
      fallback: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ RapidAPI Yahoo Finance error:", error);

    res.status(500).json({
      error: "Failed to fetch from RapidAPI Yahoo Finance",
      message: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }
}
