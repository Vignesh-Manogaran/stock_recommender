import { aiService, rateLimiter } from './api';
import { getAllStocks } from '@/data/mockStocks';
import { Sector, TimeFrame, SignalType } from '@/types';
import type { 
  StockRecommendation, 
  RecommendationResponse, 
  Stock
} from '@/types';

// Cache for storing recommendations
const recommendationCache = new Map<string, RecommendationResponse>();
const CACHE_TTL = {
  '7D': 15 * 60 * 1000,   // 15 minutes for 7-day recommendations
  '1M': 30 * 60 * 1000,   // 30 minutes for 1-month recommendations
  '3M': 60 * 60 * 1000,   // 1 hour for 3-month recommendations
  '6M': 2 * 60 * 60 * 1000, // 2 hours for 6-month recommendations
  '1Y': 4 * 60 * 60 * 1000, // 4 hours for 1-year recommendations
};

export class StockRecommendationService {
  private static instance: StockRecommendationService;

  public static getInstance(): StockRecommendationService {
    if (!StockRecommendationService.instance) {
      StockRecommendationService.instance = new StockRecommendationService();
    }
    return StockRecommendationService.instance;
  }

  /**
   * Generate cache key for recommendations
   */
  private getCacheKey(timeFrame: TimeFrame, sector: Sector): string {
    return `${timeFrame}_${sector}`;
  }

  /**
   * Calculate stop loss based on current price and recommendation type
   */
  private calculateStopLoss(currentPrice: number, recommendation: SignalType, timeFrame: TimeFrame): number | null {
    if (recommendation === 'SELL') return null; // No stop loss for sell recommendations
    
    // Stop loss percentage varies by time frame
    const stopLossPercentage = {
      '7D': 0.03,   // 3% for short-term trades
      '1M': 0.05,   // 5% for 1-month
      '3M': 0.08,   // 8% for 3-month
      '6M': 0.10,   // 10% for 6-month
      '1Y': 0.15    // 15% for 1-year
    };
    
    const percentage = stopLossPercentage[timeFrame] || 0.08;
    return Math.round((currentPrice * (1 - percentage)) * 100) / 100;
  }

  /**
   * Check if cached data is still valid
   */
  private isCacheValid(cacheKey: string, timeFrame: TimeFrame): boolean {
    const cached = recommendationCache.get(cacheKey);
    if (!cached) return false;

    const now = Date.now();
    const cacheTime = cached.metadata.generatedAt.getTime();
    const ttl = CACHE_TTL[timeFrame];
    
    return (now - cacheTime) < ttl;
  }

  /**
   * Filter stocks by sector
   */
  private filterStocksBySector(stocks: Stock[], sector: Sector): Stock[] {
    if (sector === Sector.ALL) return stocks;
    
    // Map sector enum values to stock sector strings
    const sectorMapping = {
      [Sector.ALL]: [],
      [Sector.TECHNOLOGY]: ['Technology', 'IT Services', 'Software'],
      [Sector.IT]: ['Technology', 'IT Services', 'Software'],
      [Sector.FINANCIAL]: ['Banking', 'Financial Services', 'Insurance'],
      [Sector.ENERGY]: ['Energy', 'Oil & Gas', 'Oil & Gas Refining'],
      [Sector.CONSUMER_DISCRETIONARY]: ['Automobile', 'Consumer Durables', 'Retail'],
      [Sector.CONSUMER_STAPLES]: ['FMCG', 'Food & Beverages', 'Household Products'],
      [Sector.MATERIALS]: ['Metals', 'Chemicals', 'Construction Materials'],
      [Sector.HEALTHCARE]: ['Pharmaceuticals', 'Healthcare', 'Medical Equipment'],
      [Sector.REAL_ESTATE]: ['Real Estate', 'Construction'],
      [Sector.UTILITIES]: ['Utilities', 'Power', 'Infrastructure'],
      [Sector.COMMUNICATION_SERVICES]: ['Telecommunications', 'Media'],
      [Sector.BANKING]: ['Banking'],
      [Sector.PHARMA]: ['Pharmaceuticals'],
      [Sector.AUTO]: ['Automobile'],
      [Sector.FMCG]: ['FMCG'],
      [Sector.METALS]: ['Metals'],
      [Sector.TELECOM]: ['Telecommunications'],
      [Sector.INFRASTRUCTURE]: ['Infrastructure']
    };

    const targetSectors = sectorMapping[sector] || [];
    return stocks.filter(stock => 
      targetSectors.some(target => 
        stock.sector.toLowerCase().includes(target.toLowerCase()) ||
        stock.industry.toLowerCase().includes(target.toLowerCase())
      )
    );
  }

  /**
   * Generate structured prompt for AI analysis
   */
  private generateAnalysisPrompt(stocks: Stock[], timeFrame: TimeFrame, sector: Sector): string {
    const timeFrameContext = {
      '7D': 'short-term trading (1 week horizon)',
      '1M': 'short to medium-term investment (1 month horizon)', 
      '3M': 'medium-term investment (3 month horizon)',
      '6M': 'medium to long-term investment (6 month horizon)',
      '1Y': 'long-term investment (1 year horizon)'
    };

    const stockData = stocks.slice(0, 20).map(stock => ({
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      price: stock.price,
      change: stock.changePercent,
      pe: stock.pe,
      pb: stock.pb,
      roe: stock.roe,
      marketCap: stock.marketCap,
      health: stock.health,
      signal: stock.signal
    }));

    return `You are a professional stock analyst. Analyze the following Indian stocks for ${timeFrameContext[timeFrame]} recommendations in the ${sector === Sector.ALL ? 'overall market' : sector} sector.

Stock Data:
${JSON.stringify(stockData, null, 2)}

Please provide exactly 5 top stock recommendations in JSON format with this structure:
{
  "recommendations": [
    {
      "symbol": "STOCK_SYMBOL",
      "recommendation": "BUY|SELL|HOLD",
      "confidence": 85,
      "targetPrice": 2800.50,
      "upside": 15.5,
      "reasoning": ["Strong fundamentals", "Growing market share"],
      "risks": ["Market volatility", "Sector headwinds"],
      "aiScore": 88
    }
  ]
}

Focus on:
- Financial metrics (P/E, P/B, ROE, Market Cap)
- Current price trends and momentum
- Sector-specific factors
- Risk-adjusted returns for the time horizon
- Market conditions and outlook

Provide actionable insights with realistic price targets and risk assessments. Ensure recommendations are suitable for the ${timeFrame} time horizon.`;
  }

  /**
   * Parse AI response and create StockRecommendation objects
   */
  private parseAIResponse(
    aiResponse: any, 
    timeFrame: TimeFrame, 
    sector: Sector,
    stocks: Stock[]
  ): StockRecommendation[] {
    try {
      const content = aiResponse.choices?.[0]?.message?.content;
      if (!content) throw new Error('No content in AI response');

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');

      const parsed = JSON.parse(jsonMatch[0]);
      const recommendations = parsed.recommendations || [];

      return recommendations.map((rec: any, index: number) => {
        const stock = stocks.find(s => s.symbol === rec.symbol);
        if (!stock) return null;

        const now = new Date();
        const validUntil = new Date(now.getTime() + CACHE_TTL[timeFrame]);
        const recommendation = rec.recommendation as SignalType;

        return {
          id: `${timeFrame}_${sector}_${rec.symbol}_${now.getTime()}`,
          stockId: stock.id,
          symbol: rec.symbol,
          name: stock.name,
          sector,
          timeFrame,
          recommendation,
          confidence: rec.confidence || 75,
          currentPrice: stock.price,
          targetPrice: rec.targetPrice || null,
          stopLoss: this.calculateStopLoss(stock.price, recommendation, timeFrame),
          upside: rec.upside || null,
          reasoning: rec.reasoning || ['AI-based analysis'],
          risks: rec.risks || ['Market risk'],
          keyMetrics: {
            pe: stock.pe,
            pb: stock.pb,
            roe: stock.roe,
            marketCap: stock.marketCap
          },
          aiScore: rec.aiScore || rec.confidence || 75,
          generatedAt: now,
          validUntil
        } as StockRecommendation;
      }).filter(Boolean);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.getFallbackRecommendations(stocks, timeFrame, sector);
    }
  }

  /**
   * Generate fallback recommendations when AI fails
   */
  private getFallbackRecommendations(
    stocks: Stock[], 
    timeFrame: TimeFrame, 
    sector: Sector
  ): StockRecommendation[] {
    const topStocks = stocks
      .sort((a, b) => {
        // Sort by health and signal strength
        const healthScore = { 'BEST': 5, 'GOOD': 4, 'NORMAL': 3, 'BAD': 2, 'WORSE': 1 };
        const signalScore = { 'BUY': 3, 'HOLD': 2, 'SELL': 1 };
        
        const aScore = (healthScore[a.health as keyof typeof healthScore] || 0) + 
                      (signalScore[a.signal as keyof typeof signalScore] || 0);
        const bScore = (healthScore[b.health as keyof typeof healthScore] || 0) + 
                      (signalScore[b.signal as keyof typeof signalScore] || 0);
        
        return bScore - aScore;
      })
      .slice(0, 5);

    const now = new Date();
    const validUntil = new Date(now.getTime() + CACHE_TTL[timeFrame]);

    return topStocks.map((stock, index) => {
      const recommendation = stock.signal as SignalType;
      return {
        id: `fallback_${timeFrame}_${sector}_${stock.symbol}_${now.getTime()}`,
        stockId: stock.id,
        symbol: stock.symbol,
        name: stock.name,
        sector,
        timeFrame,
        recommendation,
        confidence: Math.max(60, 80 - index * 5),
        currentPrice: stock.price,
        targetPrice: stock.signal === 'BUY' ? stock.price * 1.1 : null,
        stopLoss: this.calculateStopLoss(stock.price, recommendation, timeFrame),
        upside: stock.signal === 'BUY' ? 10 - index * 2 : null,
        reasoning: [
          `Strong ${stock.health.toLowerCase()} fundamentals`,
          `Current signal: ${stock.signal}`
        ],
        risks: ['Market volatility', 'Sector-specific risks'],
        keyMetrics: {
          pe: stock.pe,
          pb: stock.pb,
          roe: stock.roe,
          marketCap: stock.marketCap
        },
        aiScore: Math.max(60, 85 - index * 5),
        generatedAt: now,
        validUntil
      };
    });
  }

  /**
   * Get stock recommendations for a specific time frame and sector
   */
  public async getRecommendations(
    timeFrame: TimeFrame, 
    sector: Sector
  ): Promise<RecommendationResponse> {
    const cacheKey = this.getCacheKey(timeFrame, sector);

    // Check cache first
    if (this.isCacheValid(cacheKey, timeFrame)) {
      const cached = recommendationCache.get(cacheKey)!;
      return cached;
    }

    try {
      // Apply rate limiting
      await rateLimiter.checkLimit();

      // Get all stocks and filter by sector
      const allStocks = getAllStocks();
      const sectorStocks = this.filterStocksBySector(allStocks, sector);

      if (sectorStocks.length === 0) {
        throw new Error(`No stocks found for sector: ${sector}`);
      }

      // Generate AI analysis
      const prompt = this.generateAnalysisPrompt(sectorStocks, timeFrame, sector);
      const messages = [
        { role: 'system', content: 'You are a professional stock analyst providing investment recommendations.' },
        { role: 'user', content: prompt }
      ];

      const aiResponse = await aiService.chat(messages);
      const recommendations = this.parseAIResponse(aiResponse, timeFrame, sector, sectorStocks);

      const response: RecommendationResponse = {
        recommendations,
        metadata: {
          timeFrame,
          sector,
          totalAnalyzed: sectorStocks.length,
          modelUsed: 'OpenRouter AI',
          generatedAt: new Date()
        }
      };

      // Cache the response
      recommendationCache.set(cacheKey, response);

      return response;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      
      // Return fallback recommendations
      const allStocks = getAllStocks();
      const sectorStocks = this.filterStocksBySector(allStocks, sector);
      const fallbackRecommendations = this.getFallbackRecommendations(sectorStocks, timeFrame, sector);

      const fallbackResponse: RecommendationResponse = {
        recommendations: fallbackRecommendations,
        metadata: {
          timeFrame,
          sector,
          totalAnalyzed: sectorStocks.length,
          modelUsed: 'Fallback Analysis',
          generatedAt: new Date()
        }
      };

      recommendationCache.set(cacheKey, fallbackResponse);
      return fallbackResponse;
    }
  }

  /**
   * Clear cache (useful for manual refresh)
   */
  public clearCache(): void {
    recommendationCache.clear();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; keys: string[] } {
    return {
      size: recommendationCache.size,
      keys: Array.from(recommendationCache.keys())
    };
  }
}

// Export singleton instance
export const stockRecommendationService = StockRecommendationService.getInstance();

// Export individual functions for convenience
export const getStockRecommendations = (timeFrame: TimeFrame, sector: Sector) =>
  stockRecommendationService.getRecommendations(timeFrame, sector);

export const clearRecommendationCache = () =>
  stockRecommendationService.clearCache();