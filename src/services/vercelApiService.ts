// Vercel API Service - Uses serverless functions for API calls
export class VercelApiService {
  // Get the appropriate base URL for API calls
  private static getBaseUrl(): string {
    if (typeof window !== "undefined") {
      // In browser, use current origin
      return window.location.origin;
    }

    // In serverless function or build time
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }

    // Fallback for development
    return "http://localhost:3000";
  }

  // Yahoo Finance proxy
  static async fetchYahooFinance(
    symbol: string,
    endpoint: "quote" | "summary",
    modules?: string
  ) {
    try {
      const params = new URLSearchParams({
        symbol,
        endpoint,
        ...(modules && { modules }),
      });

      console.log(`📡 Vercel API: Calling Yahoo Finance for ${symbol}`);

      const response = await fetch(
        `${this.getBaseUrl()}/api/yahoo-finance?${params}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Vercel Yahoo Finance API returned ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Vercel API: Yahoo Finance success for ${symbol}`);
      return data;
    } catch (error) {
      console.error(`❌ Vercel Yahoo Finance API failed for ${symbol}:`, error);
      throw error;
    }
  }

  // Alpha Vantage proxy
  static async fetchAlphaVantage(
    symbol: string,
    functionType: string = "GLOBAL_QUOTE"
  ) {
    try {
      const params = new URLSearchParams({
        symbol,
        function: functionType,
      });

      console.log(`📡 Vercel API: Calling Alpha Vantage for ${symbol}`);

      const response = await fetch(
        `${this.getBaseUrl()}/api/alpha-vantage?${params}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.fallback) {
          throw new Error("API_FALLBACK_NEEDED");
        }
        throw new Error(`Vercel Alpha Vantage API returned ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Vercel API: Alpha Vantage success for ${symbol}`);
      return data;
    } catch (error) {
      console.error(`❌ Vercel Alpha Vantage API failed for ${symbol}:`, error);
      throw error;
    }
  }

  // OpenRouter AI analysis proxy
  static async fetchOpenRouterAnalysis(
    symbol: string,
    prompt: string,
    model?: string
  ) {
    try {
      console.log(`📡 Vercel API: Calling OpenRouter for ${symbol}`);

      const response = await fetch(`${this.getBaseUrl()}/api/openrouter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symbol,
          prompt,
          model,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.fallback) {
          throw new Error("API_FALLBACK_NEEDED");
        }
        throw new Error(`Vercel OpenRouter API returned ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Vercel API: OpenRouter success for ${symbol}`);
      return data;
    } catch (error) {
      console.error(`❌ Vercel OpenRouter API failed for ${symbol}:`, error);
      throw error;
    }
  }

  // Financial data providers proxy
  static async fetchFinancialData(
    symbol: string,
    provider: "fmp" | "polygon" | "iex",
    endpoint?: string
  ) {
    try {
      const params = new URLSearchParams({
        symbol,
        provider,
        ...(endpoint && { endpoint }),
      });

      console.log(
        `📡 Vercel API: Calling ${provider.toUpperCase()} for ${symbol}`
      );

      const response = await fetch(
        `${this.getBaseUrl()}/api/financial-data?${params}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.fallback) {
          throw new Error("API_FALLBACK_NEEDED");
        }
        throw new Error(
          `Vercel ${provider.toUpperCase()} API returned ${response.status}`
        );
      }

      const data = await response.json();
      console.log(
        `✅ Vercel API: ${provider.toUpperCase()} success for ${symbol}`
      );
      return data;
    } catch (error) {
      console.error(
        `❌ Vercel ${provider.toUpperCase()} API failed for ${symbol}:`,
        error
      );
      throw error;
    }
  }

  // RapidAPI Yahoo Finance proxy
  static async fetchRapidApiYahoo(
    symbol: string,
    endpoint: string = "stock",
    period: string = "1y"
  ) {
    try {
      const params = new URLSearchParams({
        symbol,
        endpoint,
        period,
      });

      console.log(`📡 Vercel API: Calling RapidAPI Yahoo for ${symbol}`);

      const response = await fetch(
        `${this.getBaseUrl()}/api/rapidapi-yahoo?${params}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.fallback) {
          throw new Error("API_FALLBACK_NEEDED");
        }
        throw new Error(`Vercel RapidAPI Yahoo returned ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Vercel API: RapidAPI Yahoo success for ${symbol}`);
      return data;
    } catch (error) {
      console.error(`❌ Vercel RapidAPI Yahoo failed for ${symbol}:`, error);
      throw error;
    }
  }

  // Check if we're running in Vercel environment
  static isVercelEnvironment(): boolean {
    return (
      typeof window !== "undefined" &&
      (window.location.hostname.includes("vercel.app") ||
        process.env.VERCEL_ENV !== undefined)
    );
  }
}
