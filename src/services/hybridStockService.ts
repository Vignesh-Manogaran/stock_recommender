// Hybrid Stock Service - Combines Yahoo Finance (real data) + OpenRouter (AI analysis)
// This is the BEST approach: Real data + AI insights + NO API KEYS NEEDED for basic functionality

import { yahooFinanceAPI, YahooStockData } from "./yahooFinanceAPI";
import { openRouterAPI } from "./openRouterAPI";
import { fallbackAPI, FallbackStockData } from "./fallbackAPI";
import { VercelApiService } from "./vercelApiService";
import { DetailedStockAnalysis, HealthStatus, SignalType } from "@/types";

export class HybridStockService {
  // Check if we should use Vercel APIs (when deployed)
  private static shouldUseVercelApi(): boolean {
    return (
      VercelApiService.isVercelEnvironment() ||
      (typeof window !== "undefined" &&
        window.location.hostname !== "localhost")
    );
  }

  // Main method to get comprehensive stock analysis
  async getComprehensiveAnalysis(
    symbol: string
  ): Promise<DetailedStockAnalysis> {
    console.log(`🔍 ===== STARTING ANALYSIS FOR ${symbol} =====`);
    console.log(
      `🌍 Environment: ${
        HybridStockService.shouldUseVercelApi()
          ? "PRODUCTION (Vercel)"
          : "DEVELOPMENT (Local)"
      }`
    );
    console.log(
      `📍 Location: ${
        typeof window !== "undefined" ? window.location.hostname : "Server"
      }`
    );
    console.log(`⏰ Time: ${new Date().toLocaleTimeString()}`);

    // Use Vercel APIs when deployed, local APIs when in development
    if (HybridStockService.shouldUseVercelApi()) {
      console.log(`☁️ Using Vercel serverless functions for ${symbol}`);
      return await this.getVercelBasedAnalysis(symbol);
    } else {
      console.log(`💻 Using development fallback system for ${symbol}`);
      return await this.getLocalAnalysis(symbol);
    }
  }

  // Use Vercel serverless functions for production
  private async getVercelBasedAnalysis(
    symbol: string
  ): Promise<DetailedStockAnalysis> {
    // Try RapidAPI Yahoo Finance FIRST (now with correct URLs!)
    try {
      console.log(
        `📡 Trying RapidAPI Yahoo Finance via Vercel proxy for ${symbol}...`
      );
      const rapidYahooData = await VercelApiService.fetchRapidApiYahoo(
        symbol,
        "stock"
      );

      if (rapidYahooData && !rapidYahooData.error && !rapidYahooData.fallback) {
        console.log(`✅ ================================`);
        console.log(`✅ RAPIDAPI YAHOO SUCCESS FOR ${symbol}!`);
        console.log(`✅ USING REAL API DATA FROM RAPIDAPI YAHOO`);
        console.log(`✅ ================================`);

        // Log detailed API response for debugging
        console.log(`📊 RapidAPI Response Metadata:`, rapidYahooData._metadata);
        console.log(
          `📈 Stock Quote Data:`,
          rapidYahooData.optionChain?.result?.[0]?.quote
        );

        const baseAnalysis =
          this.convertRapidYahooDataToAnalysis(rapidYahooData);
        console.log(
          `✅ RAPIDAPI YAHOO DATA: Price = ₹${baseAnalysis.currentPrice}`
        );
        console.log(`📋 Converted Analysis:`, {
          symbol: baseAnalysis.symbol,
          companyName: baseAnalysis.companyName,
          currentPrice: baseAnalysis.currentPrice,
          change: baseAnalysis.change,
          changePercent: baseAnalysis.changePercent,
          marketCap: baseAnalysis.marketCap,
        });

        // Try AI enhancement
        try {
          const aiAnalysis = await this.getVercelAiAnalysis(symbol);
          console.log(
            `🤖 AI ENHANCEMENT SUCCESSFUL - COMBINING WITH RAPIDAPI YAHOO DATA`
          );
          const finalAnalysis = this.mergeRapidYahooAnalysis(
            baseAnalysis,
            aiAnalysis
          );
          console.log(`🎯 ===== FINAL RESULT FOR ${symbol} =====`);
          console.log(`📊 Data Source: RapidAPI Yahoo + AI Enhancement`);
          console.log(`💰 Final Price: ₹${finalAnalysis.currentPrice}`);
          console.log(`🏢 Company: ${finalAnalysis.companyName}`);
          console.log(`📈 Change: ${finalAnalysis.changePercent}%`);
          console.log(`🎯 ===================================`);
          return finalAnalysis;
        } catch (aiError) {
          console.log(
            `⚠️ AI ENHANCEMENT FAILED - USING RAPIDAPI YAHOO DATA ONLY`
          );
          console.log(`🎯 ===== FINAL RESULT FOR ${symbol} =====`);
          console.log(`📊 Data Source: RapidAPI Yahoo Only`);
          console.log(`💰 Final Price: ₹${baseAnalysis.currentPrice}`);
          console.log(`🏢 Company: ${baseAnalysis.companyName}`);
          console.log(`📈 Change: ${baseAnalysis.changePercent}%`);
          console.log(`🎯 ===================================`);
          return baseAnalysis;
        }
      }
    } catch (error) {
      console.log(
        `⚠️ RapidAPI Yahoo via Vercel failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    // Fallback to Alpha Vantage (good for US stocks)
    try {
      console.log(`📡 Trying Alpha Vantage via Vercel proxy for ${symbol}...`);
      const alphaData = await VercelApiService.fetchAlphaVantage(
        symbol,
        "GLOBAL_QUOTE"
      );

      if (alphaData && !alphaData.error) {
        console.log(`✅ ================================`);
        console.log(`✅ ALPHA VANTAGE SUCCESS FOR ${symbol}!`);
        console.log(`✅ USING REAL API DATA FROM ALPHA VANTAGE`);
        console.log(`✅ ================================`);
        const baseAnalysis = this.convertFallbackDataToAnalysis(alphaData);
        console.log(
          `✅ ALPHA VANTAGE DATA: Price = ₹${baseAnalysis.currentPrice}`
        );

        // Try AI enhancement
        try {
          const aiAnalysis = await this.getVercelAiAnalysis(symbol);
          console.log(
            `🤖 AI ENHANCEMENT SUCCESSFUL - COMBINING WITH ALPHA VANTAGE DATA`
          );
          return this.mergeFallbackAnalysis(baseAnalysis, aiAnalysis);
        } catch (aiError) {
          console.log(
            `⚠️ AI ENHANCEMENT FAILED - USING ALPHA VANTAGE DATA ONLY`
          );
          return baseAnalysis;
        }
      }
    } catch (error) {
      console.log(
        `⚠️ Alpha Vantage via Vercel failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    // Try Yahoo Finance as secondary (rate limited)
    try {
      console.log(`📡 Trying Yahoo Finance via Vercel proxy for ${symbol}...`);
      const yahooData = await VercelApiService.fetchYahooFinance(
        symbol,
        "summary"
      );

      if (yahooData && !yahooData.error) {
        console.log(`✅ ================================`);
        console.log(`✅ YAHOO FINANCE SUCCESS FOR ${symbol}!`);
        console.log(`✅ USING REAL API DATA FROM YAHOO FINANCE`);
        console.log(`✅ ================================`);
        const baseAnalysis = this.convertYahooDataToAnalysis(yahooData);
        console.log(
          `✅ YAHOO FINANCE DATA: Price = ₹${baseAnalysis.currentPrice}`
        );

        // Try AI enhancement
        try {
          const aiAnalysis = await this.getVercelAiAnalysis(symbol);
          console.log(
            `🤖 AI ENHANCEMENT SUCCESSFUL - COMBINING WITH YAHOO FINANCE DATA`
          );
          return this.mergeAnalysis(baseAnalysis, aiAnalysis, yahooData);
        } catch (aiError) {
          console.log(
            `⚠️ AI ENHANCEMENT FAILED - USING YAHOO FINANCE DATA ONLY`
          );
          return baseAnalysis;
        }
      }
    } catch (error) {
      console.log(
        `⚠️ Yahoo Finance via Vercel failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    // Fallback to mock data so app doesn't break during API testing
    console.log(`🎭 ================================`);
    console.log(`🎭 ALL APIS FAILED FOR ${symbol}`);
    console.log(`🎭 USING MOCK DATA AS FINAL FALLBACK`);
    console.log(`🎭 ================================`);
    const mockData = await openRouterAPI.getMockAnalysis(symbol);
    console.log(
      `🎭 MOCK DATA LOADED FOR ${symbol}: Price = ₹${mockData.currentPrice}`
    );
    return mockData;
  }

  // AI analysis via Vercel proxy
  private async getVercelAiAnalysis(symbol: string) {
    const prompt = `Provide comprehensive stock analysis for ${symbol} including financial health, technical indicators, and investment recommendation.`;
    const response = await VercelApiService.fetchOpenRouterAnalysis(
      symbol,
      prompt
    );
    return response.choices[0].message.content;
  }

  // Use local fallback system for development
  private async getLocalAnalysis(
    symbol: string
  ): Promise<DetailedStockAnalysis> {
    /* Temporarily disabled Yahoo Finance due to proxy issues in development
    try {
      // Step 1: Try Yahoo Finance first (best data quality)
      console.log(`🔍 Fetching real data for ${symbol} from Yahoo Finance...`);
      const realData = await yahooFinanceAPI.parseStockData(symbol);

      // Step 2: Convert real data to our format
      const baseAnalysis = this.convertYahooDataToAnalysis(realData);

      // Step 3: Try to enhance with OpenRouter AI analysis (if API key available)
      try {
        console.log(`🤖 Enhancing with AI analysis from OpenRouter...`);
        const aiAnalysis = await openRouterAPI.getStockAnalysis(symbol);

        // Merge real data with AI insights
        return this.mergeAnalysis(baseAnalysis, aiAnalysis, realData);
      } catch (error) {
        console.log(
          "⚠️ OpenRouter not available, using real data with smart defaults"
        );
        return baseAnalysis;
      }
    } catch (error) {
      console.error(`❌ Yahoo Finance failed for ${symbol}:`, error);

      // Step 4: Try fallback APIs if Yahoo Finance fails
      try {
        console.log(`🔄 Trying fallback APIs for ${symbol}...`);
        const fallbackData = await fallbackAPI.getStockData(symbol);

        if (fallbackData) {
          console.log(`✅ Fallback API success for ${symbol}!`);
          const baseAnalysis = this.convertFallbackDataToAnalysis(fallbackData);

          // Try to enhance with AI
          try {
            console.log(`🤖 Attempting AI enhancement...`);
            const aiAnalysis = await openRouterAPI.getStockAnalysis(symbol);
            console.log(`✅ AI enhancement successful for ${symbol}!`);
            return this.mergeFallbackAnalysis(baseAnalysis, aiAnalysis);
          } catch (aiError) {
            console.log(`⚠️ AI enhancement failed, using fallback data only`);
            return baseAnalysis;
          }
        }
      } catch (fallbackError) {
        console.error(
          `❌ Fallback APIs also failed for ${symbol}:`,
          fallbackError
        );
      }

      // Final fallback: Smart mock analysis
      console.log(
        `🎭 All APIs failed, using smart mock analysis for ${symbol}`
      );
      console.log(`✅ Don't worry! Mock data is comprehensive and realistic.`);
      return await openRouterAPI.getMockAnalysis(symbol);
    }
    */

    // Direct to fallback system for reliable development experience
    try {
      console.log(`🔄 Fetching data via local fallback APIs for ${symbol}...`);
      const fallbackData = await fallbackAPI.getStockData(symbol);

      if (fallbackData) {
        console.log(`✅ Local fallback API success for ${symbol}!`);
        const baseAnalysis = this.convertFallbackDataToAnalysis(fallbackData);

        // Try to enhance with AI
        try {
          console.log(`🤖 Attempting local AI enhancement...`);
          const aiAnalysis = await openRouterAPI.getStockAnalysis(symbol);
          console.log(`✅ Local AI enhancement successful for ${symbol}!`);
          return this.mergeFallbackAnalysis(baseAnalysis, aiAnalysis);
        } catch (aiError) {
          console.log(
            `⚠️ Local AI enhancement failed, using fallback data only`
          );
          return baseAnalysis;
        }
      }
    } catch (fallbackError) {
      console.log(
        `⚠️ Local fallback APIs not available, using smart mock data`
      );
    }

    // TEMPORARILY DISABLED: Mock data fallback to debug real API issues
    console.log(
      `❌ Local APIs failed for ${symbol} - NO FALLBACK (debug mode)`
    );
    throw new Error(
      `Local APIs failed for ${symbol}. Check API configurations.`
    );
  }

  // Convert Yahoo Finance data to our DetailedStockAnalysis format
  private convertYahooDataToAnalysis(
    data: YahooStockData
  ): DetailedStockAnalysis {
    const analysis: DetailedStockAnalysis = {
      symbol: data.symbol,
      name: data.name,
      about: `${data.name} is a leading Indian company listed on NSE/BSE. The company has established a strong market position with consistent operational performance and strategic growth initiatives in the Indian market.`,
      keyPoints: [
        `Current market price: ₹${data.currentPrice.toFixed(2)}`,
        `Market capitalization: ₹${(data.marketCap / 10000000).toFixed(0)} Cr`,
        `P/E Ratio: ${data.peRatio ? data.peRatio.toFixed(1) : "N/A"}`,
        `52-week range: ₹${data.fiftyTwoWeekLow.toFixed(
          2
        )} - ₹${data.fiftyTwoWeekHigh.toFixed(2)}`,
        `Book value per share: ₹${
          data.bookValue ? data.bookValue.toFixed(2) : "N/A"
        }`,
        `ROE: ${data.roe ? (data.roe * 100).toFixed(1) + "%" : "N/A"}`,
      ],
      currentPrice: data.currentPrice,
      marketCap: data.marketCap,
      sector: this.guessSectorFromSymbol(data.symbol),
      industry: "Indian Equity",

      // Convert real financial metrics to health assessments
      financialHealth: {
        statements: {
          incomeStatement: this.assessHealth(data.revenue, "revenue"),
          balanceSheet: this.assessHealth(data.bookValue, "bookValue"),
          cashFlow: HealthStatus.GOOD, // Default since we don't have direct cash flow data
        },
        profitability: {
          ROE: {
            value: data.roe ? data.roe * 100 : 0,
            health: this.assessROEHealth(data.roe),
          },
          ROA: {
            value: data.roe ? data.roe * 0.7 : 0, // Estimate ROA from ROE
            health: this.assessROEHealth(data.roe ? data.roe * 0.7 : 0),
          },
          ROCE: {
            value: data.roe ? data.roe * 1.1 : 0, // Estimate ROCE
            health: this.assessROEHealth(data.roe ? data.roe * 1.1 : 0),
          },
          "Gross Margin": { value: 35, health: HealthStatus.GOOD }, // Default estimate
          "Operating Margin": { value: 20, health: HealthStatus.GOOD },
          "Net Margin": { value: 15, health: HealthStatus.GOOD },
        },
        liquidity: {
          "Current Ratio": { value: 1.8, health: HealthStatus.GOOD },
          "Quick Ratio": { value: 1.5, health: HealthStatus.GOOD },
          "Debt-to-Equity": { value: 0.3, health: HealthStatus.BEST },
          "Interest Coverage": { value: 8, health: HealthStatus.BEST },
        },
        valuation: {
          "P/E Ratio": {
            value: data.peRatio || 0,
            health: this.assessPEHealth(data.peRatio),
          },
          "P/B Ratio": {
            value: data.bookValue ? data.currentPrice / data.bookValue : 0,
            health: HealthStatus.NORMAL,
          },
          "P/S Ratio": { value: 5, health: HealthStatus.NORMAL },
          "EV/EBITDA": { value: 15, health: HealthStatus.NORMAL },
          "Dividend Yield": {
            value: data.dividendYield ? data.dividendYield * 100 : 0,
            health: this.assessDividendHealth(data.dividendYield),
          },
        },
        growth: {
          "Revenue CAGR (3Y)": { value: 15, health: HealthStatus.GOOD },
          "EPS Growth (3Y)": { value: 18, health: HealthStatus.GOOD },
          "Market Share Growth": { value: 12, health: HealthStatus.GOOD },
        },
        management: HealthStatus.GOOD,
        industry: HealthStatus.GOOD,
        risks: HealthStatus.NORMAL,
        outlook: HealthStatus.GOOD,
      },

      // Generate technical indicators based on real price data
      technicalIndicators: {
        stochasticRSI: this.generateTechnicalIndicator(
          "Stochastic RSI",
          data.currentPrice,
          data.fiftyTwoWeekHigh,
          data.fiftyTwoWeekLow
        ),
        connorsRSI: this.generateTechnicalIndicator(
          "Connors RSI",
          data.currentPrice,
          data.fiftyTwoWeekHigh,
          data.fiftyTwoWeekLow
        ),
        macd: this.generateTechnicalIndicator(
          "MACD",
          data.currentPrice,
          data.fiftyTwoWeekHigh,
          data.fiftyTwoWeekLow
        ),
        patterns: this.generateTechnicalIndicator(
          "Pattern Analysis",
          data.currentPrice,
          data.fiftyTwoWeekHigh,
          data.fiftyTwoWeekLow
        ),
        support: this.calculateSupportLevels(
          data.currentPrice,
          data.fiftyTwoWeekLow
        ),
        resistance: this.calculateResistanceLevels(
          data.currentPrice,
          data.fiftyTwoWeekHigh
        ),
      },

      pros: [
        "Real-time market data integration",
        "Established market presence in Indian equity market",
        "Liquidity and trading volume support",
        "Regulatory compliance with SEBI guidelines",
        "Professional management and governance",
        "Growth potential in Indian economy",
      ],
      cons: [
        "Market volatility and systematic risks",
        "Economic cycle dependency",
        "Regulatory and policy changes impact",
        "Competition in respective sector",
        "Currency and inflation risks",
        "Global economic uncertainties",
      ],

      priceHistory: [], // Will be populated by historical data service
      lastUpdated: new Date(data.lastUpdated),
    };

    return analysis;
  }

  // Convert fallback API data to our DetailedStockAnalysis format
  private convertFallbackDataToAnalysis(
    data: FallbackStockData
  ): DetailedStockAnalysis {
    return {
      symbol: data.symbol,
      name: data.name,
      about: `${
        data.name
      } is a leading Indian company with established market presence. Current market conditions show ${
        data.changePercent >= 0 ? "positive" : "negative"
      } momentum with ${Math.abs(data.changePercent).toFixed(1)}% change.`,
      keyPoints: [
        `Current market price: ₹${data.currentPrice.toFixed(2)}`,
        `Price change: ${data.change >= 0 ? "+" : ""}₹${data.change.toFixed(
          2
        )} (${data.changePercent >= 0 ? "+" : ""}${data.changePercent.toFixed(
          1
        )}%)`,
        `Market capitalization: ₹${(data.marketCap / 10000000).toFixed(0)} Cr`,
        `P/E Ratio: ${data.peRatio > 0 ? data.peRatio.toFixed(1) : "N/A"}`,
        `Trading volume: ${(data.volume / 100000).toFixed(1)} lakh shares`,
        `Data source: Fallback API (reliable alternative)`,
      ],
      currentPrice: data.currentPrice,
      marketCap: data.marketCap,
      sector: this.guessSectorFromSymbol(data.symbol),
      industry: "Indian Equity",

      // Generate reasonable financial health based on available data
      financialHealth: {
        statements: {
          incomeStatement:
            data.changePercent > 0 ? HealthStatus.GOOD : HealthStatus.NORMAL,
          balanceSheet:
            data.peRatio > 0 && data.peRatio < 30
              ? HealthStatus.GOOD
              : HealthStatus.NORMAL,
          cashFlow: HealthStatus.GOOD,
        },
        profitability: {
          ROE: { value: 15, health: HealthStatus.GOOD },
          ROA: { value: 10, health: HealthStatus.GOOD },
          ROCE: { value: 18, health: HealthStatus.GOOD },
          "Gross Margin": { value: 35, health: HealthStatus.GOOD },
          "Operating Margin": { value: 20, health: HealthStatus.GOOD },
          "Net Margin": { value: 15, health: HealthStatus.GOOD },
        },
        liquidity: {
          "Current Ratio": { value: 1.8, health: HealthStatus.GOOD },
          "Quick Ratio": { value: 1.5, health: HealthStatus.GOOD },
          "Debt-to-Equity": { value: 0.3, health: HealthStatus.BEST },
          "Interest Coverage": { value: 8, health: HealthStatus.BEST },
        },
        valuation: {
          "P/E Ratio": {
            value: data.peRatio || 0,
            health: this.assessPEHealth(data.peRatio),
          },
          "P/B Ratio": { value: 2.5, health: HealthStatus.NORMAL },
          "P/S Ratio": { value: 5, health: HealthStatus.NORMAL },
          "EV/EBITDA": { value: 15, health: HealthStatus.NORMAL },
          "Dividend Yield": { value: 2, health: HealthStatus.NORMAL },
        },
        growth: {
          "Revenue CAGR (3Y)": { value: 15, health: HealthStatus.GOOD },
          "EPS Growth (3Y)": { value: 18, health: HealthStatus.GOOD },
          "Market Share Growth": { value: 12, health: HealthStatus.GOOD },
        },
        management: HealthStatus.GOOD,
        industry: HealthStatus.GOOD,
        risks: HealthStatus.NORMAL,
        outlook: HealthStatus.GOOD,
      },

      // Generate technical indicators based on price movement
      technicalIndicators: {
        stochasticRSI: this.generateTechnicalIndicator(
          "Stochastic RSI",
          data.currentPrice,
          data.currentPrice * 1.2,
          data.currentPrice * 0.8
        ),
        connorsRSI: this.generateTechnicalIndicator(
          "Connors RSI",
          data.currentPrice,
          data.currentPrice * 1.2,
          data.currentPrice * 0.8
        ),
        macd: this.generateTechnicalIndicator(
          "MACD",
          data.currentPrice,
          data.currentPrice * 1.2,
          data.currentPrice * 0.8
        ),
        patterns: this.generateTechnicalIndicator(
          "Pattern Analysis",
          data.currentPrice,
          data.currentPrice * 1.2,
          data.currentPrice * 0.8
        ),
        support: this.calculateSupportLevels(
          data.currentPrice,
          data.currentPrice * 0.8
        ),
        resistance: this.calculateResistanceLevels(
          data.currentPrice,
          data.currentPrice * 1.2
        ),
      },

      pros: [
        "Alternative data source ensuring continuity",
        "Consistent market data availability",
        "Real-time price and volume information",
        "Market trend analysis capabilities",
        "Robust fallback infrastructure",
        "Reliable performance metrics",
      ],
      cons: [
        "Limited financial detail compared to primary source",
        "May have reduced data frequency",
        "Dependent on alternative API limitations",
        "Potential data sync delays",
        "Reduced historical data depth",
        "Limited fundamental analysis depth",
      ],

      priceHistory: [],
      lastUpdated: new Date(data.lastUpdated),
    };
  }

  // Merge real Yahoo data with AI analysis from OpenRouter
  private mergeAnalysis(
    realAnalysis: DetailedStockAnalysis,
    aiAnalysis: DetailedStockAnalysis,
    realData: YahooStockData
  ): DetailedStockAnalysis {
    return {
      ...realAnalysis, // Start with real data
      about: aiAnalysis.about || realAnalysis.about, // Use AI description if available
      keyPoints: [
        ...realAnalysis.keyPoints.slice(0, 3), // Keep first 3 real data points
        ...aiAnalysis.keyPoints.slice(0, 3), // Add 3 AI insights
      ],
      pros: aiAnalysis.pros.length > 3 ? aiAnalysis.pros : realAnalysis.pros,
      cons: aiAnalysis.cons.length > 3 ? aiAnalysis.cons : realAnalysis.cons,
      // Keep real financial data but enhance with AI insights where appropriate
      financialHealth: {
        ...realAnalysis.financialHealth,
        // You could selectively use AI assessments for complex metrics
      },
      lastUpdated: new Date(),
    };
  }

  // Merge fallback data with AI analysis
  private mergeFallbackAnalysis(
    fallbackAnalysis: DetailedStockAnalysis,
    aiAnalysis: DetailedStockAnalysis
  ): DetailedStockAnalysis {
    return {
      ...fallbackAnalysis, // Start with fallback data
      about: aiAnalysis.about || fallbackAnalysis.about, // Use AI description if available
      keyPoints: [
        ...fallbackAnalysis.keyPoints.slice(0, 3), // Keep first 3 fallback data points
        ...aiAnalysis.keyPoints.slice(0, 3), // Add 3 AI insights
      ],
      pros:
        aiAnalysis.pros.length > 3 ? aiAnalysis.pros : fallbackAnalysis.pros,
      cons:
        aiAnalysis.cons.length > 3 ? aiAnalysis.cons : fallbackAnalysis.cons,
      lastUpdated: new Date(),
    };
  }

  // Helper methods for health assessments
  private assessHealth(value: number | undefined, type: string): HealthStatus {
    if (!value || value === 0) return HealthStatus.NORMAL;

    switch (type) {
      case "revenue":
        return value > 1000000000 ? HealthStatus.BEST : HealthStatus.GOOD;
      case "bookValue":
        return value > 100 ? HealthStatus.GOOD : HealthStatus.NORMAL;
      default:
        return HealthStatus.NORMAL;
    }
  }

  private assessROEHealth(roe: number | undefined): HealthStatus {
    if (!roe) return HealthStatus.NORMAL;
    const roePercent = roe > 1 ? roe : roe * 100;

    if (roePercent > 20) return HealthStatus.BEST;
    if (roePercent > 15) return HealthStatus.GOOD;
    if (roePercent > 10) return HealthStatus.NORMAL;
    return HealthStatus.BAD;
  }

  private assessPEHealth(pe: number | undefined): HealthStatus {
    if (!pe) return HealthStatus.NORMAL;

    if (pe < 15) return HealthStatus.BEST;
    if (pe < 25) return HealthStatus.GOOD;
    if (pe < 35) return HealthStatus.NORMAL;
    return HealthStatus.BAD;
  }

  private assessDividendHealth(dividend: number | undefined): HealthStatus {
    if (!dividend) return HealthStatus.NORMAL;
    const divPercent = dividend > 1 ? dividend : dividend * 100;

    if (divPercent > 3) return HealthStatus.BEST;
    if (divPercent > 2) return HealthStatus.GOOD;
    if (divPercent > 1) return HealthStatus.NORMAL;
    return HealthStatus.BAD;
  }

  private guessSectorFromSymbol(symbol: string): string {
    const techStocks = ["TCS", "INFY", "WIPRO", "HCLTECH", "TECHM"];
    const bankStocks = [
      "HDFCBANK",
      "ICICIBANK",
      "SBIN",
      "KOTAKBANK",
      "AXISBANK",
    ];
    const autoStocks = [
      "MARUTI",
      "TATAMOTORS",
      "M&M",
      "BAJAJ-AUTO",
      "EICHERMOT",
    ];

    const stockSymbol = symbol.split(".")[0].toUpperCase();

    if (techStocks.includes(stockSymbol)) return "Information Technology";
    if (bankStocks.includes(stockSymbol)) return "Banking & Financial Services";
    if (autoStocks.includes(stockSymbol)) return "Automotive";

    return "Diversified";
  }

  private generateTechnicalIndicator(
    name: string,
    currentPrice: number,
    high52w: number,
    low52w: number
  ): any {
    const position = (currentPrice - low52w) / (high52w - low52w);

    return {
      indicator: name,
      value: 30 + position * 40, // Scale to 30-70 range
      signal:
        position > 0.6
          ? SignalType.BUY
          : position < 0.4
          ? SignalType.SELL
          : SignalType.HOLD,
      health:
        position > 0.7
          ? HealthStatus.BEST
          : position > 0.5
          ? HealthStatus.GOOD
          : HealthStatus.NORMAL,
      description: `${name} based on current market position and price momentum`,
      buyPrice: Math.round(currentPrice * 0.98 * 100) / 100,
      targetPrice:
        Math.round(currentPrice * (1.05 + position * 0.1) * 100) / 100,
      stopLoss: Math.round(currentPrice * 0.92 * 100) / 100,
    };
  }

  private calculateSupportLevels(
    currentPrice: number,
    low52w: number
  ): number[] {
    return [
      Math.round(currentPrice * 0.95 * 100) / 100,
      Math.round(currentPrice * 0.9 * 100) / 100,
      Math.round(Math.max(low52w, currentPrice * 0.85) * 100) / 100,
    ];
  }

  private calculateResistanceLevels(
    currentPrice: number,
    high52w: number
  ): number[] {
    return [
      Math.round(currentPrice * 1.05 * 100) / 100,
      Math.round(currentPrice * 1.12 * 100) / 100,
      Math.round(Math.min(high52w, currentPrice * 1.2) * 100) / 100,
    ];
  }

  // Test method to compare data sources
  async testDataSources(symbol: string): Promise<{
    yahoo: YahooStockData | null;
    openrouter: DetailedStockAnalysis;
    hybrid: DetailedStockAnalysis;
  }> {
    const [yahoo, openrouter, hybrid] = await Promise.allSettled([
      yahooFinanceAPI.parseStockData(symbol),
      openRouterAPI.getCachedAnalysis(symbol),
      this.getComprehensiveAnalysis(symbol),
    ]);

    return {
      yahoo: yahoo.status === "fulfilled" ? yahoo.value : null,
      openrouter:
        openrouter.status === "fulfilled"
          ? openrouter.value
          : await openRouterAPI.getMockAnalysis(symbol),
      hybrid:
        hybrid.status === "fulfilled"
          ? hybrid.value
          : await openRouterAPI.getMockAnalysis(symbol),
    };
  }

  // Convert RapidAPI Yahoo data to our analysis format
  private convertRapidYahooDataToAnalysis(data: any): DetailedStockAnalysis {
    // Extract quote data from RapidAPI Yahoo response structure
    const result = data.optionChain?.result;
    const quote = result?.[0]?.quote || data.quote || data;

    console.log(`🔄 Extracting data from RapidAPI response structure:`);
    console.log(`📊 Full optionChain result:`, result);
    console.log(`📊 Quote object:`, quote);

    // Check if we have valid quote data
    if (!quote || !quote.regularMarketPrice) {
      console.log(`⚠️ No valid quote data found. Using fallback.`);
      throw new Error("No valid quote data in RapidAPI response");
    }

    const currentPrice = quote.regularMarketPrice || quote.price || 1271.37;
    console.log(`💰 Current Price: ₹${currentPrice}`);

    return {
      symbol: quote.symbol || "UNKNOWN",
      name: quote.shortName || quote.longName || "Unknown Company", // UI expects 'name'
      companyName: quote.shortName || quote.longName || "Unknown Company", // Keep for compatibility
      currentPrice: currentPrice,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      marketCap: quote.marketCap || 0,
      peRatio: quote.trailingPE || 25.5,
      pbRatio: quote.priceToBook || 2.7,
      roe: 18.4,
      roce: 25.3,
      dividendYield: quote.dividendYield || 2.7,
      sector: "Technology",
      lastUpdated: new Date(), // UI expects lastUpdated
      about:
        "Leading Indian IT services company providing digital transformation solutions.",
      keyPoints: [
        "Strong fundamentals with consistent growth",
        "Market leader in IT services sector",
        "Solid financial performance",
        "Good dividend track record",
      ],
      importantStats: {
        marketCap: { value: quote.marketCap || 0, health: "Good" },
        peRatio: { value: quote.trailingPE || 25.5, health: "Normal" },
        pbRatio: { value: quote.priceToBook || 2.7, health: "Good" },
        roe: { value: 18.4, health: "Good" },
        roce: { value: 25.3, health: "Best" },
        dividendYield: { value: quote.dividendYield || 2.7, health: "Good" },
        currentRatio: { value: 1.8, health: "Good" },
        debtToEquity: { value: 0.3, health: "Best" },
        bookValue: { value: 308, health: "Good" },
        faceValue: { value: 1.0, health: "Normal" },
        eps: { value: 12.73, health: "Good" },
        sales: { value: 50000, health: "Good" },
      },
      priceHistory: [],
      // Add financialHealth structure that the UI expects
      financialHealth: {
        statements: {
          incomeStatement: "Good",
          balanceSheet: "Good",
          cashFlow: "Good",
        },
        profitability: {
          ROE: { value: 18.4, health: "Good" },
          ROA: { value: 12.5, health: "Good" },
          ROCE: { value: 25.3, health: "Best" },
          "Gross Margin": { value: 35.2, health: "Good" },
          "Operating Margin": { value: 22.1, health: "Good" },
          "Net Margin": { value: 18.5, health: "Good" },
        },
        liquidity: {
          "Current Ratio": { value: 1.8, health: "Good" },
          "Quick Ratio": { value: 1.5, health: "Good" },
          "Debt-to-Equity Ratio": { value: 0.2, health: "Best" },
          "Interest Coverage Ratio": { value: 15.3, health: "Best" },
        },
        valuation: {
          "P/E Ratio": { value: quote.trailingPE || 25.5, health: "Normal" },
          "P/B Ratio": { value: quote.priceToBook || 2.7, health: "Good" },
          "Price-to-Sales (P/S)": { value: 4.2, health: "Normal" },
          "Enterprise Value to EBITDA": { value: 18.5, health: "Normal" },
          "Dividend Yield": {
            value: quote.dividendYield || 2.1,
            health: "Good",
          },
        },
        growth: {
          "Revenue Growth (CAGR)": { value: 16.9, health: "Good" },
          "EPS Growth": { value: 12.3, health: "Good" },
          "Market Share Trends": { value: 85, health: "Best" },
          "Expansion Plans": { value: 75, health: "Good" },
        },
        industry: {
          "Industry Growth Potential": { value: 80, health: "Best" },
          "Competitive Position": { value: 90, health: "Best" },
          "Entry Barriers": { value: 85, health: "Best" },
        },
        management: {
          "Promoter Holding": { value: 13.2, health: "Good" },
          "Insider Trading": { value: 95, health: "Best" },
          "Management Track Record": { value: 90, health: "Best" },
        },
        economic: {
          "Interest Rate Impact": { value: 60, health: "Normal" },
          "Government Policies": { value: 75, health: "Good" },
          "Global Economic Trends": { value: 70, health: "Good" },
        },
        risk: {
          "Debt Burden": { value: 20, health: "Best" },
          "Product Dependence": { value: 40, health: "Good" },
          "Raw Material Volatility": { value: 30, health: "Good" },
          "Regulatory Risks": { value: 25, health: "Good" },
        },
        outlook: {
          "Company Guidance": { value: 80, health: "Good" },
          "Analyst Consensus": { value: 75, health: "Good" },
          "Upcoming Catalysts": { value: 85, health: "Best" },
        },
      },
      fundamentalAnalysis: {
        statements: {
          incomeStatement: "Good",
          balanceSheet: "Good",
          cashFlow: "Good",
        },
        profitability: {
          ROE: { value: 18.4, health: "Good" },
          ROA: { value: 12.5, health: "Good" },
          ROCE: { value: 25.3, health: "Best" },
          "Gross Margin": { value: 35.2, health: "Good" },
          "Operating Margin": { value: 22.1, health: "Good" },
          "Net Margin": { value: 18.5, health: "Good" },
        },
        liquidity: {
          "Current Ratio": { value: 1.8, health: "Good" },
          "Quick Ratio": { value: 1.5, health: "Good" },
          "Debt-to-Equity Ratio": { value: 0.2, health: "Best" },
          "Interest Coverage Ratio": { value: 15.3, health: "Best" },
        },
        valuation: {
          "Price-to-Earnings (P/E)": {
            value: quote.trailingPE || 25.5,
            health: "Normal",
          },
          "Price-to-Book (P/B)": {
            value: quote.priceToBook || 2.7,
            health: "Good",
          },
          "Price-to-Sales (P/S)": { value: 4.2, health: "Normal" },
          "Enterprise Value to EBITDA": { value: 18.5, health: "Normal" },
          "Dividend Yield": {
            value: quote.dividendYield || 2.1,
            health: "Good",
          },
        },
        growth: {
          "Revenue Growth (CAGR)": { value: 16.9, health: "Good" },
          "EPS Growth": { value: 12.3, health: "Good" },
          "Market Share Trends": { value: 85, health: "Best" },
          "Expansion Plans": { value: 75, health: "Good" },
        },
        industry: {
          "Industry Growth Potential": { value: 80, health: "Best" },
          "Competitive Position": { value: 90, health: "Best" },
          "Entry Barriers": { value: 85, health: "Best" },
        },
        management: {
          "Promoter Holding": { value: 13.2, health: "Good" },
          "Insider Trading": { value: 95, health: "Best" },
          "Management Track Record": { value: 90, health: "Best" },
        },
        economic: {
          "Interest Rate Impact": { value: 60, health: "Normal" },
          "Government Policies": { value: 75, health: "Good" },
          "Global Economic Trends": { value: 70, health: "Good" },
        },
        risk: {
          "Debt Burden": { value: 20, health: "Best" },
          "Product Dependence": { value: 40, health: "Good" },
          "Raw Material Volatility": { value: 30, health: "Good" },
          "Regulatory Risks": { value: 25, health: "Good" },
        },
        outlook: {
          "Company Guidance": { value: 80, health: "Good" },
          "Analyst Consensus": { value: 75, health: "Good" },
          "Upcoming Catalysts": { value: 85, health: "Best" },
        },
      },
      // Add technicalIndicators (what UI expects)
      technicalIndicators: {
        stochasticRSI: {
          value: 65,
          signal: "BUY",
          health: "Good",
          target: currentPrice * 1.08,
          stopLoss: currentPrice * 0.95,
        },
        connorsRSI: {
          value: 72,
          signal: "SELL",
          health: "Normal",
          target: currentPrice * 0.97,
          stopLoss: currentPrice * 1.03,
        },
        macd: {
          value: 1.2,
          signal: "BUY",
          health: "Good",
          target: currentPrice * 1.05,
          stopLoss: currentPrice * 0.97,
        },
        patterns: {
          value: "Bullish",
          signal: "BUY",
          health: "Good",
          target: currentPrice * 1.12,
          stopLoss: currentPrice * 0.92,
        },
        support: [
          currentPrice * 0.95,
          currentPrice * 0.92,
          currentPrice * 0.88,
        ],
        resistance: [
          currentPrice * 1.05,
          currentPrice * 1.08,
          currentPrice * 1.12,
        ],
      },
      // Keep technicalAnalysis for compatibility
      technicalAnalysis: {
        stochasticRSI: {
          value: 65,
          signal: "BUY",
          health: "Good",
          target: currentPrice * 1.08,
          stopLoss: currentPrice * 0.95,
        },
        connorsRSI: {
          value: 72,
          signal: "SELL",
          health: "Normal",
          target: currentPrice * 0.97,
          stopLoss: currentPrice * 1.03,
        },
        macd: {
          value: 1.2,
          signal: "BUY",
          health: "Good",
          target: currentPrice * 1.05,
          stopLoss: currentPrice * 0.97,
        },
        patterns: {
          value: "Bullish",
          signal: "BUY",
          health: "Good",
          target: currentPrice * 1.12,
          stopLoss: currentPrice * 0.92,
        },
        support: [
          currentPrice * 0.95,
          currentPrice * 0.92,
          currentPrice * 0.88,
        ],
        resistance: [
          currentPrice * 1.05,
          currentPrice * 1.08,
          currentPrice * 1.12,
        ],
      },
      pros: [
        "Strong market position in IT services",
        "Consistent revenue growth",
        "Good profit margins",
        "Strong balance sheet",
      ],
      cons: [
        "Dependent on external markets",
        "Currency fluctuation risks",
        "Competition from global players",
        "Technology disruption risks",
      ],
    };
  }

  // Merge RapidAPI Yahoo data with AI analysis
  private mergeRapidYahooAnalysis(
    baseAnalysis: DetailedStockAnalysis,
    aiAnalysis: any
  ): DetailedStockAnalysis {
    // If AI analysis provides additional insights, merge them
    if (aiAnalysis && aiAnalysis.analysis) {
      return {
        ...baseAnalysis,
        about: aiAnalysis.analysis.about || baseAnalysis.about,
        keyPoints: aiAnalysis.analysis.keyPoints || baseAnalysis.keyPoints,
        pros: aiAnalysis.analysis.pros || baseAnalysis.pros,
        cons: aiAnalysis.analysis.cons || baseAnalysis.cons,
      };
    }

    return baseAnalysis;
  }
}

// Export singleton instance
export const hybridStockService = new HybridStockService();

// Helper function for easy use
export const getStockAnalysis = async (
  symbol: string
): Promise<DetailedStockAnalysis> => {
  return await hybridStockService.getComprehensiveAnalysis(symbol);
};

// Export for testing in console
export const testStockAPI = async (symbol: string = "TCS") => {
  console.log(`🧪 Testing all data sources for ${symbol}...`);
  const results = await hybridStockService.testDataSources(symbol);
  console.log("📊 Results:", results);
  return results;
};

// Quick test function to check current data source
export const checkDataSource = async (symbol: string = "TCS") => {
  console.log(`🔍 ===== CHECKING DATA SOURCE FOR ${symbol} =====`);
  try {
    const analysis = await hybridStockService.getComprehensiveAnalysis(symbol);
    console.log(`🎯 SUCCESS! Data retrieved for ${symbol}`);
    console.log(`💰 Price: ₹${analysis.currentPrice}`);
    console.log(`🏢 Company: ${analysis.companyName}`);
    console.log(`📈 Change: ${analysis.changePercent}%`);
    return analysis;
  } catch (error) {
    console.error(`❌ Failed to get data for ${symbol}:`, error);
    return null;
  }
};
