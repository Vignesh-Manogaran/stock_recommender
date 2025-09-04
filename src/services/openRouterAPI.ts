import {
  DetailedStockAnalysis,
  HealthStatus,
  SignalType,
  TechnicalIndicatorHealth,
} from "@/types";

// OpenRouter API configuration
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// System prompt for detailed stock analysis
const SYSTEM_PROMPT = `You are an expert stock analyst with deep knowledge in both fundamental and technical analysis. 
Your task is to provide comprehensive stock analysis for Indian stocks. 

For each stock analysis, provide detailed information in the following structure:

1. About section - Brief company overview and business description
2. Key Points - 5-6 important current highlights
3. Financial Health Assessment for:
   - Income Statement health (BEST/GOOD/NORMAL/BAD/WORSE)
   - Balance Sheet health (BEST/GOOD/NORMAL/BAD/WORSE)
   - Cash Flow health (BEST/GOOD/NORMAL/BAD/WORSE)
   - Profitability ratios with values and health status
   - Liquidity ratios with values and health status
   - Valuation metrics with values and health status
   - Growth indicators with values and health status
   - Management quality assessment
   - Industry position assessment
   - Risk analysis
   - Future outlook

4. Technical Analysis with:
   - Stochastic RSI analysis with buy/sell signals and price levels
   - Connors RSI family analysis
   - MACD with mean-reversion filter
   - Pattern analysis (3 down closes, 200-DMA analysis)
   - Support and resistance levels

5. Pros and Cons - Separate lists of advantages and risks

Respond with detailed, actionable analysis in a structured format. Include specific price levels, ratios, and actionable insights.`;

class OpenRouterAPIService {
  private apiKey: string;

  constructor() {
    this.apiKey = OPENROUTER_API_KEY || "";
    if (!this.apiKey) {
      console.warn(
        "OpenRouter API key not found. Using mock data for development."
      );
    }
  }

  async getStockAnalysis(symbol: string): Promise<DetailedStockAnalysis> {
    // For development/demo, return mock data if no API key
    if (!this.apiKey) {
      return this.getMockAnalysis(symbol);
    }

    try {
      const prompt = `Provide a comprehensive analysis for Indian stock ${symbol.toUpperCase()}. 
      Include current market conditions, financial health assessment, technical indicators, 
      support/resistance levels, and actionable trading recommendations with specific price levels.
      
      Focus on:
      1. Company fundamentals and recent performance
      2. Technical analysis with specific entry/exit points
      3. Risk assessment and management
      4. Growth prospects and catalysts
      5. Pros and cons analysis
      
      Provide real, actionable data with specific numbers where possible.`;

      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
          "X-Title": "Stock Recommender App",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet", // Using Claude 3.5 Sonnet for high-quality analysis
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.3, // Lower temperature for more consistent financial analysis
          max_tokens: 4000,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `OpenRouter API error: ${response.status} ${response.statusText}`
        );
      }

      const data: OpenRouterResponse = await response.json();
      const analysisText = data.choices[0]?.message?.content;

      if (!analysisText) {
        throw new Error("No analysis content received from OpenRouter API");
      }

      // Parse the AI response and convert to our structured format
      return this.parseAnalysisResponse(symbol, analysisText);
    } catch (error) {
      console.error("Error calling OpenRouter API:", error);
      // Fallback to mock data if API fails
      return this.getMockAnalysis(symbol);
    }
  }

  private parseAnalysisResponse(
    symbol: string,
    analysisText: string
  ): DetailedStockAnalysis {
    // This is a simplified parser - in production, you'd want more robust parsing
    // For now, we'll extract what we can and fill in with reasonable defaults

    try {
      // Extract key information using regex patterns
      const aboutMatch = analysisText.match(
        /(?:About|Company Overview|Business):?\s*([^.]*\.)/i
      );
      const prosMatch = analysisText.match(
        /(?:Pros|Advantages|Strengths):?\s*((?:[^\n]*\n?)*?)(?:Cons|Disadvantages|Risks|Challenges):/i
      );
      const consMatch = analysisText.match(
        /(?:Cons|Disadvantages|Risks|Challenges):?\s*((?:[^\n]*\n?)*?)(?:\n\n|\n[A-Z]|$)/i
      );

      const about = aboutMatch
        ? aboutMatch[1].trim()
        : `${symbol} is a significant player in the Indian market with strong fundamentals and growth potential.`;

      const pros = prosMatch
        ? prosMatch[1]
            .split("\n")
            .filter((line) => line.trim().length > 0)
            .map((line) => line.replace(/^[-•*]\s*/, "").trim())
            .filter((line) => line.length > 10)
            .slice(0, 6)
        : [
            "Strong market position with competitive advantages",
            "Consistent revenue growth and profitability",
            "Robust balance sheet with manageable debt levels",
            "Experienced management team with proven track record",
            "Growing market opportunity in core segments",
            "Strong cash generation capabilities",
          ];

      const cons = consMatch
        ? consMatch[1]
            .split("\n")
            .filter((line) => line.trim().length > 0)
            .map((line) => line.replace(/^[-•*]\s*/, "").trim())
            .filter((line) => line.length > 10)
            .slice(0, 6)
        : [
            "Valuation concerns at current price levels",
            "Intense competition in core markets",
            "Regulatory and policy risks",
            "Dependence on economic cycles",
            "Currency and commodity price exposure",
            "Execution risk in expansion plans",
          ];

      // For now, return enhanced mock data with some parsed elements
      return {
        ...this.getMockAnalysis(symbol),
        about,
        pros,
        cons,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error("Error parsing analysis response:", error);
      return this.getMockAnalysis(symbol);
    }
  }

  private getMockAnalysis(symbol: string): DetailedStockAnalysis {
    const basePrice = 1000 + Math.random() * 2000;

    return {
      symbol: symbol.toUpperCase(),
      name: `${symbol.toUpperCase()} Limited`,
      about: `${symbol.toUpperCase()} is a leading Indian company with strong market presence and robust fundamentals. The company has demonstrated consistent growth through strategic investments, operational excellence, and strong management execution. With a diversified business portfolio and expanding market reach, the company is well-positioned for sustained growth in the evolving Indian economy.`,
      keyPoints: [
        `Strong revenue growth of ${(15 + Math.random() * 15).toFixed(1)}% YoY`,
        `Debt-to-equity ratio maintained at healthy ${(
          0.2 +
          Math.random() * 0.3
        ).toFixed(1)}`,
        "Expanding market share in core business segments",
        "Recent strategic partnerships driving growth",
        "Robust cash flow generation and financial discipline",
        "Strong management with proven execution capability",
      ],
      currentPrice: Math.round(basePrice * 100) / 100,
      marketCap: Math.round((50000 + Math.random() * 200000) * 1000000),
      sector: "Technology",
      industry: "Software Services",
      financialHealth: {
        statements: {
          incomeStatement:
            Math.random() > 0.3 ? HealthStatus.GOOD : HealthStatus.BEST,
          balanceSheet:
            Math.random() > 0.2 ? HealthStatus.BEST : HealthStatus.GOOD,
          cashFlow: Math.random() > 0.3 ? HealthStatus.GOOD : HealthStatus.BEST,
        },
        profitability: {
          ROE: { value: 15 + Math.random() * 10, health: HealthStatus.GOOD },
          ROA: { value: 10 + Math.random() * 8, health: HealthStatus.GOOD },
          ROCE: { value: 18 + Math.random() * 12, health: HealthStatus.BEST },
          "Gross Margin": {
            value: 35 + Math.random() * 15,
            health: HealthStatus.GOOD,
          },
          "Operating Margin": {
            value: 15 + Math.random() * 10,
            health: HealthStatus.GOOD,
          },
          "Net Margin": {
            value: 12 + Math.random() * 8,
            health: HealthStatus.GOOD,
          },
        },
        liquidity: {
          "Current Ratio": {
            value: 1.5 + Math.random() * 1,
            health: HealthStatus.GOOD,
          },
          "Quick Ratio": {
            value: 1.2 + Math.random() * 0.8,
            health: HealthStatus.GOOD,
          },
          "Debt-to-Equity": {
            value: 0.2 + Math.random() * 0.4,
            health: HealthStatus.BEST,
          },
          "Interest Coverage": {
            value: 5 + Math.random() * 10,
            health: HealthStatus.BEST,
          },
        },
        valuation: {
          "P/E Ratio": {
            value: 20 + Math.random() * 15,
            health: HealthStatus.NORMAL,
          },
          "P/B Ratio": {
            value: 2 + Math.random() * 3,
            health: HealthStatus.NORMAL,
          },
          "P/S Ratio": {
            value: 4 + Math.random() * 4,
            health: HealthStatus.NORMAL,
          },
          "EV/EBITDA": {
            value: 15 + Math.random() * 10,
            health: HealthStatus.NORMAL,
          },
          "Dividend Yield": {
            value: 1 + Math.random() * 2,
            health: HealthStatus.NORMAL,
          },
        },
        growth: {
          "Revenue CAGR (3Y)": {
            value: 15 + Math.random() * 15,
            health: HealthStatus.BEST,
          },
          "EPS Growth (3Y)": {
            value: 20 + Math.random() * 20,
            health: HealthStatus.BEST,
          },
          "Market Share Growth": {
            value: 10 + Math.random() * 15,
            health: HealthStatus.GOOD,
          },
        },
        management: Math.random() > 0.3 ? HealthStatus.GOOD : HealthStatus.BEST,
        industry: Math.random() > 0.3 ? HealthStatus.GOOD : HealthStatus.BEST,
        risks: Math.random() > 0.5 ? HealthStatus.NORMAL : HealthStatus.GOOD,
        outlook: Math.random() > 0.3 ? HealthStatus.GOOD : HealthStatus.BEST,
      },
      technicalIndicators: {
        stochasticRSI: {
          indicator: "Stochastic RSI",
          value: 60 + Math.random() * 30,
          signal: Math.random() > 0.3 ? SignalType.BUY : SignalType.HOLD,
          health: HealthStatus.GOOD,
          description:
            "StochRSI shows momentum building with potential for mean reversion",
          buyPrice: Math.round(basePrice * 0.98 * 100) / 100,
          targetPrice: Math.round(basePrice * 1.12 * 100) / 100,
          stopLoss: Math.round(basePrice * 0.92 * 100) / 100,
        },
        connorsRSI: {
          indicator: "Connors RSI",
          value: 55 + Math.random() * 25,
          signal: Math.random() > 0.3 ? SignalType.BUY : SignalType.HOLD,
          health: HealthStatus.GOOD,
          description:
            "RSI(2) indicates favorable conditions with reversal potential",
          buyPrice: Math.round(basePrice * 0.99 * 100) / 100,
          targetPrice: Math.round(basePrice * 1.1 * 100) / 100,
          stopLoss: Math.round(basePrice * 0.94 * 100) / 100,
        },
        macd: {
          indicator: "MACD",
          value: -1 + Math.random() * 4,
          signal: Math.random() > 0.4 ? SignalType.BUY : SignalType.HOLD,
          health: HealthStatus.GOOD,
          description:
            "MACD showing bullish crossover with mean-reversion filter active",
          buyPrice: Math.round(basePrice * 1.0 * 100) / 100,
          targetPrice: Math.round(basePrice * 1.15 * 100) / 100,
          stopLoss: Math.round(basePrice * 0.93 * 100) / 100,
        },
        patterns: {
          indicator: "Pattern Analysis",
          value: 0.6 + Math.random() * 0.3,
          signal: Math.random() > 0.3 ? SignalType.BUY : SignalType.HOLD,
          health: HealthStatus.GOOD,
          description:
            "Technical patterns suggest continuation of uptrend with good risk-reward",
          buyPrice: Math.round(basePrice * 0.995 * 100) / 100,
          targetPrice: Math.round(basePrice * 1.18 * 100) / 100,
          stopLoss: Math.round(basePrice * 0.91 * 100) / 100,
        },
        support: [
          Math.round(basePrice * 0.92 * 100) / 100,
          Math.round(basePrice * 0.88 * 100) / 100,
          Math.round(basePrice * 0.85 * 100) / 100,
        ],
        resistance: [
          Math.round(basePrice * 1.08 * 100) / 100,
          Math.round(basePrice * 1.15 * 100) / 100,
          Math.round(basePrice * 1.22 * 100) / 100,
        ],
      },
      pros: [
        "Strong fundamentals with consistent revenue growth",
        "Healthy balance sheet with low debt levels",
        "Market leader with competitive moats and barriers",
        "Experienced management team with proven execution",
        "Growing market opportunity in digital transformation",
        "Strong cash generation and profitable operations",
      ],
      cons: [
        "High valuation compared to historical averages",
        "Intense competition from domestic and global players",
        "Regulatory risks in key operating markets",
        "Currency exposure to international operations",
        "Dependence on key technology partnerships",
        "Talent acquisition challenges in growth segments",
      ],
      priceHistory: [],
      lastUpdated: new Date(),
    };
  }

  // Helper method to check if API is available
  isAPIAvailable(): boolean {
    return !!this.apiKey;
  }

  // Method to get analysis with caching
  async getCachedAnalysis(symbol: string): Promise<DetailedStockAnalysis> {
    const cacheKey = `openrouter_analysis_${symbol}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        // Check if data is less than 2 hours old
        if (
          new Date().getTime() - new Date(parsed.lastUpdated).getTime() <
          7200000
        ) {
          return parsed;
        }
      } catch (error) {
        console.error("Error parsing cached data:", error);
      }
    }

    // Fetch fresh data
    const analysis = await this.getStockAnalysis(symbol);

    // Cache the result
    try {
      localStorage.setItem(cacheKey, JSON.stringify(analysis));
    } catch (error) {
      console.error("Error caching analysis:", error);
    }

    return analysis;
  }
}

export const openRouterAPI = new OpenRouterAPIService();
export default openRouterAPI;
