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
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import RealMetricsGrid from "@/components/ui/RealMetricsGrid";
import { getStockAnalysis, getRealStockMetrics } from "@/services/hybridStockService";
import { DataSource } from "@/types";

const StockDetailPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"fundamental" | "technical">(
    "fundamental"
  );
  const [stockAnalysis, setStockAnalysis] =
    useState<DetailedStockAnalysis | null>(null);
  const [realMetrics, setRealMetrics] = useState<any>(null);
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

      // Get enhanced data from Yahoo Finance API
      const enhancedData = await hybridStockService.getEnhancedFinancialData(symbol);
      const analysis = hybridStockService.createAnalysisFromData(symbol, enhancedData);

      setStockAnalysis(analysis);

      if (enhancedData.hasRealData) {
        console.log(`✅ Real data loaded for ${symbol}`);
        setRealMetrics(null); // We'll phase out the old realMetrics in favor of integrated data
      } else {
        console.log(`⚠️ Limited data available for ${symbol} - showing N/A for missing metrics`);
        setRealMetrics(null);
      }

      console.log(`✅ Successfully loaded analysis for ${symbol}`, analysis);
    } catch (err) {
      console.error("Error loading stock analysis:", err);
      setError("Failed to load stock analysis. Please try again.");

      // Create minimal fallback analysis
      const fallbackAnalysis: DetailedStockAnalysis = {
        symbol: symbol.toUpperCase(),
        name: `${symbol.toUpperCase()} Limited`,
        about: "Unable to fetch stock data from Yahoo Finance API. Please check the stock symbol and try again.",
        keyPoints: [
          "Data unavailable from Yahoo Finance API",
          "Stock symbol may be incorrect or delisted", 
          "Try using the correct stock exchange suffix (e.g., .NS for NSE)"
        ],
        currentPrice: 0,
        marketCap: 0,
        sector: "N/A",
        industry: "N/A",
        financialHealth: {
          statements: {
            incomeStatement: HealthStatus.NORMAL,
            balanceSheet: HealthStatus.NORMAL,
            cashFlow: HealthStatus.NORMAL,
          },
          profitability: {},
          liquidity: {},
          valuation: {},
          growth: {},
          management: HealthStatus.NORMAL,
          industry: HealthStatus.NORMAL,
          risks: HealthStatus.NORMAL,
          outlook: HealthStatus.NORMAL,
        },
        technicalIndicators: {
          stochasticRSI: {
            indicator: "Stochastic RSI",
            value: 0,
            signal: SignalType.HOLD,
            health: HealthStatus.NORMAL,
            description: "N/A - Data not available",
          },
          connorsRSI: {
            indicator: "Connors RSI", 
            value: 0,
            signal: SignalType.HOLD,
            health: HealthStatus.NORMAL,
            description: "N/A - Data not available",
          },
          macd: {
            indicator: "MACD",
            value: 0,
            signal: SignalType.HOLD,
            health: HealthStatus.NORMAL,
            description: "N/A - Data not available",
          },
          patterns: {
            indicator: "Pattern Analysis",
            value: 0,
            signal: SignalType.HOLD,
            health: HealthStatus.NORMAL,
            description: "N/A - Data not available",
          },
          support: [],
          resistance: [],
        },
        pros: ["Stock symbol recognized", "Analysis structure available"],
        cons: ["No real data available", "Unable to connect to data source"],
        priceHistory: [],
        lastUpdated: new Date(),
      };
      setStockAnalysis(fallbackAnalysis);
      setRealMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  // Mock analysis function removed - now using real Yahoo Finance API data only

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
        {/* Data Quality Legend */}
        <div className="mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between">
                <div className="flex items-center space-x-2 mb-2 md:mb-0">
                  <h3 className="text-sm font-medium text-gray-900">Data Quality:</h3>
                </div>
                <div className="flex flex-wrap items-center space-x-4 gap-y-2">
                  <div className="flex items-center space-x-2">
                    <DataSourceBadge dataSource={DataSource.RAPID_API_YAHOO} />
                    <span className="text-xs text-gray-600">Real-time API</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DataSourceBadge dataSource={DataSource.CALCULATED} />
                    <span className="text-xs text-gray-600">Calculated</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DataSourceBadge dataSource={DataSource.ESTIMATED} />
                    <span className="text-xs text-gray-600">Estimated</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DataSourceBadge dataSource={DataSource.MOCK} />
                    <span className="text-xs text-gray-600">Mock Data</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                <CardHeader title="முக்கிய அன்கங்கள் (100% Real API Data)" />
                <CardContent>
                  {realMetrics ? (
                    <>
                      <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-green-700">
                            All metrics below are real-time data from Yahoo Finance API
                          </span>
                          <DataSourceBadge dataSource={DataSource.RAPID_API_YAHOO} showLabel />
                        </div>
                      </div>
                      <RealMetricsGrid
                        metrics={realMetrics.metrics}
                        dataSource={realMetrics.dataSource}
                        onMetricClick={handleStatClick}
                      />
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">🔴</span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Real API Data Available
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Could not fetch real-time data from Yahoo Finance API for this symbol.
                      </p>
                      <div className="text-sm text-gray-500">
                        <p>• Check your internet connection</p>
                        <p>• Verify the stock symbol is correct</p>
                        <p>• Try refreshing the page</p>
                      </div>
                    </div>
                  )}
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
