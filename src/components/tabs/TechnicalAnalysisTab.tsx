import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Shield,
  BarChart3,
  Minus,
  Circle,
  Triangle,
  ArrowUp,
  ArrowDown,
  IndianRupee,
} from "lucide-react";
import {
  DetailedStockAnalysis,
  HealthStatus,
  SignalType,
  TechnicalIndicatorHealth,
} from "@/types";
import Card, { CardContent, CardHeader } from "@/components/ui/Card";
import TechnicalModal from "@/components/ui/TechnicalModal";

interface TechnicalAnalysisTabProps {
  stockAnalysis: DetailedStockAnalysis;
  getSignalConfig: (signal: SignalType) => {
    color: string;
    bgColor: string;
    icon: any;
    label: string;
  };
  getHealthColor: (health: HealthStatus) => string;
  formatCurrency: (amount: number) => string;
}

const TechnicalAnalysisTab: React.FC<TechnicalAnalysisTabProps> = ({
  stockAnalysis,
  getSignalConfig,
  getHealthColor,
  formatCurrency,
}) => {
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<{
    type: string;
    value: string | number;
    data?: any;
  } | null>(null);

  // Handle indicator click
  const handleIndicatorClick = (
    indicatorType: string,
    indicatorValue: string | number,
    indicatorData?: any
  ) => {
    setSelectedIndicator({
      type: indicatorType,
      value: indicatorValue,
      data: indicatorData,
    });
    setModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedIndicator(null);
  };

  // Helper function to render indicator card
  const renderIndicatorCard = (
    indicator: TechnicalIndicatorHealth,
    bgColorClass: string,
    borderColorClass: string,
    indicatorName: string
  ) => {
    const signalConfig = getSignalConfig(indicator.signal);
    const SignalIcon = signalConfig.icon;

    return (
      <div
        className={`${bgColorClass} rounded-xl p-6 border ${borderColorClass} cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200`}
        onClick={() =>
          handleIndicatorClick(indicatorName, indicator.value, indicator)
        }
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            {indicator.indicator}
          </h3>
          <div
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg ${signalConfig.color} ${signalConfig.bgColor}`}
          >
            <SignalIcon className="w-4 h-4" />
            <span className="text-sm font-semibold">{signalConfig.label}</span>
          </div>
        </div>

        <div className="space-y-4">
          {/* Indicator Value and Health */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Current Value</span>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">
                {indicator.value.toFixed(2)}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${getHealthColor(
                  indicator.health
                )}`}
              >
                {indicator.health}
              </span>
            </div>
          </div>

          {/* Trading Levels */}
          <div className="grid grid-cols-3 gap-3">
            {indicator.buyPrice && (
              <div
                className="text-center p-2 bg-green-50 rounded-lg border border-green-100 cursor-pointer hover:bg-green-100 hover:shadow-md transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  handleIndicatorClick(
                    "Entry Price",
                    `₹${indicator.buyPrice}`,
                    {
                      price: indicator.buyPrice,
                      type: "entry",
                    }
                  );
                }}
              >
                <p className="text-xs text-green-600 mb-1">Entry</p>
                <p className="text-sm font-semibold text-green-700">
                  ₹{indicator.buyPrice}
                </p>
              </div>
            )}
            {indicator.targetPrice && (
              <div
                className="text-center p-2 bg-blue-50 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 hover:shadow-md transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  handleIndicatorClick(
                    "Target Price",
                    `₹${indicator.targetPrice}`,
                    {
                      price: indicator.targetPrice,
                      type: "target",
                    }
                  );
                }}
              >
                <p className="text-xs text-blue-600 mb-1">Target</p>
                <p className="text-sm font-semibold text-blue-700">
                  ₹{indicator.targetPrice}
                </p>
              </div>
            )}
            {indicator.stopLoss && (
              <div
                className="text-center p-2 bg-red-50 rounded-lg border border-red-100 cursor-pointer hover:bg-red-100 hover:shadow-md transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  handleIndicatorClick("Stop Loss", `₹${indicator.stopLoss}`, {
                    price: indicator.stopLoss,
                    type: "stopLoss",
                  });
                }}
              >
                <p className="text-xs text-red-600 mb-1">Stop Loss</p>
                <p className="text-sm font-semibold text-red-700">
                  ₹{indicator.stopLoss}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">{indicator.description}</p>
          </div>

          {/* Risk-Reward Ratio */}
          {indicator.buyPrice &&
            indicator.targetPrice &&
            indicator.stopLoss && (
              <div
                className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100 cursor-pointer hover:bg-indigo-100 hover:shadow-md transition-all duration-200"
                onClick={(e) => {
                  e.stopPropagation();
                  const ratio = (
                    (indicator.targetPrice - indicator.buyPrice) /
                    (indicator.buyPrice - indicator.stopLoss)
                  ).toFixed(1);
                  handleIndicatorClick("Risk Reward Ratio", `1:${ratio}`, {
                    entry: indicator.buyPrice,
                    target: indicator.targetPrice,
                    stopLoss: indicator.stopLoss,
                    ratio: ratio,
                  });
                }}
              >
                <span className="text-sm font-medium text-indigo-900">
                  Risk:Reward Ratio
                </span>
                <span className="text-sm font-bold text-indigo-700">
                  1:
                  {(
                    (indicator.targetPrice - indicator.buyPrice) /
                    (indicator.buyPrice - indicator.stopLoss)
                  ).toFixed(1)}
                </span>
              </div>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Technical Indicators Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader
            title="Technical Indicators Summary (தொழில்நுட்ப காட்டிகள் சுருக்கம்)"
            action={<BarChart3 className="w-6 h-6 text-blue-600" />}
          />
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stockAnalysis.technicalIndicators).map(
                ([key, indicator]) => {
                  if (key === "support" || key === "resistance") return null;

                  const signalConfig = getSignalConfig(indicator.signal);
                  const SignalIcon = signalConfig.icon;

                  return (
                    <div
                      key={key}
                      className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-center mb-2">
                        <SignalIcon
                          className={`w-5 h-5 ${signalConfig.color}`}
                        />
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">
                        {indicator.indicator}
                      </h4>
                      <p
                        className={`text-xs font-semibold px-2 py-1 rounded ${signalConfig.color} ${signalConfig.bgColor}`}
                      >
                        {signalConfig.label}
                      </p>
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 1. Stochastic RSI */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader title="1. Stochastic RSI (வலுவினை அளவி காட்டி)" />
          <CardContent>
            {renderIndicatorCard(
              stockAnalysis.technicalIndicators.stochasticRSI,
              "bg-green-50",
              "border-green-200",
              "Stochastic RSI"
            )}

            <div className="mt-4 p-4 bg-green-25 rounded-lg border border-green-100">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                StochRSI Analysis
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 mb-2">
                    <strong>Mean Reversion Strategy:</strong>
                  </p>
                  <ul className="space-y-1 text-gray-700">
                    <li>• StochRSI above 80: Overbought condition</li>
                    <li>• StochRSI below 20: Oversold condition</li>
                    <li>• Current level indicates momentum building</li>
                  </ul>
                </div>
                <div>
                  <p className="text-gray-600 mb-2">
                    <strong>Trading Signals:</strong>
                  </p>
                  <ul className="space-y-1 text-gray-700">
                    <li>• Bullish divergence spotted</li>
                    <li>• RSI crossover confirmation</li>
                    <li>• Volume supporting the move</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 2. Connors RSI Family */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader title="2. Connors RSI Family (கன்னர்ஸ் RSI குடும்பம்)" />
          <CardContent>
            {renderIndicatorCard(
              stockAnalysis.technicalIndicators.connorsRSI,
              "bg-blue-50",
              "border-blue-200",
              "Connors RSI"
            )}

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* RSI(2) */}
              <div className="p-4 bg-blue-25 rounded-lg border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                  <Circle className="w-4 h-4 mr-2" />
                  RSI(2)
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Value</span>
                    <span className="font-semibold text-blue-700">25.8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className="text-green-600 font-medium">Oversold</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Signal</span>
                    <span className="text-green-600 font-medium">Buy</span>
                  </div>
                </div>
              </div>

              {/* RSI-25/75 */}
              <div className="p-4 bg-blue-25 rounded-lg border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                  <Triangle className="w-4 h-4 mr-2" />
                  RSI-25/75
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">RSI-25</span>
                    <span className="font-semibold text-blue-700">28.5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">RSI-75</span>
                    <span className="font-semibold text-blue-700">72.1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Signal</span>
                    <span className="text-green-600 font-medium">Buy Zone</span>
                  </div>
                </div>
              </div>

              {/* Cumulative RSI */}
              <div className="p-4 bg-blue-25 rounded-lg border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  CumRSI
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cum Value</span>
                    <span className="font-semibold text-blue-700">68.2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trend</span>
                    <span className="text-green-600 font-medium">Bullish</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Strength</span>
                    <span className="text-green-600 font-medium">Strong</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 3. MACD + Mean-Reversion Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader title="3. MACD + Mean-Reversion Filter (MACD + சராசரி திரும்பும் வடிகறி)" />
          <CardContent>
            {renderIndicatorCard(
              stockAnalysis.technicalIndicators.macd,
              "bg-purple-50",
              "border-purple-200",
              "MACD"
            )}

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* MACD Components */}
              <div className="p-4 bg-purple-25 rounded-lg border border-purple-100">
                <h4 className="text-sm font-semibold text-purple-900 mb-3">
                  MACD Components
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">MACD Line</span>
                    <span className="text-sm font-semibold text-purple-700">
                      2.85
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Signal Line</span>
                    <span className="text-sm font-semibold text-purple-700">
                      1.92
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Histogram</span>
                    <span className="text-sm font-semibold text-green-600">
                      +0.93
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Crossover</span>
                    <span className="text-sm font-semibold text-green-600">
                      Bullish
                    </span>
                  </div>
                </div>
              </div>

              {/* Mean-Reversion Filter */}
              <div className="p-4 bg-purple-25 rounded-lg border border-purple-100">
                <h4 className="text-sm font-semibold text-purple-900 mb-3">
                  Mean-Reversion Filter
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">RSI Filter</span>
                    <span className="text-sm font-semibold text-green-600">
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">BB Filter</span>
                    <span className="text-sm font-semibold text-green-600">
                      Confirmed
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Volume Filter</span>
                    <span className="text-sm font-semibold text-green-600">
                      Strong
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      Combined Signal
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      BUY
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 4. Pattern Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader title="4. Pattern Analysis (வடிவ பகுப்பாய்வு)" />
          <CardContent>
            {renderIndicatorCard(
              stockAnalysis.technicalIndicators.patterns,
              "bg-orange-50",
              "border-orange-200",
              "Pattern Analysis"
            )}

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pattern Details */}
              <div className="p-4 bg-orange-25 rounded-lg border border-orange-100">
                <h4 className="text-sm font-semibold text-orange-900 mb-3">
                  Current Pattern
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <ArrowDown className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-gray-700">
                      3 consecutive down closes detected
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-700">
                      Price above 200-day moving average
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-gray-700">
                      Exit strategy: 5-day moving average
                    </span>
                  </div>
                  <div className="p-2 bg-green-100 rounded">
                    <p className="text-xs text-green-800">
                      <strong>Pattern Confidence:</strong> 75% - Mean reversion
                      setup with strong probability
                    </p>
                  </div>
                </div>
              </div>

              {/* Moving Averages */}
              <div className="p-4 bg-orange-25 rounded-lg border border-orange-100">
                <h4 className="text-sm font-semibold text-orange-900 mb-3">
                  Moving Averages
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">5-DMA</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹1,235
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">20-DMA</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹1,215
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">50-DMA</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹1,180
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">200-DMA</span>
                    <span className="text-sm font-semibold text-green-600">
                      ₹1,095
                    </span>
                  </div>
                  <div className="p-2 bg-blue-100 rounded">
                    <p className="text-xs text-blue-800">
                      <strong>Trend:</strong> Bullish above 200-DMA, short-term
                      consolidation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 5. Support and Resistance Levels */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card>
          <CardHeader
            title="5. Support and Resistance Levels (துணை மற்றும் எதிர்ப்பு மட்டங்கள்)"
            action={<BarChart3 className="w-6 h-6 text-indigo-600" />}
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Support Levels */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Support Levels
                </h3>
                <div className="space-y-3">
                  {stockAnalysis.technicalIndicators.support.map(
                    (level, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-green-100 rounded-lg cursor-pointer hover:bg-green-200 hover:shadow-md transition-all duration-200"
                        onClick={() =>
                          handleIndicatorClick("Support Level", level, {
                            level,
                            type: "support",
                            index: index + 1,
                          })
                        }
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              index === 0
                                ? "bg-green-600"
                                : index === 1
                                ? "bg-green-500"
                                : "bg-green-400"
                            }`}
                          />
                          <span className="text-sm font-medium text-green-900">
                            Support {index + 1}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-green-700">
                          ₹{level}
                        </span>
                      </div>
                    )
                  )}
                  <div className="p-3 bg-green-100 rounded-lg">
                    <p className="text-xs text-green-800">
                      <strong>Strategy:</strong> Look for buying opportunities
                      near support levels with volume confirmation
                    </p>
                  </div>
                </div>
              </div>

              {/* Resistance Levels */}
              <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Resistance Levels
                </h3>
                <div className="space-y-3">
                  {stockAnalysis.technicalIndicators.resistance.map(
                    (level, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-red-100 rounded-lg cursor-pointer hover:bg-red-200 hover:shadow-md transition-all duration-200"
                        onClick={() =>
                          handleIndicatorClick("Resistance Level", level, {
                            level,
                            type: "resistance",
                            index: index + 1,
                          })
                        }
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              index === 0
                                ? "bg-red-600"
                                : index === 1
                                ? "bg-red-500"
                                : "bg-red-400"
                            }`}
                          />
                          <span className="text-sm font-medium text-red-900">
                            Resistance {index + 1}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-red-700">
                          ₹{level}
                        </span>
                      </div>
                    )
                  )}
                  <div className="p-3 bg-red-100 rounded-lg">
                    <p className="text-xs text-red-800">
                      <strong>Strategy:</strong> Consider profit booking near
                      resistance levels or breakout confirmation
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Technical Analysis Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardHeader
            title="Technical Analysis Summary (தொழில்நுட்ப பகுப்பாய்வு சுருக்கம்)"
            action={<Activity className="w-6 h-6 text-purple-600" />}
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Short Term */}
              <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                <ArrowUp className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  குறுகிய காலம் (1-2 வாரங்கள்)
                </h3>
                <p className="text-2xl font-bold text-green-600 mb-2">
                  BULLISH
                </p>
                <p className="text-sm text-green-700">
                  Multiple indicators confirm upward momentum. Entry levels
                  identified with clear stop-loss.
                </p>
              </div>

              {/* Medium Term */}
              <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
                <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  நடுத்தர காலம் (1-3 மாதங்கள்)
                </h3>
                <p className="text-2xl font-bold text-blue-600 mb-2">
                  POSITIVE
                </p>
                <p className="text-sm text-blue-700">
                  Trend remains intact above key moving averages. Target levels
                  achievable with patience.
                </p>
              </div>

              {/* Risk Assessment */}
              <div className="text-center p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                <Shield className="w-8 h-8 text-yellow-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  அபாய மதிப்பீடு
                </h3>
                <p className="text-2xl font-bold text-yellow-600 mb-2">
                  MODERATE
                </p>
                <p className="text-sm text-yellow-700">
                  Well-defined risk levels with favorable risk-reward ratios
                  across all indicators.
                </p>
              </div>
            </div>

            {/* Key Recommendations */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Key Recommendations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-semibold text-green-700 mb-2">
                    Entry Strategy
                  </h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>
                      • Consider accumulating on dips to ₹1,240-1,250 range
                    </li>
                    <li>• Wait for volume confirmation on any entry</li>
                    <li>• Multiple indicators support current levels</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-red-700 mb-2">
                    Risk Management
                  </h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Strict stop-loss below ₹1,180-1,190</li>
                    <li>• Position size according to risk tolerance</li>
                    <li>• Monitor volume and momentum shifts</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Technical Modal */}
      {selectedIndicator && (
        <TechnicalModal
          isOpen={modalOpen}
          onClose={closeModal}
          indicatorType={selectedIndicator.type}
          indicatorValue={selectedIndicator.value}
          indicatorData={selectedIndicator.data}
          stockData={stockAnalysis}
        />
      )}
    </div>
  );
};

export default TechnicalAnalysisTab;
