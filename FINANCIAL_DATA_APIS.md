# Financial Data API Options

## Free APIs (Good for Development)

### 1. Yahoo Finance (Unofficial)

```javascript
// Get basic stock info
const ticker = "TCS.NS"; // .NS for NSE stocks
const response = await fetch(
  `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}`
);

// Get detailed financials
const financials = await fetch(
  `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=financialData,defaultKeyStatistics,summaryDetail`
);
```

### 2. Alpha Vantage (25 calls/day free)

```javascript
const API_KEY = "your_alpha_vantage_key";
const symbol = "TCS";

// Company overview
const overview = await fetch(
  `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`
);

// Income statement
const income = await fetch(
  `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${symbol}&apikey=${API_KEY}`
);

// Balance sheet
const balance = await fetch(
  `https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol=${symbol}&apikey=${API_KEY}`
);
```

### 3. Financial Modeling Prep (250 calls/day free)

```javascript
const API_KEY = "your_fmp_key";
const symbol = "TCS";

// Company profile
const profile = await fetch(
  `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${API_KEY}`
);

// Financial ratios
const ratios = await fetch(
  `https://financialmodelingprep.com/api/v3/ratios/${symbol}?apikey=${API_KEY}`
);

// Real-time price
const price = await fetch(
  `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${API_KEY}`
);
```

## Premium APIs (Production Ready)

### 1. Polygon.io

```javascript
const API_KEY = "your_polygon_key";

// Real-time quote
const quote = await fetch(
  `https://api.polygon.io/v2/last/trade/${symbol}?apikey=${API_KEY}`
);

// Daily aggregates
const aggregates = await fetch(
  `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?apikey=${API_KEY}`
);

// Technical indicators
const sma = await fetch(
  `https://api.polygon.io/v1/indicators/sma/${symbol}?apikey=${API_KEY}`
);
```

### 2. IEX Cloud

```javascript
const API_KEY = "your_iex_key";

// Stock quote
const quote = await fetch(
  `https://cloud.iexapis.com/stable/stock/${symbol}/quote?token=${API_KEY}`
);

// Company info
const company = await fetch(
  `https://cloud.iexapis.com/stable/stock/${symbol}/company?token=${API_KEY}`
);

// Financial statements
const financials = await fetch(
  `https://cloud.iexapis.com/stable/stock/${symbol}/financials?token=${API_KEY}`
);
```

## Indian Market Specific

### NSE India (Free but requires headers)

```javascript
const headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  Referer: "https://www.nseindia.com/",
};

// Stock quote
const quote = await fetch(
  `https://www.nseindia.com/api/quote-equity?symbol=${symbol}`,
  { headers }
);

// Market data
const market = await fetch(
  `https://www.nseindia.com/api/equity-stockIndices?index=NIFTY%2050`,
  { headers }
);
```

## Recommended Implementation Strategy

### Phase 1: Development (Free APIs)

- Use Yahoo Finance for basic data
- Use Alpha Vantage for detailed financials
- Cache data to minimize API calls

### Phase 2: Production (Paid APIs)

- Switch to Polygon.io or IEX Cloud
- Implement real-time updates
- Add data validation and error handling

### Phase 3: AI Analysis

- Use OpenRouter to analyze the real data
- Generate insights and recommendations
- Provide Tamil explanations

## Sample Integration

```typescript
// services/financialDataAPI.ts
export class FinancialDataService {
  async getStockData(symbol: string) {
    // Try multiple sources for reliability
    try {
      return await this.getFromYahooFinance(symbol);
    } catch (error) {
      console.log("Yahoo failed, trying Alpha Vantage...");
      return await this.getFromAlphaVantage(symbol);
    }
  }

  async getFromYahooFinance(symbol: string) {
    const response = await fetch(
      `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price,financialData,defaultKeyStatistics`
    );
    return await response.json();
  }

  async getFromAlphaVantage(symbol: string) {
    const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_KEY;
    const response = await fetch(
      `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`
    );
    return await response.json();
  }
}

// Then use OpenRouter for analysis
export async function analyzeWithAI(stockData: any) {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free",
        messages: [
          {
            role: "user",
            content: `Analyze this stock data and provide detailed insights: ${JSON.stringify(
              stockData
            )}`,
          },
        ],
      }),
    }
  );

  return await response.json();
}
```

## Cost Comparison

| Service                 | Free Tier       | Paid Plans   | Best For       |
| ----------------------- | --------------- | ------------ | -------------- |
| Yahoo Finance           | Unlimited\*     | N/A          | Development    |
| Alpha Vantage           | 25 calls/day    | $49.99/month | Small apps     |
| Financial Modeling Prep | 250 calls/day   | $15/month    | Medium apps    |
| IEX Cloud               | 500 calls/month | $9/month     | Production     |
| Polygon.io              | 5 calls/minute  | $99/month    | Real-time data |

\*Unofficial, may be rate limited

## Recommendation

For your stock recommender app:

1. **Start with Yahoo Finance** for development
2. **Add Alpha Vantage** as backup
3. **Use OpenRouter** for AI analysis of the real data
4. **Upgrade to IEX Cloud** when ready for production
