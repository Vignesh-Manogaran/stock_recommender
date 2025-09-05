/**
 * RapidAPI Yahoo Finance Service
 * Uses the official Yahoo Finance Real Time API via RapidAPI
 * More reliable than unofficial scraping methods
 */

export interface RapidApiYahooQuote {
  regularMarketPrice?: number;
  regularMarketChange?: number;
  regularMarketChangePercent?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketVolume?: number;
  marketCap?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  trailingPE?: number;
  priceToBook?: number;
  dividendYield?: number;
  symbol?: string;
  shortName?: string;
  longName?: string;
  currency?: string;
  exchange?: string;
}

export interface RapidApiYahooFinancials {
  totalRevenue?: number;
  grossProfit?: number;
  operatingIncome?: number;
  netIncome?: number;
  totalAssets?: number;
  totalDebt?: number;
  totalCash?: number;
  freeCashflow?: number;
  returnOnEquity?: number;
  returnOnAssets?: number;
  currentRatio?: number;
  debtToEquity?: number;
}

class RapidApiYahooService {
  private readonly baseUrl =
    "https://yahoo-finance-real-time-api.p.rapidapi.com";
  private readonly apiKey: string;

  constructor() {
    // Try different environment variable names
    this.apiKey =
      process.env.RAPIDAPI_KEY ||
      process.env.VITE_RAPIDAPI_KEY ||
      import.meta.env.VITE_RAPIDAPI_KEY ||
      "";

    if (!this.apiKey) {
      console.warn(
        "⚠️ RapidAPI key not found. Set RAPIDAPI_KEY environment variable."
      );
    }
  }

  private getHeaders() {
    return {
      "X-RapidAPI-Key": this.apiKey,
      "X-RapidAPI-Host": "yahoo-finance-real-time-api.p.rapidapi.com",
      "Content-Type": "application/json",
    };
  }

  /**
   * Format symbol for Yahoo Finance
   * For Indian stocks: TCS -> TCS.NS, INFY -> INFY.NS
   */
  private formatSymbolForYahoo(symbol: string): string {
    // If already has exchange suffix, return as is
    if (symbol.includes(".")) {
      return symbol;
    }

    // For Indian stocks, add .NS (National Stock Exchange)
    // You can expand this logic for other exchanges
    const indianStocks = [
      "TCS",
      "INFY",
      "HCLTECH",
      "WIPRO",
      "TECHM",
      "LTI",
      "MINDTREE",
      "RELIANCE",
      "HDFC",
      "ICICIBANK",
      "KOTAKBANK",
      "AXISBANK",
      "ITC",
      "HINDUNILVR",
      "NESTLEIND",
      "ASIANPAINT",
      "TITAN",
      "MARUTI",
      "BAJAJ-AUTO",
      "M&M",
      "TATAMOTORS",
      "EICHERMOT",
    ];

    // Check if it's a known Indian stock
    const cleanSymbol = symbol.replace("_25", "").replace("_", "");
    if (indianStocks.includes(cleanSymbol.toUpperCase())) {
      return `${cleanSymbol}.NS`;
    }

    // Default to .NS for unknown symbols (assuming Indian market)
    return `${cleanSymbol}.NS`;
  }

  /**
   * Get real-time quote data for a symbol
   */
  async getQuote(symbol: string): Promise<RapidApiYahooQuote | null> {
    try {
      const yahooSymbol = this.formatSymbolForYahoo(symbol);
      console.log(
        `📡 RapidAPI Yahoo: Getting quote for ${symbol} -> ${yahooSymbol}`
      );

      const response = await fetch(`${this.baseUrl}/stock/${yahooSymbol}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `RapidAPI Yahoo Finance returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log(`✅ RapidAPI Yahoo: Quote data received for ${yahooSymbol}`);

      return data;
    } catch (error) {
      console.error(`❌ RapidAPI Yahoo quote failed for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get financial statements data
   */
  async getFinancials(symbol: string): Promise<RapidApiYahooFinancials | null> {
    try {
      const yahooSymbol = this.formatSymbolForYahoo(symbol);
      console.log(
        `📡 RapidAPI Yahoo: Getting financials for ${symbol} -> ${yahooSymbol}`
      );

      const response = await fetch(
        `${this.baseUrl}/financials/${yahooSymbol}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `RapidAPI Yahoo Financials returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log(
        `✅ RapidAPI Yahoo: Financials data received for ${yahooSymbol}`
      );

      return data;
    } catch (error) {
      console.error(
        `❌ RapidAPI Yahoo financials failed for ${symbol}:`,
        error
      );
      return null;
    }
  }

  /**
   * Get historical price data
   */
  async getHistoricalData(symbol: string, period: string = "1y"): Promise<any> {
    try {
      const yahooSymbol = this.formatSymbolForYahoo(symbol);
      console.log(
        `📡 RapidAPI Yahoo: Getting historical data for ${symbol} -> ${yahooSymbol}`
      );

      const response = await fetch(
        `${this.baseUrl}/historical/${yahooSymbol}?period=${period}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `RapidAPI Yahoo Historical returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log(
        `✅ RapidAPI Yahoo: Historical data received for ${yahooSymbol}`
      );

      return data;
    } catch (error) {
      console.error(
        `❌ RapidAPI Yahoo historical failed for ${symbol}:`,
        error
      );
      return null;
    }
  }

  /**
   * Check if RapidAPI service is available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Get service status for debugging
   */
  getStatus() {
    return {
      serviceName: "RapidAPI Yahoo Finance",
      available: this.isAvailable(),
      apiKeyConfigured: !!this.apiKey,
      apiKeyPrefix: this.apiKey
        ? this.apiKey.substring(0, 8) + "..."
        : "NOT SET",
    };
  }
}

export const rapidApiYahooService = new RapidApiYahooService();
