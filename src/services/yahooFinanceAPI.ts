// Yahoo Finance API Service - NO API KEY NEEDED!
// Free, unlimited* access to real Indian stock data

export interface YahooStockData {
  symbol: string;
  name: string;
  currentPrice: number;
  previousClose: number;
  dayLow: number;
  dayHigh: number;
  marketCap: number;
  peRatio: number;
  bookValue: number;
  roe: number;
  revenue: number;
  dividendYield: number;
  eps: number;
  volume: number;
  avgVolume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  lastUpdated: string;
}

export interface YahooFinancialData {
  totalRevenue?: { raw: number; fmt: string };
  totalDebt?: { raw: number; fmt: string };
  returnOnEquity?: { raw: number; fmt: string };
  returnOnAssets?: { raw: number; fmt: string };
  grossMargins?: { raw: number; fmt: string };
  operatingMargins?: { raw: number; fmt: string };
  profitMargins?: { raw: number; fmt: string };
  currentRatio?: { raw: number; fmt: string };
  quickRatio?: { raw: number; fmt: string };
  debtToEquity?: { raw: number; fmt: string };
}

class YahooFinanceService {
  private baseURL = import.meta.env.DEV
    ? "/yahoo-api2"
    : "https://query2.finance.yahoo.com";
  private chartURL = import.meta.env.DEV
    ? "/yahoo-api"
    : "https://query1.finance.yahoo.com";

  // Convert regular symbol to Yahoo format (e.g., TCS -> TCS.NS)
  private formatSymbol(symbol: string): string {
    if (symbol.includes(".")) return symbol;

    // Common Indian stock exchanges
    const indianExchanges = {
      // NSE (National Stock Exchange) - most common
      TCS: "TCS.NS",
      RELIANCE: "RELIANCE.NS",
      INFY: "INFY.NS",
      HDFCBANK: "HDFCBANK.NS",
      ICICIBANK: "ICICIBANK.NS",
      WIPRO: "WIPRO.NS",
      LT: "LT.NS",
      BHARTIARTL: "BHARTIARTL.NS",
      MARUTI: "MARUTI.NS",
      ASIANPAINT: "ASIANPAINT.NS",
    };

    // If we have a specific mapping, use it
    if (indianExchanges[symbol.toUpperCase() as keyof typeof indianExchanges]) {
      return indianExchanges[
        symbol.toUpperCase() as keyof typeof indianExchanges
      ];
    }

    // Default to NSE for Indian stocks
    return `${symbol.toUpperCase()}.NS`;
  }

  // Get basic stock quote
  async getStockQuote(symbol: string): Promise<any> {
    const yahooSymbol = this.formatSymbol(symbol);

    try {
      const response = await fetch(
        `${this.chartURL}/v8/finance/chart/${yahooSymbol}`,
        {
          method: "GET",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.chart?.result?.[0]) {
        throw new Error(`No data found for symbol: ${yahooSymbol}`);
      }

      return data.chart.result[0];
    } catch (error) {
      console.error(`Error fetching quote for ${yahooSymbol}:`, error);
      throw error;
    }
  }

  // Get detailed financial data
  async getDetailedStockData(symbol: string): Promise<any> {
    const yahooSymbol = this.formatSymbol(symbol);

    const modules = [
      "price",
      "financialData",
      "defaultKeyStatistics",
      "summaryDetail",
      "balanceSheetHistory",
      "incomeStatementHistory",
      "cashflowStatementHistory",
      "earnings",
    ].join(",");

    try {
      const response = await fetch(
        `${this.baseURL}/v10/finance/quoteSummary/${yahooSymbol}?modules=${modules}`,
        {
          method: "GET",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.quoteSummary?.result?.[0]) {
        throw new Error(`No detailed data found for symbol: ${yahooSymbol}`);
      }

      return data.quoteSummary.result[0];
    } catch (error) {
      console.error(`Error fetching detailed data for ${yahooSymbol}:`, error);
      throw error;
    }
  }

  // Parse and format the data for our app
  async parseStockData(symbol: string): Promise<YahooStockData> {
    try {
      const [quoteData, detailData] = await Promise.all([
        this.getStockQuote(symbol),
        this.getDetailedStockData(symbol),
      ]);

      const quote = quoteData.meta;
      const price = detailData.price || {};
      const financialData = detailData.financialData || {};
      const keyStats = detailData.defaultKeyStatistics || {};
      const summaryDetail = detailData.summaryDetail || {};

      return {
        symbol: quote.symbol || symbol,
        name: price.longName || price.shortName || quote.symbol,
        currentPrice: quote.regularMarketPrice || 0,
        previousClose: quote.previousClose || 0,
        dayLow: quote.regularMarketDayLow || 0,
        dayHigh: quote.regularMarketDayHigh || 0,
        marketCap: summaryDetail.marketCap?.raw || 0,
        peRatio: summaryDetail.trailingPE?.raw || 0,
        bookValue: keyStats.bookValue?.raw || 0,
        roe: financialData.returnOnEquity?.raw || 0,
        revenue: financialData.totalRevenue?.raw || 0,
        dividendYield: summaryDetail.dividendYield?.raw || 0,
        eps: keyStats.trailingEps?.raw || 0,
        volume: quote.regularMarketVolume || 0,
        avgVolume: summaryDetail.averageVolume?.raw || 0,
        fiftyTwoWeekHigh: summaryDetail.fiftyTwoWeekHigh?.raw || 0,
        fiftyTwoWeekLow: summaryDetail.fiftyTwoWeekLow?.raw || 0,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Error parsing data for ${symbol}:`, error);
      throw error;
    }
  }

  // Get historical price data
  async getHistoricalData(symbol: string, period: string = "1y"): Promise<any> {
    const yahooSymbol = this.formatSymbol(symbol);

    try {
      const response = await fetch(
        `${this.chartURL}/v8/finance/chart/${yahooSymbol}?range=${period}&interval=1d`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.chart.result[0];
    } catch (error) {
      console.error(
        `Error fetching historical data for ${yahooSymbol}:`,
        error
      );
      throw error;
    }
  }

  // Search for stocks
  async searchStocks(query: string): Promise<any> {
    try {
      const response = await fetch(
        `${this.baseURL}/v1/finance/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.quotes || [];
    } catch (error) {
      console.error(`Error searching for ${query}:`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const yahooFinanceAPI = new YahooFinanceService();

// Helper function to handle errors gracefully
export const getStockDataSafely = async (
  symbol: string
): Promise<YahooStockData | null> => {
  try {
    return await yahooFinanceAPI.parseStockData(symbol);
  } catch (error) {
    console.error(`Failed to get data for ${symbol}:`, error);
    return null;
  }
};

// Test function you can call from console
export const testYahooAPI = async (symbol: string = "TCS") => {
  console.log(`🔍 Testing Yahoo Finance API for ${symbol}...`);
  try {
    const data = await yahooFinanceAPI.parseStockData(symbol);
    console.log("✅ Success!", data);
    return data;
  } catch (error) {
    console.error("❌ Failed:", error);
    return null;
  }
};
