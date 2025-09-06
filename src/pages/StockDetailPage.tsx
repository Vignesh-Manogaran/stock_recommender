import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Star,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  Shield,
  IndianRupee,
  Activity,
  Brain,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Minus,
  RefreshCw,
} from "lucide-react";
import Card, { CardContent, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import StatsModal from "@/components/ui/StatsModal";
import { DetailedStockAnalysis, HealthStatus, SignalType } from "@/types";
import StockPriceChart from "@/components/stock/StockPriceChart";
import FundamentalAnalysisTab from "@/components/tabs/FundamentalAnalysisTab";
import TechnicalAnalysisTab from "@/components/tabs/TechnicalAnalysisTab";
import { getStockAnalysis } from "@/services/hybridStockService";

const StockDetailPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"fundamental" | "technical">(
    "fundamental"
  );
  const [stockAnalysis, setStockAnalysis] =
    useState<DetailedStockAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStat, setSelectedStat] = useState<{
    type: string;
    value: string;
  } | null>(null);

  // Health status color mapping
  const getHealthColor = (health: HealthStatus) => {
    switch (health) {
      case HealthStatus.BEST:
        return "text-green-700 bg-green-100";
      case HealthStatus.GOOD:
        return "text-green-600 bg-green-50";
      case HealthStatus.NORMAL:
        return "text-gray-600 bg-gray-100";
      case HealthStatus.BAD:
        return "text-red-600 bg-red-50";
      case HealthStatus.WORSE:
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Signal color mapping
  const getSignalConfig = (signal: SignalType) => {
    switch (signal) {
      case SignalType.BUY:
        return {
          color: "text-green-600",
          bgColor: "bg-green-100",
          icon: TrendingUp,
          label: "BUY",
        };
      case SignalType.SELL:
        return {
          color: "text-red-600",
          bgColor: "bg-red-100",
          icon: TrendingDown,
          label: "SELL",
        };
      case SignalType.HOLD:
        return {
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
          icon: Minus,
          label: "HOLD",
        };
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Format market cap
  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `₹${(marketCap / 1e12).toFixed(1)}T`;
    } else if (marketCap >= 1e9) {
      return `₹${(marketCap / 1e9).toFixed(1)}B`;
    } else if (marketCap >= 1e7) {
      return `₹${(marketCap / 1e7).toFixed(1)}Cr`;
    }
    return `₹${marketCap.toLocaleString()}`;
  };

  // Handle stat card click
  const handleStatClick = (statType: string, statValue: string) => {
    setSelectedStat({ type: statType, value: statValue });
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedStat(null);
  };

  // Load stock analysis data - Now uses Yahoo Finance + OpenRouter hybrid approach!
  const loadStockAnalysis = async () => {
    if (!symbol) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`🔍 Loading comprehensive analysis for ${symbol}...`);

      // Use our new hybrid service - Real Yahoo Finance data + AI analysis
      const analysis = await getStockAnalysis(symbol);
      setStockAnalysis(analysis);

      console.log(`✅ Successfully loaded analysis for ${symbol}:`, analysis);
    } catch (err) {
      console.error("Error loading stock analysis:", err);
      setError("Failed to load stock analysis. Please try again.");

      // Load mock data as fallback
      setStockAnalysis(createMockAnalysis(symbol));
    } finally {
      setLoading(false);
    }
  };

  // Create mock data for development
  const createMockAnalysis = (symbol: string): DetailedStockAnalysis => {
    return {
      symbol: symbol.toUpperCase(),
      name: `${symbol.toUpperCase()} Limited`,
      about: `${symbol.toUpperCase()} is a leading technology company specializing in innovative solutions for the digital economy. With a strong market presence and robust fundamentals, the company has consistently delivered value to shareholders through strategic investments and operational excellence.`,
      keyPoints: [
        "Strong revenue growth of 25% YoY",
        "Debt-to-equity ratio maintained at healthy 0.3",
        "Expanding market share in core segments",
        "Recent strategic partnerships in emerging markets",
        "Robust cash flow generation capabilities",
      ],
      currentPrice: 1245.6,
      marketCap: 85000000000,
      sector: "Technology",
      industry: "Software Services",
      financialHealth: {
        statements: {
          incomeStatement: HealthStatus.GOOD,
          balanceSheet: HealthStatus.BEST,
          cashFlow: HealthStatus.GOOD,
        },
        profitability: {
          ROE: { value: 18.5, health: HealthStatus.GOOD },
          ROA: { value: 12.3, health: HealthStatus.GOOD },
          ROCE: { value: 22.1, health: HealthStatus.BEST },
          "Gross Margin": { value: 42.5, health: HealthStatus.GOOD },
          "Operating Margin": { value: 18.2, health: HealthStatus.GOOD },
          "Net Margin": { value: 15.8, health: HealthStatus.GOOD },
        },
        liquidity: {
          "Current Ratio": { value: 2.1, health: HealthStatus.GOOD },
          "Quick Ratio": { value: 1.8, health: HealthStatus.GOOD },
          "Debt-to-Equity": { value: 0.3, health: HealthStatus.BEST },
          "Interest Coverage": { value: 8.5, health: HealthStatus.BEST },
        },
        valuation: {
          "P/E Ratio": { value: 24.5, health: HealthStatus.NORMAL },
          "P/B Ratio": { value: 3.2, health: HealthStatus.NORMAL },
          "P/S Ratio": { value: 5.8, health: HealthStatus.NORMAL },
          "EV/EBITDA": { value: 18.2, health: HealthStatus.NORMAL },
          "Dividend Yield": { value: 1.2, health: HealthStatus.NORMAL },
        },
        growth: {
          "Revenue CAGR (3Y)": { value: 22.8, health: HealthStatus.BEST },
          "EPS Growth (3Y)": { value: 28.5, health: HealthStatus.BEST },
          "Market Share Growth": { value: 15.2, health: HealthStatus.GOOD },
        },
        management: HealthStatus.GOOD,
        industry: HealthStatus.GOOD,
        risks: HealthStatus.NORMAL,
        outlook: HealthStatus.GOOD,
      },
      technicalIndicators: {
        stochasticRSI: {
          indicator: "Stochastic RSI",
          value: 72.5,
          signal: SignalType.BUY,
          health: HealthStatus.GOOD,
          description:
            "StochRSI shows momentum building with potential for mean reversion",
          buyPrice: 1240,
          targetPrice: 1380,
          stopLoss: 1180,
        },
        connorsRSI: {
          indicator: "Connors RSI",
          value: 68.2,
          signal: SignalType.BUY,
          health: HealthStatus.GOOD,
          description:
            "RSI(2) indicates oversold conditions with reversal potential",
          buyPrice: 1245,
          targetPrice: 1350,
          stopLoss: 1200,
        },
        macd: {
          indicator: "MACD",
          value: 2.85,
          signal: SignalType.BUY,
          health: HealthStatus.GOOD,
          description:
            "MACD bullish crossover with mean-reversion filter active",
          buyPrice: 1250,
          targetPrice: 1400,
          stopLoss: 1190,
        },
        patterns: {
          indicator: "Pattern Analysis",
          value: 0.75,
          signal: SignalType.BUY,
          health: HealthStatus.GOOD,
          description: "3 down closes above 200-DMA, exit signal at 5-DMA",
          buyPrice: 1248,
          targetPrice: 1420,
          stopLoss: 1185,
        },
        support: [1180, 1150, 1120],
        resistance: [1280, 1320, 1380],
      },
      pros: [
        "Strong fundamentals with consistent revenue growth",
        "Healthy balance sheet with low debt levels",
        "Market leader with competitive moats",
        "Experienced management team with proven track record",
        "Growing market opportunity in digital transformation",
        "Strong cash generation and profitable operations",
      ],
      cons: [
        "High valuation compared to historical averages",
        "Dependence on key technology partnerships",
        "Intense competition from global players",
        "Regulatory risks in emerging markets",
        "Currency exposure to international operations",
        "Talent acquisition challenges in key segments",
      ],
      priceHistory: [], // Will be populated by chart component
      lastUpdated: new Date(),
    };
  };

  useEffect(() => {
    loadStockAnalysis();
  }, [symbol]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="w-12 h-12 mx-auto mb-4" />
          <p className="text-gray-600">பங்கு பகுப்பாய்வு ஏற்றப்படுகிறது...</p>
        </div>
      </div>
    );
  }

  if (error || !stockAnalysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center p-8">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              தகவல் ஏற்றுவதில் பிழை
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <Button onClick={loadStockAnalysis} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                மீண்டும் முயற்சிக்கவும்
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard க்கு திரும்பு
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>திரும்பு</span>
              </Button>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {stockAnalysis.symbol}
                </h1>
                <p className="text-sm text-gray-600">{stockAnalysis.name}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stockAnalysis.currentPrice)}
                </p>
                <p className="text-sm text-gray-600">
                  {formatMarketCap(stockAnalysis.marketCap)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-gray-500">
                  கடைசியாக புதுப்பிக்கப்பட்டது
                </p>
                <p className="text-xs font-medium text-gray-700">
                  {new Date(stockAnalysis.lastUpdated).toLocaleString()}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={loadStockAnalysis}
                className="flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span className="hidden sm:inline">புதுப்பிக்கவும்</span>
              </Button>

              <Button variant="outline" size="sm">
                <Star className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader title="நிறுவனம் பற்றி" />
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {stockAnalysis.about}
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    முக்கிய அம்சங்கள்
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {stockAnalysis.keyPoints.map((point, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-sm text-gray-700">{point}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Price Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader
                  title="விலை Chart"
                  action={
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-gray-600" />
                    </div>
                  }
                />
                <CardContent>
                  <StockPriceChart symbol={stockAnalysis.symbol} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Pros and Cons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pros */}
                <Card>
                  <CardHeader
                    title="சாதகமான விஷயங்கள்"
                    action={<CheckCircle className="w-6 h-6 text-green-600" />}
                  />
                  <CardContent>
                    <div className="space-y-3">
                      {stockAnalysis.pros.map((pro, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-100"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{pro}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Cons */}
                <Card>
                  <CardHeader
                    title="பாதகமான விஷயங்கள்"
                    action={<XCircle className="w-6 h-6 text-red-600" />}
                  />
                  <CardContent>
                    <div className="space-y-3">
                      {stockAnalysis.cons.map((con, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-100"
                        >
                          <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700">{con}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* Analysis Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-0">
                  {/* Tab Headers */}
                  <div className="border-b border-gray-200">
                    <div className="flex">
                      <button
                        onClick={() => setActiveTab("fundamental")}
                        className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === "fundamental"
                            ? "border-blue-500 text-blue-600 bg-blue-50"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Brain className="w-4 h-4 inline mr-2" />
                        அடிப்படை பகுப்பாய்வு
                      </button>
                      <button
                        onClick={() => setActiveTab("technical")}
                        className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                          activeTab === "technical"
                            ? "border-blue-500 text-blue-600 bg-blue-50"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Activity className="w-4 h-4 inline mr-2" />
                        தொழில்நுட்ப பகுப்பாய்வு
                      </button>
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    {activeTab === "fundamental" ? (
                      <FundamentalAnalysisTab
                        stockAnalysis={stockAnalysis}
                        getHealthColor={getHealthColor}
                      />
                    ) : (
                      <TechnicalAnalysisTab
                        stockAnalysis={stockAnalysis}
                        getSignalConfig={getSignalConfig}
                        getHealthColor={getHealthColor}
                        formatCurrency={formatCurrency}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Summary Stats */}
          <div className="space-y-6">
            {/* Important Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader title="முக்கிய அன்கங்கள்" />
                <CardContent>
                  <div className="space-y-4">
                    {/* Market & Pricing Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className="p-3 bg-blue-50 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition-all duration-200 hover:shadow-md"
                        onClick={() =>
                          handleStatClick(
                            "Market Cap",
                            formatMarketCap(stockAnalysis.marketCap)
                          )
                        }
                      >
                        <p className="text-xs text-blue-600 mb-1">
                          Market Cap (சந்தை மதிப்பு)
                        </p>
                        <p className="text-sm font-bold text-blue-900">
                          {formatMarketCap(stockAnalysis.marketCap)}
                        </p>
                      </div>
                      <div
                        className="p-3 bg-green-50 rounded-lg border border-green-100 cursor-pointer hover:bg-green-100 transition-all duration-200 hover:shadow-md"
                        onClick={() =>
                          handleStatClick(
                            "Current Price",
                            `₹${stockAnalysis.currentPrice.toLocaleString(
                              "en-IN",
                              { maximumFractionDigits: 2 }
                            )}`
                          )
                        }
                      >
                        <p className="text-xs text-green-600 mb-1">
                          தற்போதைய விலை
                        </p>
                        <p className="text-sm font-bold text-green-900">
                          ₹
                          {stockAnalysis.currentPrice.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Price Range & Valuation */}
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all duration-200 hover:shadow-md"
                        onClick={() =>
                          handleStatClick(
                            "High / Low",
                            `₹${(stockAnalysis.currentPrice * 1.15).toFixed(
                              0
                            )} / ₹${(stockAnalysis.currentPrice * 0.85).toFixed(
                              0
                            )}`
                          )
                        }
                      >
                        <p className="text-xs text-gray-600 mb-1">
                          உயர்ந்த / குறைந்த விலை
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{(stockAnalysis.currentPrice * 1.15).toFixed(0)} / ₹
                          {(stockAnalysis.currentPrice * 0.85).toFixed(0)}
                        </p>
                      </div>
                      <div
                        className="p-3 bg-purple-50 rounded-lg border border-purple-100 cursor-pointer hover:bg-purple-100 transition-all duration-200 hover:shadow-md"
                        onClick={() =>
                          handleStatClick(
                            "Stock P/E",
                            stockAnalysis.financialHealth.valuation[
                              "P/E Ratio"
                            ]?.value?.toFixed(1) || "N/A"
                          )
                        }
                      >
                        <p className="text-xs text-purple-600 mb-1">
                          P/E Ratio (விலை vs வருமானம்)
                        </p>
                        <p className="text-sm font-bold text-purple-900">
                          {stockAnalysis.financialHealth.valuation[
                            "P/E Ratio"
                          ]?.value?.toFixed(1) || "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Book Value & Dividend */}
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 cursor-pointer hover:bg-indigo-100 transition-all duration-200 hover:shadow-md"
                        onClick={() =>
                          handleStatClick(
                            "Book Value",
                            `₹${
                              stockAnalysis.financialHealth.valuation[
                                "P/B Ratio"
                              ]
                                ? (
                                    stockAnalysis.currentPrice /
                                    stockAnalysis.financialHealth.valuation[
                                      "P/B Ratio"
                                    ]?.value
                                  ).toFixed(0)
                                : "341"
                            }`
                          )
                        }
                      >
                        <p className="text-xs text-indigo-600 mb-1">
                          Book Value (புத்தக மதிப்பு)
                        </p>
                        <p className="text-sm font-bold text-indigo-900">
                          ₹
                          {stockAnalysis.financialHealth.valuation["P/B Ratio"]
                            ? (
                                stockAnalysis.currentPrice /
                                stockAnalysis.financialHealth.valuation[
                                  "P/B Ratio"
                                ]?.value
                              ).toFixed(0)
                            : "341"}
                        </p>
                      </div>
                      <div
                        className="p-3 bg-yellow-50 rounded-lg border border-yellow-100 cursor-pointer hover:bg-yellow-100 transition-all duration-200 hover:shadow-md"
                        onClick={() =>
                          handleStatClick(
                            "Dividend Yield",
                            `${
                              stockAnalysis.financialHealth.valuation[
                                "Dividend Yield"
                              ]?.value?.toFixed(1) || "1.2"
                            }%`
                          )
                        }
                      >
                        <p className="text-xs text-yellow-600 mb-1">
                          Dividend Yield (வருடாந்தர வருமானம்)
                        </p>
                        <p className="text-sm font-bold text-yellow-900">
                          {stockAnalysis.financialHealth.valuation[
                            "Dividend Yield"
                          ]?.value?.toFixed(1) || "1.2"
                          %
                        </p>
                      </div>
                    </div>

                    {/* Returns & Face Value */}
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 cursor-pointer hover:bg-emerald-100 transition-all duration-200 hover:shadow-md"
                        onClick={() =>
                          handleStatClick(
                            "ROCE",
                            `${
                              stockAnalysis.financialHealth.profitability.ROCE?.value?.toFixed(
                                1
                              ) || "7.5"
                            }%`
                          )
                        }
                      >
                        <p className="text-xs text-emerald-600 mb-1">
                          ROCE (மூலதன வருமானம்)
                        </p>
                        <p className="text-sm font-bold text-emerald-900">
                          {stockAnalysis.financialHealth.profitability.ROCE?.value?.toFixed(
                            1
                          ) || "7.5"
                          %
                        </p>
                      </div>
                      <div
                        className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 cursor-pointer hover:bg-emerald-100 transition-all duration-200 hover:shadow-md"
                        onClick={() =>
                          handleStatClick(
                            "ROE",
                            `${
                              stockAnalysis.financialHealth.profitability.ROE?.value?.toFixed(
                                1
                              ) || "14.4"
                            }%`
                          )
                        }
                      >
                        <p className="text-xs text-emerald-600 mb-1">
                          ROE (பங்குதாரர் வருமானம்)
                        </p>
                        <p className="text-sm font-bold text-emerald-900">
                          {stockAnalysis.financialHealth.profitability.ROE?.value?.toFixed(
                            1
                          ) || "14.4"}
                          %
                        </p>
                      </div>
                    </div>

                    {/* Sector & Face Value */}
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all duration-200 hover:shadow-md"
                        onClick={() =>
                          handleStatClick("Sector", stockAnalysis.sector)
                        }
                      >
                        <p className="text-xs text-gray-600 mb-1">தொழில்துறை</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {stockAnalysis.sector}
                        </p>
                      </div>
                      <div
                        className="p-3 bg-orange-50 rounded-lg border border-orange-100 cursor-pointer hover:bg-orange-100 transition-all duration-200 hover:shadow-md"
                        onClick={() => handleStatClick("Face Value", "₹1.00")}
                      >
                        <p className="text-xs text-orange-600 mb-1">
                          Face Value (முக மதிப்பு)
                        </p>
                        <p className="text-sm font-bold text-orange-900">
                          ₹1.00
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Technical Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardHeader title="தொழில்நுட்ப சுருக்கம்" />
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(stockAnalysis.technicalIndicators).map(
                      ([key, indicator]) => {
                        if (key === "support" || key === "resistance")
                          return null;

                        const signalConfig = getSignalConfig(indicator.signal);
                        const SignalIcon = signalConfig.icon;

                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <SignalIcon
                                className={`w-4 h-4 ${signalConfig.color}`}
                              />
                              <span className="text-sm font-medium text-gray-900">
                                {indicator.indicator}
                              </span>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${signalConfig.color} ${signalConfig.bgColor}`}
                            >
                              {signalConfig.label}
                            </span>
                          </div>
                        );
                      }
                    )}

                    {/* Support and Resistance */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-600 mb-2">
                            Support Levels
                          </p>
                          <div className="space-y-1">
                            {stockAnalysis.technicalIndicators.support.map(
                              (level, index) => (
                                <p
                                  key={index}
                                  className="text-sm font-medium text-green-600"
                                >
                                  ₹{level}
                                </p>
                              )
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-2">
                            Resistance Levels
                          </p>
                          <div className="space-y-1">
                            {stockAnalysis.technicalIndicators.resistance.map(
                              (level, index) => (
                                <p
                                  key={index}
                                  className="text-sm font-medium text-red-600"
                                >
                                  ₹{level}
                                </p>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Modal */}
      {selectedStat && (
        <StatsModal
          isOpen={modalOpen}
          onClose={closeModal}
          statType={selectedStat.type}
          statValue={selectedStat.value}
          stockData={stockAnalysis}
        />
      )}
    </div>
  );
};

export default StockDetailPage;
