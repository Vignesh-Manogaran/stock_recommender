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
  private apiKey: string;
  private baseUrl = 'https://yahoo-finance-real-time1.p.rapidapi.com';
  private headers: Record<string, string>;
  private rateLimitReset: number = 0;
  private requestCount: number = 0;
  private maxRequestsPerMinute: number = 100; // Conservative limit

  constructor() {
    this.apiKey = import.meta.env.VITE_RAPIDAPI_KEY || '';
    this.headers = {
      'X-RapidAPI-Key': this.apiKey,
      'X-RapidAPI-Host': 'yahoo-finance-real-time1.p.rapidapi.com',
    };
  }

  // Check if we're rate limited
  private isRateLimited(): boolean {
    const now = Date.now();
    if (now < this.rateLimitReset) {
      console.log(`🚫 Rate limited until ${new Date(this.rateLimitReset).toLocaleTimeString()}`);
      return true;
    }
    if (this.requestCount >= this.maxRequestsPerMinute) {
      this.rateLimitReset = now + 60000; // Reset in 1 minute
      this.requestCount = 0;
      console.log(`🚫 Rate limit reached, waiting until ${new Date(this.rateLimitReset).toLocaleTimeString()}`);
      return true;
    }
    return false;
  }

  // Make API request with better error handling
  private async makeRequest(url: string): Promise<any> {
    if (this.isRateLimited()) {
      throw new Error('Rate limited - please wait before making more requests');
    }

    this.requestCount++;
    
    try {
      console.log(`🔗 Making RapidAPI request to: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers,
      });

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const resetTime = retryAfter 
          ? Date.now() + parseInt(retryAfter) * 1000 
          : Date.now() + 60000;
        
        this.rateLimitReset = resetTime;
        console.log(`🚫 Rate limited by API, retry after ${new Date(resetTime).toLocaleTimeString()}`);
        throw new Error(`Rate limited - retry after ${Math.ceil((resetTime - Date.now()) / 1000)} seconds`);
      }

      // Handle other errors
      if (!response.ok) {
        console.log(`❌ API Error ${response.status}: ${response.statusText}`);
        throw new Error(`API Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ RapidAPI request successful`);
      return data;

    } catch (error) {
      console.error('RapidAPI request failed:', error);
      throw error;
    }
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

      const response = await this.makeRequest(`${this.baseUrl}/market/get-quotes?region=IN&symbols=${yahooSymbol}`);

      console.log(`🔍 Full API Response Structure:`, JSON.stringify(response, null, 2));
      
      // Handle different possible response structures
      let quoteData = null;
      
      // Try different response paths
      if (response?.body?.quoteSummary?.result?.[0]?.quote) {
        quoteData = response.body.quoteSummary.result[0].quote;
        console.log(`📊 Found quote in: body.quoteSummary.result[0].quote`);
      } else if (response?.quoteSummary?.result?.[0]?.quote) {
        quoteData = response.quoteSummary.result[0].quote;
        console.log(`📊 Found quote in: quoteSummary.result[0].quote`);
      } else if (response?.body?.quote) {
        quoteData = response.body.quote;
        console.log(`📊 Found quote in: body.quote`);
      } else if (response?.quote) {
        quoteData = response.quote;
        console.log(`📊 Found quote in: quote`);
      } else if (response?.body?.quoteResponse?.result?.[0]) {
        quoteData = response.body.quoteResponse.result[0];
        console.log(`📊 Found quote in: body.quoteResponse.result[0]`);
      } else if (response?.quoteResponse?.result?.[0]) {
        quoteData = response.quoteResponse.result[0];
        console.log(`📊 Found quote in: quoteResponse.result[0]`);
      } else {
        console.log(`⚠️ No quote data found in any expected location`);
        console.log(`🔍 Available keys:`, Object.keys(response || {}));
        if (response?.body) {
          console.log(`🔍 Body keys:`, Object.keys(response.body || {}));
        }
      }
      
      if (quoteData) {
        console.log(`✅ RapidAPI Yahoo: Quote data extracted for ${yahooSymbol}:`, quoteData);
        return quoteData;
      }
      
      return null;
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

      const response = await this.makeRequest(`${this.baseUrl}/stock/get-financials?symbol=${yahooSymbol}&lang=en-US&region=IN`);

      console.log(`🔍 Financials Response Structure:`, JSON.stringify(response, null, 2));
      
      // Handle different possible response structures
      let financialData = null;
      
      if (response?.quoteSummary?.result?.[0]) {
        financialData = response.quoteSummary.result[0];
        console.log(`📊 Found financials in: quoteSummary.result[0]`);
      } else if (response?.body?.quoteSummary?.result?.[0]) {
        financialData = response.body.quoteSummary.result[0];
        console.log(`📊 Found financials in: body.quoteSummary.result[0]`);
      } else {
        console.log(`⚠️ No financial data found in expected location`);
        console.log(`🔍 Available keys:`, Object.keys(response || {}));
      }
      
      if (financialData) {
        console.log(`✅ RapidAPI Yahoo: Financials data extracted for ${yahooSymbol}:`, financialData);
        return financialData;
      }
      
      return null;
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

      const response = await this.makeRequest(`${this.baseUrl}/historical/${yahooSymbol}?period=${period}`);

      const data = response;
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

      const response = await this.makeRequest(`${this.baseUrl}/stock/get-statistics?region=IN&lang=en-US&symbol=${yahooSymbol}`);

      console.log(`🔍 Statistics Response Structure:`, JSON.stringify(response, null, 2));
      
      // Handle different possible response structures
      let statisticsData = null;
      
      if (response?.quoteSummary?.result?.[0]) {
        statisticsData = response.quoteSummary.result[0];
        console.log(`📊 Found statistics in: quoteSummary.result[0]`);
      } else if (response?.body?.quoteSummary?.result?.[0]) {
        statisticsData = response.body.quoteSummary.result[0];
        console.log(`📊 Found statistics in: body.quoteSummary.result[0]`);
      } else {
        console.log(`⚠️ No statistics data found in expected location`);
        console.log(`🔍 Available keys:`, Object.keys(response || {}));
      }
      
      if (statisticsData) {
        console.log(`✅ RapidAPI Yahoo: Statistics data extracted for ${yahooSymbol}:`, statisticsData);
        return statisticsData;
      }
      
      return null;
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

      const response = await this.makeRequest(`${this.baseUrl}/stock/get-balance-sheet?lang=en-US&region=IN&symbol=${yahooSymbol}`);

      const data = response.quoteSummary.result[0];
      console.log(
        `✅ RapidAPI Yahoo: Balance sheet data received for ${yahooSymbol}`, data
      );

      return data;
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

      const response = await this.makeRequest(`${this.baseUrl}/stock/get-cashflow?region=IN&lang=en-US&symbol=${yahooSymbol}`);

      const data = response.quoteSummary.result[0];
      console.log(
        `✅ RapidAPI Yahoo: Cash flow data received for ${yahooSymbol}`, data
      );

      return data;
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

      const response = await this.makeRequest(`${this.baseUrl}/stock/get-chart?symbol=${yahooSymbol}&region=IN&lang=en-US&useYfid=true&includeAdjustedClose=true&events=div%2Csplit%2Cearn&range=${range}&interval=${interval}&includePrePost=false`);

      const data = response;
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

      const response = await this.makeRequest(`${this.baseUrl}/stock/get-summary?lang=en-US&symbol=${yahooSymbol}&region=IN`);

      console.log(`🔍 Summary Response Structure:`, JSON.stringify(response, null, 2));
      
      // Handle different possible response structures
      let summaryData = null;
      
      if (response?.quoteSummary?.result?.[0]) {
        summaryData = response.quoteSummary.result[0];
        console.log(`📊 Found summary in: quoteSummary.result[0]`);
      } else if (response?.body?.quoteSummary?.result?.[0]) {
        summaryData = response.body.quoteSummary.result[0];
        console.log(`📊 Found summary in: body.quoteSummary.result[0]`);
      } else {
        console.log(`⚠️ No summary data found in expected location`);
        console.log(`🔍 Available keys:`, Object.keys(response || {}));
      }
      
      if (summaryData) {
        console.log(`✅ RapidAPI Yahoo: Summary data extracted for ${yahooSymbol}:`, summaryData);
        return summaryData;
      }
      
      return null;
    } catch (error) {
      console.error(
        `❌ RapidAPI Yahoo summary failed for ${symbol}:`,
        error
      );
    }
  }

  /**
   * Get company profile data using stock/get-profile
   */
  async getProfile(symbol: string): Promise<any> {
    try {
      const yahooSymbol = this.formatSymbolForYahoo(symbol);
      console.log(
        `📡 RapidAPI Yahoo: Getting profile for ${symbol} -> ${yahooSymbol}`
      );

      const response = await this.makeRequest(`${this.baseUrl}/stock/get-profile?region=IN&lang=en-US&symbol=${yahooSymbol}`);

      console.log(`🔍 Profile Response Structure:`, JSON.stringify(response, null, 2));
      
      // Handle different possible response structures
      let profileData = null;
      
      if (response?.quoteSummary?.result?.[0]?.assetProfile) {
        profileData = response.quoteSummary.result[0].assetProfile;
        console.log(`📊 Found profile in: quoteSummary.result[0].assetProfile`);
      } else if (response?.body?.quoteSummary?.result?.[0]?.assetProfile) {
        profileData = response.body.quoteSummary.result[0].assetProfile;
        console.log(`📊 Found profile in: body.quoteSummary.result[0].assetProfile`);
      } else if (response?.quoteSummary?.result?.[0]) {
        profileData = response.quoteSummary.result[0];
        console.log(`📊 Found profile data in: quoteSummary.result[0]`);
      } else {
        console.log(`⚠️ No profile data found in expected location`);
        console.log(`🔍 Available keys:`, Object.keys(response || {}));
      }
      
      if (profileData) {
        console.log(`✅ RapidAPI Yahoo: Profile data extracted for ${yahooSymbol}:`, profileData);
        return profileData;
      }
      
      return null;
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
    const isKeyValid = !!this.apiKey && this.apiKey !== 'test-key-for-development-replace-with-real-key';
    const isNotRateLimited = !this.isRateLimited();
    return isKeyValid && isNotRateLimited;
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
