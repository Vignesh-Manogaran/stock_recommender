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

export interface RapidApiYahooStatistics {
  returnOnEquity?: number;
  returnOnAssets?: number;
  profitMargins?: number;
  operatingMargins?: number;
  grossMargins?: number;
  currentRatio?: number;
  quickRatio?: number;
  debtToEquity?: number;
  interestCoverage?: number;
  priceToBook?: number;
  priceToSales?: number;
  enterpriseValue?: number;
  ebitda?: number;
}

export interface RapidApiYahooBalanceSheet {
  totalAssets?: number;
  totalLiabilities?: number;
  totalCurrentAssets?: number;
  totalCurrentLiabilities?: number;
  totalDebt?: number;
  totalCash?: number;
  shareholderEquity?: number;
  retainedEarnings?: number;
}

export interface RapidApiYahooCashFlow {
  operatingCashflow?: number;
  freeCashflow?: number;
  capitalExpenditures?: number;
  netIncome?: number;
  dividendsPaid?: number;
}

export interface RapidApiYahooChart {
  chart?: {
    result?: Array<{
      meta?: {
        currency?: string;
        symbol?: string;
        regularMarketPrice?: number;
        chartPreviousClose?: number;
        fiftyTwoWeekHigh?: number;
        fiftyTwoWeekLow?: number;
        regularMarketDayHigh?: number;
        regularMarketDayLow?: number;
        regularMarketVolume?: number;
        longName?: string;
        shortName?: string;
        validRanges?: string[];
      };
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          high?: number[];
          open?: number[];
          low?: number[];
          volume?: number[];
          close?: number[];
        }>;
        adjclose?: Array<{
          adjclose?: number[];
        }>;
      };
    }>;
    error?: any;
  };
}

class RapidApiYahooService {
  private readonly baseUrl =
    "https://yahoo-finance-real-time1.p.rapidapi.com";
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
      "X-RapidAPI-Host": "yahoo-finance-real-time1.p.rapidapi.com",
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
   * Get real-time quote data for a symbol using market/get-quotes
   */
  async getQuote(symbol: string): Promise<RapidApiYahooQuote | null> {
    try {
      const yahooSymbol = this.formatSymbolForYahoo(symbol);
      console.log(
        `📡 RapidAPI Yahoo: Getting quote for ${symbol} -> ${yahooSymbol}`
      );

      const response = await fetch(`${this.baseUrl}/market/get-quotes?region=IN&symbols=${yahooSymbol}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          `RapidAPI Yahoo Finance returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log(`✅ RapidAPI Yahoo: Quote data received for ${yahooSymbol}`, data);

      // Extract quote from response
      return data?.body?.quoteSummary?.result?.[0]?.quote || data?.body?.quote || null;
    } catch (error) {
      console.error(`❌ RapidAPI Yahoo quote failed for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get financial statements data using stock/get-financials
   */
  async getFinancials(symbol: string): Promise<RapidApiYahooFinancials | null> {
    try {
      const yahooSymbol = this.formatSymbolForYahoo(symbol);
      console.log(
        `📡 RapidAPI Yahoo: Getting financials for ${symbol} -> ${yahooSymbol}`
      );

      const response = await fetch(
        `${this.baseUrl}/stock/get-financials?symbol=${yahooSymbol}&lang=en-US&region=IN`,
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
        `✅ RapidAPI Yahoo: Financials data received for ${yahooSymbol}`, data
      );

      return data?.quoteSummary?.result?.[0] || data;
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
   * Get comprehensive statistics data using stock/get-statistics
   */
  async getStatistics(symbol: string): Promise<RapidApiYahooStatistics | null> {
    try {
      const yahooSymbol = this.formatSymbolForYahoo(symbol);
      console.log(
        `📡 RapidAPI Yahoo: Getting statistics for ${symbol} -> ${yahooSymbol}`
      );

      const response = await fetch(
        `${this.baseUrl}/stock/get-statistics?region=IN&lang=en-US&symbol=${yahooSymbol}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `RapidAPI Yahoo Statistics returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log(
        `✅ RapidAPI Yahoo: Statistics data received for ${yahooSymbol}`, data
      );

      return data?.quoteSummary?.result?.[0] || data;
    } catch (error) {
      console.error(
        `❌ RapidAPI Yahoo statistics failed for ${symbol}:`,
        error
      );
      return null;
    }
  }

  /**
   * Get balance sheet data using stock/get-balance-sheet
   */
  async getBalanceSheet(symbol: string): Promise<RapidApiYahooBalanceSheet | null> {
    try {
      const yahooSymbol = this.formatSymbolForYahoo(symbol);
      console.log(
        `📡 RapidAPI Yahoo: Getting balance sheet for ${symbol} -> ${yahooSymbol}`
      );

      const response = await fetch(
        `${this.baseUrl}/stock/get-balance-sheet?lang=en-US&region=IN&symbol=${yahooSymbol}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `RapidAPI Yahoo Balance Sheet returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log(
        `✅ RapidAPI Yahoo: Balance sheet data received for ${yahooSymbol}`, data
      );

      return data?.quoteSummary?.result?.[0] || data;
    } catch (error) {
      console.error(
        `❌ RapidAPI Yahoo balance sheet failed for ${symbol}:`,
        error
      );
      return null;
    }
  }

  /**
   * Get cash flow data using stock/get-cashflow
   */
  async getCashFlow(symbol: string): Promise<RapidApiYahooCashFlow | null> {
    try {
      const yahooSymbol = this.formatSymbolForYahoo(symbol);
      console.log(
        `📡 RapidAPI Yahoo: Getting cash flow for ${symbol} -> ${yahooSymbol}`
      );

      const response = await fetch(
        `${this.baseUrl}/stock/get-cashflow?region=IN&lang=en-US&symbol=${yahooSymbol}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `RapidAPI Yahoo Cash Flow returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log(
        `✅ RapidAPI Yahoo: Cash flow data received for ${yahooSymbol}`, data
      );

      return data?.quoteSummary?.result?.[0] || data;
    } catch (error) {
      console.error(
        `❌ RapidAPI Yahoo cash flow failed for ${symbol}:`,
        error
      );
      return null;
    }
  }

  /**
   * Get chart/historical price data using stock/get-chart
   */
  async getChart(
    symbol: string, 
    range: string = "1mo",
    interval: string = "1d"
  ): Promise<RapidApiYahooChart | null> {
    try {
      const yahooSymbol = this.formatSymbolForYahoo(symbol);
      console.log(
        `📡 RapidAPI Yahoo: Getting chart data for ${symbol} -> ${yahooSymbol} (${range}, ${interval})`
      );

      const response = await fetch(
        `${this.baseUrl}/stock/get-chart?symbol=${yahooSymbol}&region=IN&lang=en-US&useYfid=true&includeAdjustedClose=true&events=div%2Csplit%2Cearn&range=${range}&interval=${interval}&includePrePost=false`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Chart API returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log(
        `✅ RapidAPI Yahoo: Chart data received for ${yahooSymbol}`, data
      );

      return data;
    } catch (error) {
      console.error(
        `❌ RapidAPI Yahoo chart failed for ${symbol}:`,
        error
      );
      return null;
    }
  }

  /**
   * Get stock summary data using stock/get-summary
   */
  async getSummary(symbol: string): Promise<any> {
    try {
      const yahooSymbol = this.formatSymbolForYahoo(symbol);
      console.log(
        `📡 RapidAPI Yahoo: Getting summary for ${symbol} -> ${yahooSymbol}`
      );

      const response = await fetch(
        `${this.baseUrl}/stock/get-summary?lang=en-US&symbol=${yahooSymbol}&region=IN`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `RapidAPI Yahoo Summary returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log(
        `✅ RapidAPI Yahoo: Summary data received for ${yahooSymbol}`, data
      );

      return data?.quoteSummary?.result?.[0] || data;
    } catch (error) {
      console.error(
        `❌ RapidAPI Yahoo summary failed for ${symbol}:`,
        error
      );
      return null;
    }
  }

  /**
   * Get company profile using stock/get-profile
   */
  async getProfile(symbol: string): Promise<any> {
    try {
      const yahooSymbol = this.formatSymbolForYahoo(symbol);
      console.log(
        `📡 RapidAPI Yahoo: Getting profile for ${symbol} -> ${yahooSymbol}`
      );

      const response = await fetch(
        `${this.baseUrl}/stock/get-profile?region=IN&lang=en-US&symbol=${yahooSymbol}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(
          `RapidAPI Yahoo Profile returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log(
        `✅ RapidAPI Yahoo: Profile data received for ${yahooSymbol}`, data
      );

      return data?.quoteSummary?.result?.[0]?.assetProfile || data;
    } catch (error) {
      console.error(
        `❌ RapidAPI Yahoo profile failed for ${symbol}:`,
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
