// Hybrid Stock Service - Combines Yahoo Finance (real data) + OpenRouter (AI analysis)
// This is the BEST approach: Real data + AI insights + NO API KEYS NEEDED for basic functionality

import { yahooFinanceAPI, YahooStockData } from "./yahooFinanceAPI";
import { openRouterAPI } from "./openRouterAPI";
import { fallbackAPI, FallbackStockData } from "./fallbackAPI";
import { VercelApiService } from "./vercelApiService";
import {
  rapidApiYahooService,
  RapidApiYahooChart,
} from "./rapidApiYahooService";
import {
  DetailedStockAnalysis,
  HealthStatus,
  SignalType,
  DataSource,
  MetricWithSource,
  PriceData,
} from "@/types";

export class HybridStockService {
  // Check if we should use Vercel APIs (when deployed)
  private static shouldUseVercelApi(): boolean {
    return (
      VercelApiService.isVercelEnvironment() ||
      (typeof window !== "undefined" &&
        window.location.hostname !== "localhost")
    );
  }

  // New method to fetch comprehensive financial data from multiple endpoints
  async getEnhancedFinancialData(symbol: string) {
    console.log(`🔍 Fetching enhanced financial data for ${symbol}...`);

    const results = await Promise.allSettled([
      rapidApiYahooService.getQuote(symbol),
      rapidApiYahooService.getStatistics(symbol),
      rapidApiYahooService.getFinancials(symbol),
      rapidApiYahooService.getBalanceSheet(symbol),
      rapidApiYahooService.getCashFlow(symbol),
      rapidApiYahooService.getSummary(symbol),
      rapidApiYahooService.getProfile(symbol),
    ]);

    const [
      quote,
      statistics,
      financials,
      balanceSheet,
      cashFlow,
      summary,
      profile,
    ] = results.map((result) =>
      result.status === "fulfilled" ? result.value : null
    );

    console.log(`📊 API Results for ${symbol}:`);
    console.log(`Quote:`, !!quote);
    console.log(`Statistics:`, !!statistics);
    console.log(`Financials:`, !!financials);
    console.log(`Balance Sheet:`, !!balanceSheet);
    console.log(`Cash Flow:`, !!cashFlow);
    console.log(`Summary:`, !!summary);
    console.log(`Profile:`, !!profile);

    return {
      quote,
      statistics,
      financials,
      balanceSheet,
      cashFlow,
      summary,
      profile,
      hasRealData: !!(quote || statistics || financials || summary),
    };
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
        // Build enhanced metrics (profitability/liquidity/etc.) and then fill via AI if needed
        const enhancedData = await this.getEnhancedFinancialData(symbol);
        let analysis = this.createEnhancedAnalysis(symbol, enhancedData);
        analysis = await this.fillMissingProfitabilityWithAI(symbol, analysis);
        analysis = await this.fillMissingLiquidityWithAI(symbol, analysis);
        analysis = await this.fillMissingValuationWithAI(symbol, analysis);
        analysis = await this.fillMissingGrowthWithAI(symbol, analysis);
        console.log(
          `✅ RAPIDAPI YAHOO DATA: Price = ₹${analysis.currentPrice}`
        );
        return analysis;
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
        // Build enhanced metrics and apply AI fills for missing categories
        const enhancedData = await this.getEnhancedFinancialData(symbol);
        let analysis = this.createEnhancedAnalysis(symbol, enhancedData);
        analysis = await this.fillMissingProfitabilityWithAI(symbol, analysis);
        analysis = await this.fillMissingLiquidityWithAI(symbol, analysis);
        analysis = await this.fillMissingValuationWithAI(symbol, analysis);
        analysis = await this.fillMissingGrowthWithAI(symbol, analysis);
        console.log(
          `✅ YAHOO FINANCE DATA: Price = ₹${analysis.currentPrice}`
        );
        return analysis;
      }
    } catch (error) {
      console.log(
        `⚠️ Yahoo Finance via Vercel failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }

    // As a last attempt, try direct RapidAPI Yahoo without proxy
    try {
      if (rapidApiYahooService.isAvailable()) {
        console.log(`🛠️ Fallback: trying direct RapidAPI Yahoo for ${symbol} (no proxy)...`);
        const enhancedData = await this.getEnhancedFinancialData(symbol);
        if (enhancedData.hasRealData) {
          console.log(`✅ Direct RapidAPI Yahoo success for ${symbol} (no proxy)`);
          let analysis = this.createEnhancedAnalysis(symbol, enhancedData);
          analysis = await this.fillMissingProfitabilityWithAI(symbol, analysis);
          analysis = await this.fillMissingLiquidityWithAI(symbol, analysis);
          analysis = await this.fillMissingValuationWithAI(symbol, analysis);
          analysis = await this.fillMissingGrowthWithAI(symbol, analysis);
          return analysis;
        }
      } else {
        console.log(`🔑 RapidAPI key not configured; skipping direct RapidAPI fallback.`);
      }
    } catch (error) {
      console.log(
        `⚠️ Direct RapidAPI Yahoo fallback failed: ${
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

  // Fill missing LIQUIDITY metrics using OpenRouter
  private async fillMissingLiquidityWithAI(
    symbol: string,
    analysis: DetailedStockAnalysis
  ): Promise<DetailedStockAnalysis> {
    try {
      const liq = (analysis.financialHealth?.liquidity || {}) as Record<string, MetricWithSource>;
      const wanted = [
        "Current Ratio",
        "Quick Ratio",
        "Debt-to-Equity",
        "Interest Coverage",
      ];

      const missing = wanted.filter((k) => {
        const m = liq[k];
        return !m || m.isNA || m.dataSource === DataSource.MOCK || !m.value;
      });

      if (missing.length === 0) return analysis;

      const prompt = `Return ONLY JSON (no prose) estimating missing liquidity ratios for ${symbol}. Output must be valid JSON matching exactly this schema: {"liquidity": {"Current Ratio": number, "Quick Ratio": number, "Debt-to-Equity": number, "Interest Coverage": number}}. Numbers only (no quotes, no %).`;

      const resp = await VercelApiService.fetchOpenRouterAnalysis(symbol, prompt);
      const content = resp?.choices?.[0]?.message?.content || "";
      let jsonStr = content;
      const codeMatch = content.match(/\{[\s\S]*\}/);
      if (codeMatch) jsonStr = codeMatch[0];
      let parsed: any = null;
      try { parsed = JSON.parse(jsonStr); } catch (_) { parsed = null; }
      if (!parsed || !parsed.liquidity) return analysis;

      const updated = { ...analysis } as DetailedStockAnalysis;
      updated.financialHealth = { ...analysis.financialHealth } as any;
      const base = { ...(analysis.financialHealth?.liquidity || {}) } as Record<string, MetricWithSource>;

      const toNumber = (v: any) => {
        if (typeof v === 'number') return v;
        if (typeof v === 'string') {
          const cleaned = v.replace(/%/g, '').trim();
          const num = parseFloat(cleaned);
          if (!Number.isNaN(num)) return num;
        }
        return undefined;
      };

      const assessCR = (x: number) => {
        if (x >= 2) return HealthStatus.BEST;
        if (x >= 1.5) return HealthStatus.GOOD;
        if (x >= 1) return HealthStatus.NORMAL;
        if (x > 0.5) return HealthStatus.BAD;
        return HealthStatus.WORSE;
      };
      const assessQR = (x: number) => {
        if (x >= 1.5) return HealthStatus.BEST;
        if (x >= 1.2) return HealthStatus.GOOD;
        if (x >= 1) return HealthStatus.NORMAL;
        if (x > 0.5) return HealthStatus.BAD;
        return HealthStatus.WORSE;
      };

      console.log(`🤖 Filling missing liquidity via AI for ${symbol}:`, missing);
      wanted.forEach((k) => {
        const m = base[k];
        const raw = parsed.liquidity?.[k];
        const val = toNumber(raw);
        if ((!m || m.isNA || m.dataSource === DataSource.MOCK || !m.value) && typeof val === 'number' && isFinite(val)) {
          let health = this.assessValueHealth(val);
          if (k === "Interest Coverage") health = this.assessInterestCoverageHealth(val);
          else if (k === "Debt-to-Equity") health = this.assessDebtHealth(val);
          else if (k === "Current Ratio") health = assessCR(val);
          else if (k === "Quick Ratio") health = assessQR(val);

          base[k] = {
            value: val,
            dataSource: DataSource.AI_GENERATED,
            health,
            lastUpdated: new Date(),
          } as MetricWithSource;
          console.log(`✅ AI filled ${k}: ${val}`);
        }
      });

      (updated.financialHealth as any).liquidity = base;
      return updated;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`⚠️ AI liquidity fill skipped: ${msg}`);
      return analysis;
    }
  }

  // Fill missing VALUATION metrics using OpenRouter
  private async fillMissingValuationWithAI(
    symbol: string,
    analysis: DetailedStockAnalysis
  ): Promise<DetailedStockAnalysis> {
    try {
      const valn = (analysis.financialHealth?.valuation || {}) as Record<string, MetricWithSource>;
      const wanted = [
        "P/S Ratio",
        "EV/EBITDA",
        "Dividend Yield",
      ];

      const missing = wanted.filter((k) => {
        const m = valn[k];
        return !m || m.isNA || m.dataSource === DataSource.MOCK || !m.value;
      });

      if (missing.length === 0) return analysis;

      const prompt = `Return ONLY JSON (no prose) estimating missing valuation metrics for ${symbol}. Output must be valid JSON matching exactly this schema: {"valuation": {"P/S Ratio": number, "EV/EBITDA": number, "Dividend Yield": number}}. Numbers only (Dividend Yield as percent without %).`;

      const resp = await VercelApiService.fetchOpenRouterAnalysis(symbol, prompt);
      const content = resp?.choices?.[0]?.message?.content || "";
      let jsonStr = content;
      const codeMatch = content.match(/\{[\s\S]*\}/);
      if (codeMatch) jsonStr = codeMatch[0];
      let parsed: any = null;
      try { parsed = JSON.parse(jsonStr); } catch (_) { parsed = null; }
      if (!parsed || !parsed.valuation) return analysis;

      const updated = { ...analysis } as DetailedStockAnalysis;
      updated.financialHealth = { ...analysis.financialHealth } as any;
      const base = { ...(analysis.financialHealth?.valuation || {}) } as Record<string, MetricWithSource>;

      const toNumber = (v: any) => {
        if (typeof v === 'number') return v;
        if (typeof v === 'string') {
          const cleaned = v.replace(/%/g, '').trim();
          const num = parseFloat(cleaned);
          if (!Number.isNaN(num)) return num;
        }
        return undefined;
      };

      console.log(`🤖 Filling missing valuation via AI for ${symbol}:`, missing);
      wanted.forEach((k) => {
        const m = base[k];
        const raw = parsed.valuation?.[k];
        const val = toNumber(raw);
        if ((!m || m.isNA || m.dataSource === DataSource.MOCK || !m.value) && typeof val === 'number' && isFinite(val)) {
          let health = this.assessValueHealth(val);
          if (k === "Dividend Yield") health = this.assessDividendHealth(val);
          if (k === "P/E Ratio") health = this.assessPEHealth(val);

          base[k] = {
            value: val,
            dataSource: DataSource.AI_GENERATED,
            health,
            lastUpdated: new Date(),
          } as MetricWithSource;
          console.log(`✅ AI filled ${k}: ${val}`);
        }
      });

      (updated.financialHealth as any).valuation = base;
      return updated;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`⚠️ AI valuation fill skipped: ${msg}`);
      return analysis;
    }
  }

  // Fill missing GROWTH metrics using OpenRouter
  private async fillMissingGrowthWithAI(
    symbol: string,
    analysis: DetailedStockAnalysis
  ): Promise<DetailedStockAnalysis> {
    try {
      const growth = (analysis.financialHealth?.growth || {}) as Record<string, MetricWithSource>;
      const wanted = [
        "Revenue CAGR (3Y)",
        "EPS Growth (3Y)",
        "Market Share Growth",
      ];

      const missing = wanted.filter((k) => {
        const m = growth[k];
        return !m || m.isNA || m.dataSource === DataSource.MOCK || !m.value;
      });

      if (missing.length === 0) return analysis;

      const prompt = `Return ONLY JSON (no prose) estimating missing growth metrics for ${symbol}. Output must be valid JSON matching exactly this schema: {"growth": {"Revenue CAGR (3Y)": number, "EPS Growth (3Y)": number, "Market Share Growth": number}}. Use percentages without % sign.`;

      const resp = await VercelApiService.fetchOpenRouterAnalysis(symbol, prompt);
      const content = resp?.choices?.[0]?.message?.content || "";
      let jsonStr = content;
      const codeMatch = content.match(/\{[\s\S]*\}/);
      if (codeMatch) jsonStr = codeMatch[0];
      let parsed: any = null;
      try { parsed = JSON.parse(jsonStr); } catch (_) { parsed = null; }
      if (!parsed || !parsed.growth) return analysis;

      const updated = { ...analysis } as DetailedStockAnalysis;
      updated.financialHealth = { ...analysis.financialHealth } as any;
      const base = { ...(analysis.financialHealth?.growth || {}) } as Record<string, MetricWithSource>;

      const toNumber = (v: any) => {
        if (typeof v === 'number') return v;
        if (typeof v === 'string') {
          const cleaned = v.replace(/%/g, '').trim();
          const num = parseFloat(cleaned);
          if (!Number.isNaN(num)) return num;
        }
        return undefined;
      };

      console.log(`🤖 Filling missing growth via AI for ${symbol}:`, missing);
      wanted.forEach((k) => {
        const m = base[k];
        const raw = parsed.growth?.[k];
        const val = toNumber(raw);
        if ((!m || m.isNA || m.dataSource === DataSource.MOCK || !m.value) && typeof val === 'number' && isFinite(val)) {
          base[k] = {
            value: val,
            dataSource: DataSource.AI_GENERATED,
            health: this.assessValueHealth(val),
            lastUpdated: new Date(),
          } as MetricWithSource;
          console.log(`✅ AI filled ${k}: ${val}%`);
        }
      });

      (updated.financialHealth as any).growth = base;
      return updated;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`⚠️ AI growth fill skipped: ${msg}`);
      return analysis;
    }
  }
  // Use local fallback system for development
  private async getLocalAnalysis(
    symbol: string
  ): Promise<DetailedStockAnalysis> {
    // Check if RapidAPI is available before trying
    if (!rapidApiYahooService.isAvailable()) {
      console.log(
        `🔑 RapidAPI key not configured. Skipping enhanced data fetch for ${symbol}`
      );
    } else {
      // Try enhanced financial data first
      try {
        console.log(
          `🔍 Attempting enhanced financial data fetch for ${symbol}...`
        );
        const enhancedData = await this.getEnhancedFinancialData(symbol);

        if (enhancedData.hasRealData) {
          console.log(`✅ Enhanced data available for ${symbol}!`);
          let analysis = this.createEnhancedAnalysis(symbol, enhancedData);
          analysis = await this.fillMissingProfitabilityWithAI(symbol, analysis);
          analysis = await this.fillMissingLiquidityWithAI(symbol, analysis);
          analysis = await this.fillMissingValuationWithAI(symbol, analysis);
          analysis = await this.fillMissingGrowthWithAI(symbol, analysis);
          return analysis;
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.log(`⚠️ Enhanced data fetch failed: ${msg}`);
      }
    }

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

    // Final fallback: Create enhanced analysis with no real data
    console.log(`🎭 Using mock data with enhanced structure for ${symbol}`);
    const mockEnhancedData = {
      quote: null,
      statistics: null,
      financials: null,
      balanceSheet: null,
      cashFlow: null,
      hasRealData: false,
    };

    return this.createEnhancedAnalysis(symbol, mockEnhancedData);
  }

  // Method to get chart data
  async getChartData(
    symbol: string,
    range: string = "1mo",
    interval: string = "1d"
  ): Promise<{
    data: PriceData[];
    isRealData: boolean;
    dataSource: DataSource;
  }> {
    console.log(`📈 Fetching chart data for ${symbol} (${range}, ${interval})`);

    try {
      // Try to get real chart data from RapidAPI Yahoo
      const chartResponse = await rapidApiYahooService.getChart(
        symbol,
        range,
        interval
      );

      if (chartResponse?.chart?.result?.[0]) {
        const result = chartResponse.chart.result[0];
        const timestamps = result.timestamp || [];
        const quotes = result.indicators?.quote?.[0];
        const adjClose = result.indicators?.adjclose?.[0]?.adjclose;

        if (timestamps.length > 0 && quotes) {
          const priceData: PriceData[] = [];

          for (let i = 0; i < timestamps.length; i++) {
            if (
              quotes.open?.[i] !== undefined &&
              quotes.high?.[i] !== undefined &&
              quotes.low?.[i] !== undefined &&
              quotes.close?.[i] !== undefined &&
              quotes.volume?.[i] !== undefined
            ) {
              priceData.push({
                date: new Date(timestamps[i] * 1000),
                open: quotes.open[i],
                high: quotes.high[i],
                low: quotes.low[i],
                close: adjClose?.[i] || quotes.close[i],
                volume: quotes.volume[i],
              });
            }
          }

          if (priceData.length > 0) {
            console.log(
              `✅ Real chart data retrieved: ${priceData.length} data points`
            );
            return {
              data: priceData,
              isRealData: true,
              dataSource: DataSource.RAPID_API_YAHOO,
            };
          }
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to fetch real chart data: ${msg}`);
    }

    // Fallback to mock data
    console.log(`🎭 Using mock chart data for ${symbol}`);
    const mockData = this.generateMockChartData(range);
    return {
      data: mockData,
      isRealData: false,
      dataSource: DataSource.MOCK,
    };
  }

  // Generate mock chart data as fallback
  private generateMockChartData(range: string): PriceData[] {
    const days = this.getDaysFromRange(range);
    const data: PriceData[] = [];
    const basePrice = 1000 + Math.random() * 1000;
    let currentPrice = basePrice;

    const now = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Add realistic price movement
      const change = (Math.random() - 0.5) * 0.04; // ±2% daily change
      const trend = Math.sin(i / 10) * 0.01; // Add trending pattern
      currentPrice = currentPrice * (1 + change + trend);
      currentPrice = Math.max(currentPrice, basePrice * 0.5);

      const dayHigh = currentPrice * (1 + Math.random() * 0.02);
      const dayLow = currentPrice * (1 - Math.random() * 0.02);

      data.push({
        date: date,
        open: currentPrice * (0.99 + Math.random() * 0.02),
        high: dayHigh,
        low: dayLow,
        close: currentPrice,
        volume: Math.floor(Math.random() * 1000000) + 100000,
      });
    }

    return data;
  }

  // Convert range string to days
  private getDaysFromRange(range: string): number {
    switch (range) {
      case "1d":
        return 1;
      case "5d":
        return 5;
      case "1mo":
        return 30;
      case "3mo":
        return 90;
      case "6mo":
        return 180;
      case "1y":
        return 365;
      case "2y":
        return 730;
      case "5y":
        return 1825;
      default:
        return 30;
    }
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
        `Current market price: ₹${data.currentPrice ? data.currentPrice.toFixed(2) : 'N/A'}`,
        `Market capitalization: ₹${data.marketCap ? (data.marketCap / 10000000).toFixed(0) : 'N/A'} Cr`,
        `P/E Ratio: ${data.peRatio ? data.peRatio.toFixed(1) : "N/A"}`,
        `52-week range: ₹${data.fiftyTwoWeekLow ? data.fiftyTwoWeekLow.toFixed(2) : 'N/A'} - ₹${data.fiftyTwoWeekHigh ? data.fiftyTwoWeekHigh.toFixed(2) : 'N/A'}`,
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
            dataSource: DataSource.YAHOO_FINANCE_API,
          },
          ROA: {
            value: data.roe ? data.roe * 0.7 : 0, // Estimate ROA from ROE
            health: this.assessROEHealth(data.roe ? data.roe * 0.7 : 0),
            dataSource: DataSource.ESTIMATED,
          },
          ROCE: {
            value: data.roe ? data.roe * 1.1 : 0, // Estimate ROCE
            health: this.assessROEHealth(data.roe ? data.roe * 1.1 : 0),
            dataSource: DataSource.ESTIMATED,
          },
          "Gross Margin": { value: 35, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED }, // Default estimate
          "Operating Margin": { value: 20, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
          "Net Margin": { value: 15, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
        },
        liquidity: {
          "Current Ratio": { value: 1.8, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
          "Quick Ratio": { value: 1.5, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
          "Debt-to-Equity": { value: 0.3, health: HealthStatus.BEST, dataSource: DataSource.ESTIMATED },
          "Interest Coverage": { value: 8, health: HealthStatus.BEST, dataSource: DataSource.ESTIMATED },
        },
        valuation: {
          "P/E Ratio": {
            value: data.peRatio || 0,
            health: this.assessPEHealth(data.peRatio),
            dataSource: DataSource.YAHOO_FINANCE_API,
          },
          "P/B Ratio": {
            value: data.bookValue ? data.currentPrice / data.bookValue : 0,
            health: HealthStatus.NORMAL,
            dataSource: DataSource.CALCULATED,
          },
          "P/S Ratio": { value: 5, health: HealthStatus.NORMAL, dataSource: DataSource.ESTIMATED },
          "EV/EBITDA": { value: 15, health: HealthStatus.NORMAL, dataSource: DataSource.ESTIMATED },
          "Dividend Yield": {
            value: data.dividendYield ? data.dividendYield * 100 : 0,
            health: this.assessDividendHealth(data.dividendYield),
            dataSource: DataSource.YAHOO_FINANCE_API,
          },
        },
        growth: {
          "Revenue CAGR (3Y)": { value: 15, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
          "EPS Growth (3Y)": { value: 18, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
          "Market Share Growth": { value: 12, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
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
        `Current market price: ₹${data.currentPrice ? data.currentPrice.toFixed(2) : 'N/A'}`,
        `Price change: ${data.change ? (data.change >= 0 ? "+" : "") + '₹' + data.change.toFixed(2) : 'N/A'} (${data.changePercent ? (data.changePercent >= 0 ? "+" : "") + data.changePercent.toFixed(1) + '%' : 'N/A'})`,
        `Market capitalization: ₹${data.marketCap ? (data.marketCap / 10000000).toFixed(0) : 'N/A'} Cr`,
        `P/E Ratio: ${data.peRatio && data.peRatio > 0 ? data.peRatio.toFixed(1) : "N/A"}`,
        `Trading volume: ${data.volume ? (data.volume / 100000).toFixed(1) : 'N/A'} lakh shares`,
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
          ROE: { value: 15, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
          ROA: { value: 10, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
          ROCE: { value: 18, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
          "Gross Margin": { value: 35, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
          "Operating Margin": { value: 20, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
          "Net Margin": { value: 15, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
        },
        liquidity: {
          "Current Ratio": { value: 1.8, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
          "Quick Ratio": { value: 1.5, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
          "Debt-to-Equity": { value: 0.3, health: HealthStatus.BEST, dataSource: DataSource.ESTIMATED },
          "Interest Coverage": { value: 8, health: HealthStatus.BEST, dataSource: DataSource.ESTIMATED },
        },
        valuation: {
          "P/E Ratio": {
            value: data.peRatio || 0,
            health: this.assessPEHealth(data.peRatio),
            dataSource: DataSource.ESTIMATED,
          },
          "P/B Ratio": { value: 2.5, health: HealthStatus.NORMAL, dataSource: DataSource.ESTIMATED },
          "P/S Ratio": { value: 5, health: HealthStatus.NORMAL, dataSource: DataSource.ESTIMATED },
          "EV/EBITDA": { value: 15, health: HealthStatus.NORMAL, dataSource: DataSource.ESTIMATED },
          "Dividend Yield": { value: 2, health: HealthStatus.NORMAL, dataSource: DataSource.ESTIMATED },
        },
        growth: {
          "Revenue CAGR (3Y)": { value: 15, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
          "EPS Growth (3Y)": { value: 18, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
          "Market Share Growth": { value: 12, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
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

  // Helper function to create MetricWithSource
  private createMetric(
    value: number,
    dataSource: DataSource,
    health?: HealthStatus
  ): MetricWithSource {
    return {
      value,
      health: health || this.assessValueHealth(value),
      dataSource,
      lastUpdated: new Date(),
    };
  }

  // Helper function to create MetricWithSource with N/A for missing data
  private createMetricWithNA(
    value: number | null,
    dataSource: DataSource | null
  ): MetricWithSource {
    if (value === null || dataSource === null) {
      return {
        value: 0,
        health: HealthStatus.NORMAL,
        dataSource: DataSource.MOCK,
        isNA: true,
        lastUpdated: new Date(),
      };
    }
    return {
      value,
      health: this.assessValueHealth(value),
      dataSource,
      isNA: false,
      lastUpdated: new Date(),
    };
  }

  // Create key points based on available data
  private createKeyPoints(
    symbol: string,
    currentPrice: number | null,
    marketCap: number | null,
    peRatio: number | null,
    hasRealData: boolean,
    sector: string,
    industry: string
  ): string[] {
    const points = [];

    if (currentPrice) {
      points.push(`Current price: ₹${currentPrice.toFixed(2)} (Real-time)`);
    } else {
      points.push(`Current price: N/A - Not available from Yahoo Finance API`);
    }

    if (marketCap) {
      points.push(
        `Market cap: ₹${(marketCap / 10000000).toFixed(0)} Cr (Real-time)`
      );
    } else {
      points.push(`Market cap: N/A - Not available from Yahoo Finance API`);
    }

    if (peRatio) {
      points.push(`P/E Ratio: ${peRatio.toFixed(1)} (Real-time)`);
    } else {
      points.push(`P/E Ratio: N/A - Not available from Yahoo Finance API`);
    }

    points.push(`Sector: ${sector !== "N/A" ? sector : "Not available"}`);
    points.push(`Industry: ${industry !== "N/A" ? industry : "Not available"}`);

    return points;
  }

  // Create pros based on available data
  private createProsBasedOnData(
    hasRealData: boolean,
    currentPrice: number | null,
    marketCap: number | null,
    profileData: any
  ): string[] {
    if (!hasRealData) {
      return [
        "Stock symbol recognized in Yahoo Finance",
        "Basic trading information structure available",
        "Potential for future data enhancement",
      ];
    }

    const pros = [];
    if (currentPrice) pros.push("Real-time price data available");
    if (marketCap) pros.push("Market capitalization data available");
    if (profileData) pros.push("Company profile information available");

    pros.push("Data sourced from Yahoo Finance API");
    pros.push("Professional financial data provider");

    return pros;
  }

  // Create cons based on available data
  private createConsBasedOnData(
    hasRealData: boolean,
    symbol: string
  ): string[] {
    if (!hasRealData) {
      return [
        "Limited data available from Yahoo Finance API",
        "Stock may be delisted or not actively traded",
        "Consider verifying stock symbol format",
        "May require different data provider for this market",
      ];
    }

    return [
      "Market data subject to real-time volatility",
      "API dependency for live updates",
      "Some advanced metrics may not be available",
      "Data accuracy depends on exchange reporting",
    ];
  }

  // Helper function to assess metric health based on value
  private assessValueHealth(value: number): HealthStatus {
    if (value > 20) return HealthStatus.BEST;
    if (value > 15) return HealthStatus.GOOD;
    if (value > 10) return HealthStatus.NORMAL;
    if (value > 0) return HealthStatus.BAD;
    return HealthStatus.WORSE;
  }

  // Enhanced method to create analysis with real financial data
  private createEnhancedAnalysis(
    symbol: string,
    enhancedData: any
  ): DetailedStockAnalysis {
    const {
      quote,
      statistics,
      financials,
      balanceSheet,
      cashFlow,
      summary,
      profile,
      hasRealData,
    } = enhancedData;

    console.log(`📊 Creating enhanced analysis for ${symbol}`);
    console.log(`📈 Has real data: ${hasRealData}`);

    // Extract real data from any of the available sources
    // Priority: summary > quote > statistics
    const summaryData = summary?.summaryDetail || summary;
    const quoteData = quote || summaryData;
    const statsObj = statistics || {};
    const keyStats =
      statsObj?.defaultKeyStatistics ||
      (statistics as any)?.quoteSummary?.result?.[0]?.defaultKeyStatistics ||
      (financials as any)?.defaultKeyStatistics ||
      {};

    // financialData can appear under either statistics or financials payloads
    const finFromStats =
      (statistics as any)?.financialData ||
      (statistics as any)?.quoteSummary?.result?.[0]?.financialData ||
      {};
    const finFromFinancials =
      (financials as any)?.financialData ||
      (financials as any)?.quoteSummary?.result?.[0]?.financialData ||
      {};
    const finData = { ...finFromStats, ...finFromFinancials };
    const profileData = profile?.assetProfile || profile;

    // Extract real data or mark as null for N/A display
    const currentPrice =
      summaryData?.regularMarketPrice?.raw ||
      quoteData?.regularMarketPrice ||
      summaryData?.currentPrice?.raw ||
      null;
    const marketCap =
      summaryData?.marketCap?.raw ||
      quoteData?.marketCap ||
      keyStats?.marketCap?.raw ||
      finData?.marketCap?.raw ||
      null;
    const peRatio =
      summaryData?.trailingPE?.raw ||
      quoteData?.trailingPE ||
      keyStats?.trailingPE?.raw ||
      finData?.trailingPE?.raw ||
      null;
    const pbRatio =
      summaryData?.priceToBook?.raw ||
      quoteData?.priceToBook ||
      keyStats?.priceToBook?.raw ||
      finData?.priceToBook?.raw ||
      null;

    // Company info from profile
    const companyName =
      profileData?.longName ||
      quoteData?.shortName ||
      quoteData?.longName ||
      `${symbol.toUpperCase()} Limited`;
    const sector = profileData?.sector || "N/A";
    const industry = profileData?.industry || "N/A";
    const description = profileData?.longBusinessSummary || null;

    // ---------- Derived metrics from financial statements ----------
    // Interest Coverage = EBIT / InterestExpense (fallback to OperatingIncome if EBIT missing)
    const annualIS = financials?.incomeStatementHistory?.incomeStatementHistory || [];
    const quarterlyIS = financials?.incomeStatementHistoryQuarterly?.incomeStatementHistory || [];

    const pickInterestCoverage = (items: any[]): number | null => {
      for (const it of items) {
        const ebit = it?.ebit?.raw ?? it?.ebit ?? it?.operatingIncome?.raw ?? it?.operatingIncome;
        const interest = it?.interestExpense?.raw ?? it?.interestExpense;
        const e = typeof ebit === "number" ? ebit : Number(ebit);
        const i = typeof interest === "number" ? interest : Number(interest);
        if (isFinite(e) && isFinite(i) && Math.abs(i) > 0) {
          return e / Math.abs(i);
        }
      }
      return null;
    };

    const interestCoverageValue =
      pickInterestCoverage(annualIS) ?? pickInterestCoverage(quarterlyIS);

    // Growth metrics from earnings.financialsChart.yearly
    const yearly = financials?.earnings?.financialsChart?.yearly || [];
    const revSeries: number[] = yearly
      .map((y: any) => y?.revenue?.raw ?? y?.revenue)
      .filter((n: any) => typeof n === "number" && isFinite(n));
    const earningsSeries: number[] = yearly
      .map((y: any) => y?.earnings?.raw ?? y?.earnings)
      .filter((n: any) => typeof n === "number" && isFinite(n));

    const revenueCAGR3Y = this.computeCAGRFromSeries(
      revSeries.length >= 4 ? revSeries.slice(-4) : revSeries
    );
    // EPS Growth (3Y) approximation using Net Income CAGR when EPS history is unavailable
    const epsGrowth3Y = this.computeCAGRFromSeries(
      earningsSeries.length >= 4 ? earningsSeries.slice(-4) : earningsSeries
    );

    // Prepare income statement and balance sheet series for fallback calculations
    const incHistQ: any[] =
      (financials as any)?.incomeStatementHistoryQuarterly?.incomeStatementHistory || [];
    const incHistA: any[] =
      (financials as any)?.incomeStatementHistory?.incomeStatementHistory || [];
    const latestIncQ = Array.isArray(incHistQ) && incHistQ.length > 0 ? incHistQ[0] : null;
    const bsHistQ: any[] =
      (balanceSheet as any)?.balanceSheetHistoryQuarterly?.balanceSheetStatements || [];
    const bsHistA: any[] =
      (balanceSheet as any)?.balanceSheetHistory?.balanceSheetStatements || [];

    // Helpers
    const val = (obj: any, key: string): number | null => {
      const raw = obj?.[key]?.raw;
      return typeof raw === 'number' ? raw : null;
    };
    const sumTTM = (arr: any[], key: string, count: number = 4): number | null => {
      if (!Array.isArray(arr) || arr.length === 0) return null;
      let total = 0;
      let used = 0;
      for (let i = 0; i < arr.length && used < count; i++) {
        const v = val(arr[i], key);
        if (typeof v === 'number' && v !== 0) {
          total += v;
          used++;
        }
      }
      return used > 0 ? total : null;
    };
    const latestNonZero = (arr: any[], key: string): number | null => {
      if (!Array.isArray(arr)) return null;
      for (let i = 0; i < arr.length; i++) {
        const v = val(arr[i], key);
        if (typeof v === 'number' && v !== 0) return v;
      }
      return null;
    };

    // Latest quarterly values (may be zero for some IN stocks in RapidAPI)
    const latestRevenue = val(latestIncQ, 'totalRevenue');
    const latestGrossProfit = val(latestIncQ, 'grossProfit');
    const latestOperatingIncome = val(latestIncQ, 'operatingIncome');
    const latestNetIncome = val(latestIncQ, 'netIncome');

    // Robust TTM values and annual fallbacks
    const revenueTTM = sumTTM(incHistQ, 'totalRevenue')
      ?? latestNonZero(incHistA, 'totalRevenue');
    const grossProfitTTM = sumTTM(incHistQ, 'grossProfit')
      ?? latestNonZero(incHistA, 'grossProfit');
    const ebitTTM = sumTTM(incHistQ, 'ebit')
      ?? latestNonZero(incHistA, 'ebit');
    const netIncomeTTMInc = sumTTM(incHistQ, 'netIncome')
      ?? latestNonZero(incHistA, 'netIncome');

    // TTM and book-value based fallbacks from quote/statistics
    const sharesOut =
      quoteData?.sharesOutstanding || keyStats?.sharesOutstanding || null;
    const bookValuePerShare = keyStats?.bookValue || quoteData?.bookValue || null;
    const netIncomeTTM = keyStats?.netIncomeToCommon || netIncomeTTMInc || null;
    const psRatio = quoteData?.priceToSales || summaryData?.priceToSalesTrailing12Months || null;
    const ttmRevenue =
      quoteData?.revenue || (marketCap && psRatio ? marketCap / psRatio : null);
    const ebitdaTTM = quoteData?.ebitda || null;

    // Compute robust profitability values and their sources
    const roeVal =
      finData?.returnOnEquity?.raw != null
        ? finData.returnOnEquity.raw * 100
        : keyStats?.returnOnEquity?.raw != null
        ? keyStats.returnOnEquity.raw * 100
        : netIncomeTTM != null && sharesOut && bookValuePerShare
        ? (netIncomeTTM / (bookValuePerShare * sharesOut)) * 100
        : null;
    const roeSource: DataSource | null =
      finData?.returnOnEquity?.raw != null || keyStats?.returnOnEquity?.raw != null
        ? DataSource.RAPID_API_YAHOO
        : netIncomeTTM != null && sharesOut && bookValuePerShare
        ? DataSource.CALCULATED
        : null;

    const roaVal =
      finData?.returnOnAssets?.raw != null
        ? finData.returnOnAssets.raw * 100
        : keyStats?.returnOnAssets?.raw != null
        ? keyStats.returnOnAssets.raw * 100
        : null; // If assets unavailable, we'll use AI fallback later
    const roaSource: DataSource | null =
      finData?.returnOnAssets?.raw != null || keyStats?.returnOnAssets?.raw != null
        ? DataSource.RAPID_API_YAHOO
        : null;

    // Gross Margin from statements (prefer TTM; avoid zeros)
    const grossMarginFromIncome =
      grossProfitTTM != null && revenueTTM
        ? (grossProfitTTM / revenueTTM) * 100
        : latestGrossProfit != null && latestRevenue
        ? (latestGrossProfit / latestRevenue) * 100
        : null;
    const grossMarginVal =
      finData?.grossMargins?.raw != null
        ? finData.grossMargins.raw * 100
        : keyStats?.grossMargins?.raw != null
        ? keyStats.grossMargins.raw * 100
        : grossMarginFromIncome;
    const grossMarginSource: DataSource | null =
      finData?.grossMargins?.raw != null || keyStats?.grossMargins?.raw != null
        ? DataSource.RAPID_API_YAHOO
        : grossMarginFromIncome != null
        ? DataSource.CALCULATED
        : null;

    const operatingMarginFromIncome =
      ebitTTM != null && revenueTTM
        ? (ebitTTM / revenueTTM) * 100
        : latestOperatingIncome != null && latestRevenue
        ? (latestOperatingIncome / latestRevenue) * 100
        : null;
    const operatingMarginFromEbitda =
      ebitdaTTM != null && ttmRevenue
        ? (ebitdaTTM / ttmRevenue) * 100
        : null;
    const operatingMarginVal =
      finData?.operatingMargins?.raw != null
        ? finData.operatingMargins.raw * 100
        : keyStats?.operatingMargins?.raw != null
        ? keyStats.operatingMargins.raw * 100
        : operatingMarginFromIncome ?? operatingMarginFromEbitda;
    const operatingMarginSource: DataSource | null =
      finData?.operatingMargins?.raw != null || keyStats?.operatingMargins?.raw != null
        ? DataSource.RAPID_API_YAHOO
        : operatingMarginFromIncome != null || operatingMarginFromEbitda != null
        ? DataSource.CALCULATED
        : null;

    const netMarginFromIncome =
      netIncomeTTMInc != null && revenueTTM
        ? (netIncomeTTMInc / revenueTTM) * 100
        : latestNetIncome != null && latestRevenue
        ? (latestNetIncome / latestRevenue) * 100
        : null;
    const netMarginFromTTM =
      netIncomeTTM != null && ttmRevenue
        ? (netIncomeTTM / ttmRevenue) * 100
        : null;
    const netMarginVal =
      finData?.profitMargins?.raw != null
        ? finData.profitMargins.raw * 100
        : keyStats?.profitMargins?.raw != null
        ? keyStats.profitMargins.raw * 100
        : netMarginFromIncome ?? netMarginFromTTM;
    const netMarginSource: DataSource | null =
      finData?.profitMargins?.raw != null || keyStats?.profitMargins?.raw != null
        ? DataSource.RAPID_API_YAHOO
        : netMarginFromIncome != null || netMarginFromTTM != null
        ? DataSource.CALCULATED
        : null;

    // Balance Sheet derived fallbacks for ROA/ROCE
    const latestAssets = val(bsHistQ?.[0], 'totalAssets')
      ?? val(bsHistA?.[0], 'totalAssets');
    const latestCurrLiab = val(bsHistQ?.[0], 'totalCurrentLiabilities')
      ?? val(bsHistA?.[0], 'totalCurrentLiabilities');
    const capitalEmployed =
      latestAssets != null && latestCurrLiab != null
        ? latestAssets - latestCurrLiab
        : null;

    const roaFromTTM =
      netIncomeTTM != null && latestAssets
        ? (netIncomeTTM / latestAssets) * 100
        : null;
    const roceFromTTM =
      ebitTTM != null && capitalEmployed
        ? (ebitTTM / capitalEmployed) * 100
        : null;

    // Create profitability metrics with real data sources - no mock fallbacks
    const profitability: Record<string, MetricWithSource> = {
      ROE: this.createMetricWithNA(roeVal, roeSource),
      ROA: this.createMetricWithNA(
        roaVal ?? roaFromTTM,
        roaVal != null ? roaSource : roaFromTTM != null ? DataSource.CALCULATED : null
      ),
      ROCE: this.createMetricWithNA(
        (keyStats?.returnOnCapitalEmployed?.raw != null ? keyStats.returnOnCapitalEmployed.raw * 100 : null) ??
          roceFromTTM,
        keyStats?.returnOnCapitalEmployed?.raw != null
          ? DataSource.RAPID_API_YAHOO
          : roceFromTTM != null
          ? DataSource.CALCULATED
          : null
      ),
      "Gross Margin": this.createMetricWithNA(grossMarginVal, grossMarginSource),
      "Operating Margin": this.createMetricWithNA(operatingMarginVal, operatingMarginSource),
      "Net Margin": this.createMetricWithNA(netMarginVal, netMarginSource),
    };

    // Create liquidity metrics with real data sources - no mock fallbacks
    const liquidity: Record<string, MetricWithSource> = {
      "Current Ratio": this.createMetricWithNA(
        finData?.currentRatio?.raw || keyStats?.currentRatio?.raw ||
          (balanceSheet?.totalCurrentAssets &&
          balanceSheet?.totalCurrentLiabilities
            ? balanceSheet.totalCurrentAssets /
              balanceSheet.totalCurrentLiabilities
            : null),
        finData?.currentRatio?.raw || keyStats?.currentRatio?.raw
          ? DataSource.RAPID_API_YAHOO
          : balanceSheet?.totalCurrentAssets &&
            balanceSheet?.totalCurrentLiabilities
          ? DataSource.RAPID_API_YAHOO
          : null
      ),
      "Quick Ratio": this.createMetricWithNA(
        finData?.quickRatio?.raw || keyStats?.quickRatio?.raw || null,
        finData?.quickRatio?.raw || keyStats?.quickRatio?.raw ? DataSource.RAPID_API_YAHOO : null
      ),
      "Debt-to-Equity": this.createMetricWithNA(
        keyStats?.debtToEquity?.raw || finData?.debtToEquity?.raw ||
          (balanceSheet?.totalDebt && balanceSheet?.shareholderEquity
            ? balanceSheet.totalDebt / balanceSheet.shareholderEquity
            : null),
        keyStats?.debtToEquity?.raw || finData?.debtToEquity?.raw
          ? DataSource.RAPID_API_YAHOO
          : balanceSheet?.totalDebt && balanceSheet?.shareholderEquity
          ? DataSource.RAPID_API_YAHOO
          : null
      ),
      "Interest Coverage":
        interestCoverageValue !== null
          ? {
              value: interestCoverageValue,
              dataSource: DataSource.CALCULATED,
              health: this.assessInterestCoverageHealth(interestCoverageValue),
              lastUpdated: new Date(),
            }
          : this.createMetricWithNA(null, null),
    };

    // Create valuation metrics with real data sources - no mock fallbacks
    const valuation: Record<string, MetricWithSource> = {
      "P/E Ratio": this.createMetricWithNA(
        peRatio,
        peRatio ? DataSource.RAPID_API_YAHOO : null
      ),
      "P/B Ratio": this.createMetricWithNA(
        pbRatio,
        pbRatio ? DataSource.RAPID_API_YAHOO : null
      ),
      "P/S Ratio": this.createMetricWithNA(
        keyStats?.priceToSalesTrailing12Months?.raw || finData?.priceToSalesTrailing12Months?.raw || null,
        keyStats?.priceToSalesTrailing12Months?.raw || finData?.priceToSalesTrailing12Months?.raw
          ? DataSource.RAPID_API_YAHOO
          : null
      ),
      "EV/EBITDA": this.createMetricWithNA(
        (keyStats?.enterpriseValue?.raw || finData?.enterpriseValue?.raw) && (finData?.ebitda?.raw || keyStats?.ebitda?.raw)
          ? (keyStats?.enterpriseValue?.raw ?? finData?.enterpriseValue?.raw) / (finData?.ebitda?.raw ?? keyStats?.ebitda?.raw)
          : null,
        (keyStats?.enterpriseValue?.raw || finData?.enterpriseValue?.raw) && (finData?.ebitda?.raw || keyStats?.ebitda?.raw)
          ? DataSource.RAPID_API_YAHOO
          : null
      ),
      "Dividend Yield": this.createMetricWithNA(
        summaryData?.dividendYield?.raw
          ? summaryData.dividendYield.raw * 100
          : quoteData?.dividendYield
          ? quoteData.dividendYield * 100
          : null,
        summaryData?.dividendYield?.raw || quoteData?.dividendYield
          ? DataSource.RAPID_API_YAHOO
          : null
      ),
    };

    // Create growth metrics using earnings history where available
    const growth: Record<string, MetricWithSource> = {
      "Revenue CAGR (3Y)": this.createMetricWithNA(
        revenueCAGR3Y !== null ? revenueCAGR3Y : null,
        revenueCAGR3Y !== null ? DataSource.CALCULATED : null
      ),
      "EPS Growth (3Y)": this.createMetricWithNA(
        epsGrowth3Y !== null ? epsGrowth3Y : null,
        epsGrowth3Y !== null ? DataSource.CALCULATED : null
      ),
      // Not available from Yahoo directly; leaving as N/A for now
      "Market Share Growth": this.createMetricWithNA(null, null),
    };

    return {
      symbol: symbol.toUpperCase(),
      name: companyName,
      about:
        description ||
        (hasRealData
          ? `${companyName} - Real-time data available from Yahoo Finance API. Company operates in the ${sector} sector.`
          : `${symbol.toUpperCase()} - Limited data available from Yahoo Finance API for this symbol.`),
      keyPoints: this.createKeyPoints(
        symbol,
        currentPrice,
        marketCap,
        peRatio,
        hasRealData,
        sector,
        industry
      ),
      currentPrice: currentPrice || 0,
      marketCap: marketCap || 0,
      sector: sector,
      industry: industry,
      financialHealth: {
        statements: {
          incomeStatement: hasRealData
            ? HealthStatus.GOOD
            : HealthStatus.NORMAL,
          balanceSheet: balanceSheet ? HealthStatus.GOOD : HealthStatus.NORMAL,
          cashFlow: cashFlow ? HealthStatus.GOOD : HealthStatus.NORMAL,
        },
        profitability,
        liquidity,
        valuation,
        growth,
        management: HealthStatus.GOOD,
        industry: HealthStatus.GOOD,
        risks: HealthStatus.NORMAL,
        outlook: HealthStatus.GOOD,
      },
      technicalIndicators: {
        stochasticRSI: this.generateTechnicalIndicator(
          "Stochastic RSI",
          currentPrice,
          currentPrice * 1.2,
          currentPrice * 0.8
        ),
        connorsRSI: this.generateTechnicalIndicator(
          "Connors RSI",
          currentPrice,
          currentPrice * 1.2,
          currentPrice * 0.8
        ),
        macd: this.generateTechnicalIndicator(
          "MACD",
          currentPrice,
          currentPrice * 1.2,
          currentPrice * 0.8
        ),
        patterns: this.generateTechnicalIndicator(
          "Pattern Analysis",
          currentPrice,
          currentPrice * 1.2,
          currentPrice * 0.8
        ),
        support: this.calculateSupportLevels(currentPrice, currentPrice * 0.8),
        resistance: this.calculateResistanceLevels(
          currentPrice,
          currentPrice * 1.2
        ),
      },
      pros: this.createProsBasedOnData(
        hasRealData,
        currentPrice,
        marketCap,
        profileData
      ),
      cons: this.createConsBasedOnData(hasRealData, symbol),
      priceHistory: [],
      lastUpdated: new Date(),
    };
  }

  // Helper method to assess debt health
  private assessDebtHealth(debtToEquity: number): HealthStatus {
    if (debtToEquity < 0.3) return HealthStatus.BEST;
    if (debtToEquity < 0.5) return HealthStatus.GOOD;
    if (debtToEquity < 1.0) return HealthStatus.NORMAL;
    if (debtToEquity < 2.0) return HealthStatus.BAD;
    return HealthStatus.WORSE;
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

  // Compute CAGR given a series of yearly values (oldest -> newest)
  private computeCAGRFromSeries(values: number[]): number | null {
    if (!values || values.length < 2) return null;
    const first = values[0];
    const last = values[values.length - 1];
    if (!first || !last || first <= 0 || last <= 0) return null;
    const years = values.length - 1;
    const cagr = Math.pow(last / first, 1 / years) - 1;
    return isFinite(cagr) ? cagr * 100 : null; // return percentage
  }

  // Assess health specifically for Interest Coverage ratio
  private assessInterestCoverageHealth(value: number): HealthStatus {
    if (value >= 5) return HealthStatus.BEST;
    if (value >= 3) return HealthStatus.GOOD;
    if (value >= 1.5) return HealthStatus.NORMAL;
    if (value > 0) return HealthStatus.BAD;
    return HealthStatus.WORSE;
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
    const quote =
      result?.[0]?.quote ||
      data.quoteResponse?.result?.[0] ||
      data.quote ||
      data;

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
      currentPrice: currentPrice,
      marketCap: quote.marketCap || 0,
      sector: "Technology",
      industry: "N/A",
      lastUpdated: new Date(), // UI expects lastUpdated
      about:
        "Leading Indian IT services company providing digital transformation solutions.",
      keyPoints: [
        "Strong fundamentals with consistent growth",
        "Market leader in IT services sector",
        "Solid financial performance",
        "Good dividend track record",
      ],
      priceHistory: [],
      // Add financialHealth structure that the UI expects
      financialHealth: {
        statements: {
          incomeStatement: HealthStatus.GOOD,
          balanceSheet: HealthStatus.GOOD,
          cashFlow: HealthStatus.GOOD,
        },
        profitability: {
          ROE: { value: 18.4, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
          ROA: { value: 12.5, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
          ROCE: { value: 25.3, health: HealthStatus.BEST, dataSource: DataSource.ESTIMATED },
          "Gross Margin": { value: 35.2, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
          "Operating Margin": { value: 22.1, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
          "Net Margin": { value: 18.5, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
        },
        liquidity: {
          "Current Ratio": { value: 1.8, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
          "Quick Ratio": { value: 1.5, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
          "Debt-to-Equity Ratio": { value: 0.2, health: HealthStatus.BEST, dataSource: DataSource.ESTIMATED },
          "Interest Coverage Ratio": { value: 15.3, health: HealthStatus.BEST, dataSource: DataSource.ESTIMATED },
        },
        valuation: {
          "P/E Ratio": {
            value: quote.trailingPE || 25.5,
            health: HealthStatus.NORMAL,
            dataSource: DataSource.RAPID_API_YAHOO,
          },
          "P/B Ratio": {
            value: quote.priceToBook || 2.7,
            health: HealthStatus.GOOD,
            dataSource: DataSource.RAPID_API_YAHOO,
          },
          "Price-to-Sales (P/S)": { value: 4.2, health: HealthStatus.NORMAL, dataSource: DataSource.ESTIMATED },
          "Enterprise Value to EBITDA": {
            value: 18.5,
            health: HealthStatus.NORMAL,
            dataSource: DataSource.ESTIMATED,
          },
          "Dividend Yield": {
            value: quote.dividendYield || 2.1,
            health: HealthStatus.GOOD,
            dataSource: DataSource.RAPID_API_YAHOO,
          },
        },
        growth: {
          "Revenue Growth (CAGR)": { value: 16.9, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
          "EPS Growth": { value: 12.3, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
          "Market Share Trends": { value: 85, health: HealthStatus.BEST, dataSource: DataSource.ESTIMATED },
          "Expansion Plans": { value: 75, health: HealthStatus.GOOD, dataSource: DataSource.ESTIMATED },
        },
        management: HealthStatus.GOOD,
        industry: HealthStatus.GOOD,
        risks: HealthStatus.NORMAL,
        outlook: HealthStatus.GOOD,
      },
      technicalIndicators: {
        stochasticRSI: this.generateTechnicalIndicator(
          "Stochastic RSI",
          currentPrice,
          currentPrice * 1.2,
          currentPrice * 0.8
        ),
        connorsRSI: this.generateTechnicalIndicator(
          "Connors RSI",
          currentPrice,
          currentPrice * 1.2,
          currentPrice * 0.8
        ),
        macd: this.generateTechnicalIndicator(
          "MACD",
          currentPrice,
          currentPrice * 1.2,
          currentPrice * 0.8
        ),
        patterns: this.generateTechnicalIndicator(
          "Pattern Analysis",
          currentPrice,
          currentPrice * 1.2,
          currentPrice * 0.8
        ),
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

  // Fill missing profitability metrics using OpenRouter via Vercel proxy
  private async fillMissingProfitabilityWithAI(
    symbol: string,
    analysis: DetailedStockAnalysis
  ): Promise<DetailedStockAnalysis> {
    try {
      const prof = analysis.financialHealth?.profitability || {} as Record<string, MetricWithSource>;
      const wanted = [
        "ROE",
        "ROA",
        "ROCE",
        "Gross Margin",
        "Operating Margin",
        "Net Margin",
      ];

      const missing = wanted.filter((k) => {
        const m = (prof as any)[k];
        return !m || m.isNA || m.dataSource === DataSource.MOCK || !m.value;
      });

      if (missing.length === 0) return analysis;

      const prompt = `Return ONLY JSON (no prose) estimating missing profitability ratios for ${symbol}. Output must be valid JSON matching exactly this schema: {"profitability": {"ROE": number, "ROA": number, "ROCE": number, "Gross Margin": number, "Operating Margin": number, "Net Margin": number}}. Use numbers only (no quotes, no % sign).`;

      const resp = await VercelApiService.fetchOpenRouterAnalysis(symbol, prompt);
      const content = resp?.choices?.[0]?.message?.content || "";
      let jsonStr = content;
      const codeMatch = content.match(/\{[\s\S]*\}/);
      if (codeMatch) jsonStr = codeMatch[0];
      let parsed: any = null;
      try { parsed = JSON.parse(jsonStr); } catch (_) { parsed = null; }
      if (!parsed || !parsed.profitability) return analysis;

      const updated = { ...analysis } as DetailedStockAnalysis;
      updated.financialHealth = { ...analysis.financialHealth } as any;
      const baseProf = { ...(analysis.financialHealth?.profitability || {}) } as Record<string, MetricWithSource>;

      console.log(`🤖 Filling missing profitability via AI for ${symbol}:`, missing);
      wanted.forEach((k) => {
        const m = baseProf[k];
        let val: any = parsed.profitability?.[k];
        if (typeof val === 'string') {
          // strip % and spaces then parse
          const cleaned = val.replace(/%/g, '').trim();
          const num = parseFloat(cleaned);
          if (!Number.isNaN(num)) val = num;
        }
        if ((!m || m.isNA || m.dataSource === DataSource.MOCK || !m.value) && typeof val === 'number' && isFinite(val)) {
          baseProf[k] = {
            value: val,
            dataSource: DataSource.AI_GENERATED,
            health: this.assessValueHealth(val),
            lastUpdated: new Date(),
          } as MetricWithSource;
          console.log(`✅ AI filled ${k}: ${val}%`);
        }
      });

      (updated.financialHealth as any).profitability = baseProf;
      return updated;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`⚠️ AI profitability fill skipped: ${msg}`);
      return analysis;
    }
  }
}

// Export singleton instance
export const hybridStockService = new HybridStockService();

// Helper function for easy use
export const getStockAnalysis = async (
  symbol: string
): Promise<DetailedStockAnalysis> => {
  const service = new HybridStockService();
  return await service.getComprehensiveAnalysis(symbol);
};

// Chart data helper function
export const getStockChartData = async (
  symbol: string,
  range: string = "1mo",
  interval: string = "1d"
): Promise<{
  data: PriceData[];
  isRealData: boolean;
  dataSource: DataSource;
}> => {
  const service = new HybridStockService();
  return await service.getChartData(symbol, range, interval);
};

// Get only real API metrics (no mock data)
export const getRealStockMetrics = async (symbol: string) => {
  console.log(`🔍 Fetching ONLY real metrics for ${symbol}`);

  try {
    const service = new HybridStockService();
    const enhancedData = await service.getEnhancedFinancialData(symbol);

    if (!enhancedData.hasRealData) {
      console.log(`❌ No real data available for ${symbol}`);
      return null;
    }

    const { quote, statistics } = enhancedData;

    console.log(`🔍 Quote data structure:`, quote);
    console.log(`🔍 Statistics data structure:`, statistics);

    // Extract only confirmed real metrics from Yahoo Finance API
    // Using exact field names from the RapidAPI response structure
    const realMetrics = {
      // Basic price and market data - using actual API field names
      currentPrice: quote?.regularMarketPrice || null,
      marketCap: quote?.marketCap || null,
      volume: quote?.regularMarketVolume || null,

      // Price ranges (real 52-week high/low and daily ranges)
      fiftyTwoWeekHigh: quote?.fiftyTwoWeekHigh || null,
      fiftyTwoWeekLow: quote?.fiftyTwoWeekLow || null,
      regularMarketDayHigh: quote?.regularMarketDayHigh || null,
      regularMarketDayLow: quote?.regularMarketDayLow || null,

      // Valuation ratios - using actual API field names
      peRatio: quote?.trailingPE || null,
      forwardPE: quote?.forwardPE || null,
      pbRatio: quote?.priceToBook || null,
      psRatio: quote?.priceToSales || null,

      // Company info - using actual API field names
      companyName: quote?.shortName || quote?.longName || null,
      currency: quote?.currency || "INR",
      exchange: quote?.fullExchangeName || quote?.exchange || null,

      // Market performance
      beta: quote?.beta || null,

      // Dividends - using actual API field name
      dividendYield: quote?.trailingAnnualDividendYield || null,

      // Earnings data - using actual API field names
      earningsPerShare: quote?.epsTrailingTwelveMonths || null,
      bookValue: quote?.bookValue || null,

      // Market changes and previous close
      regularMarketChange: quote?.regularMarketChange || null,
      regularMarketChangePercent: quote?.regularMarketChangePercent || null,
      regularMarketPreviousClose: quote?.regularMarketPreviousClose || null,
      regularMarketOpen: quote?.regularMarketOpen || null,

      // Additional real-time metrics available from API
      averageDailyVolume3Month: quote?.averageDailyVolume3Month || null,
      averageDailyVolume10Day: quote?.averageDailyVolume10Day || null,
      fiftyDayAverage: quote?.fiftyDayAverage || null,
      twoHundredDayAverage: quote?.twoHundredDayAverage || null,

      // Financial metrics from statistics (if available)
      totalCash: quote?.totalCash || null,
      ebitda: quote?.ebitda || null,
      revenue: quote?.revenue || null,
      floatShares: quote?.floatShares || null,
      sharesOutstanding: quote?.sharesOutstanding || null,
    };

    // Filter out null values to return only metrics with real data
    const filteredMetrics = Object.fromEntries(
      Object.entries(realMetrics).filter(([_, value]) => value !== null)
    );

    // Convert raw metric values to MetricWithSource format expected by RealMetricsGrid
    const metricsWithSource: Record<string, MetricWithSource> = {};
    Object.entries(filteredMetrics).forEach(([key, value]) => {
      metricsWithSource[key] = {
        value: value as number,
        dataSource: DataSource.RAPID_API_YAHOO,
        health: HealthStatus.GOOD // All real API data is considered good health
      };
    });

    console.log(
      `✅ Real metrics available for ${symbol}:`,
      Object.keys(filteredMetrics)
    );

    return {
      symbol,
      metrics: metricsWithSource,
      dataSource: DataSource.RAPID_API_YAHOO,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error(`❌ Failed to get real metrics for ${symbol}:`, error);
    return null;
  }
};

// Export for testing in console
export const testStockAPI = async (symbol: string = "TCS") => {
  console.log(`🧪 Testing all data sources for ${symbol}...`);
  const service = new HybridStockService();
  const results = await service.testDataSources(symbol);
  console.log("📊 Results:", results);
  return results;
};

// Quick test function to check current data source
export const checkDataSource = async (symbol: string = "TCS") => {
  console.log(`🔍 ===== CHECKING DATA SOURCE FOR ${symbol} =====`);
  try {
    const service = new HybridStockService();
    const analysis = await service.getComprehensiveAnalysis(symbol);
    console.log(`🎯 SUCCESS! Data retrieved for ${symbol}`);
    console.log(`💰 Price: ₹${analysis.currentPrice}`);
    console.log(`🏢 Company: ${analysis.name}`);
    return analysis;
  } catch (error) {
    console.error(`❌ Failed to get data for ${symbol}:`, error);
    return null;
  }
};
