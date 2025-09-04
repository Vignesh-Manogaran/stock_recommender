import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  AlertTriangle,
  Star,
  Clock,
  Brain,
  IndianRupee,
} from "lucide-react";
import Card, { CardContent } from "@/components/ui/Card";
import type { StockRecommendation, SignalType } from "@/types";

interface RecommendationCardProps {
  recommendation: StockRecommendation;
  rank: number;
  onSelect?: (recommendation: StockRecommendation) => void;
  className?: string;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  rank,
  onSelect,
  className = "",
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/stock/${recommendation.symbol}`);
  };
  const getSignalConfig = (signal: SignalType) => {
    switch (signal) {
      case "BUY":
        return {
          icon: TrendingUp,
          color: "text-green-600",
          bgColor: "bg-green-100",
          borderColor: "border-green-200",
          label: "BUY",
        };
      case "SELL":
        return {
          icon: TrendingDown,
          color: "text-red-600",
          bgColor: "bg-red-100",
          borderColor: "border-red-200",
          label: "SELL",
        };
      case "HOLD":
        return {
          icon: Minus,
          color: "text-yellow-600",
          bgColor: "bg-yellow-100",
          borderColor: "border-yellow-200",
          label: "HOLD",
        };
    }
  };

  const signalConfig = getSignalConfig(recommendation.recommendation);
  const SignalIcon = signalConfig.icon;

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.1 }}
      className={className}
    >
      <Card
        className={`
          h-full cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2
          bg-white border border-gray-100 rounded-2xl relative overflow-hidden group
          ${
            signalConfig.borderColor === "border-green-200"
              ? "hover:border-green-300"
              : signalConfig.borderColor === "border-red-200"
              ? "hover:border-red-300"
              : "hover:border-yellow-300"
          }
        `}
        onClick={handleCardClick}
      >
        {/* Top accent bar */}
        <div
          className={`h-1 w-full ${
            recommendation.recommendation === "BUY"
              ? "bg-gradient-to-r from-green-400 to-green-600"
              : recommendation.recommendation === "SELL"
              ? "bg-gradient-to-r from-red-400 to-red-600"
              : "bg-gradient-to-r from-yellow-400 to-yellow-600"
          }`}
        />

        <CardContent className="p-6">
          {/* Header with rank and signal */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div
                className={`
                flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold text-white shadow-lg
                ${
                  rank <= 3
                    ? "bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600"
                    : "bg-gradient-to-br from-gray-400 to-gray-600"
                }
              `}
              >
                {rank}
              </div>
              <div>
                <h3 className="font-bold text-xl text-gray-900 mb-1">
                  {recommendation.symbol}
                </h3>
                <p className="text-sm text-gray-600 truncate max-w-[200px] font-medium">
                  {recommendation.name}
                </p>
              </div>
            </div>

            <div
              className={`
              flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm
              ${signalConfig.color} ${signalConfig.bgColor} border ${signalConfig.borderColor}
            `}
            >
              <SignalIcon className="w-4 h-4" />
              <span>{signalConfig.label}</span>
            </div>
          </div>

          {/* Price section with enhanced styling */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-sm text-gray-600 mb-2 font-medium">
                Current Price
              </p>
              <p className="text-2xl font-bold text-gray-900 flex items-center">
                <IndianRupee className="w-5 h-5 mr-1" />
                {recommendation.currentPrice.toFixed(2)}
              </p>
            </div>

            {recommendation.targetPrice && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-sm text-blue-600 mb-2 font-medium flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  Target Price
                </p>
                <p className="text-2xl font-bold text-blue-600 flex items-center">
                  <IndianRupee className="w-5 h-5 mr-1" />
                  {recommendation.targetPrice.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Key metrics in enhanced grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Upside and confidence */}
            {recommendation.upside && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    Upside
                  </span>
                </div>
                <p className="text-xl font-bold text-green-600">
                  +{recommendation.upside.toFixed(1)}%
                </p>
              </div>
            )}

            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">
                  AI Score
                </span>
              </div>
              <p className="text-xl font-bold text-purple-600">
                {recommendation.aiScore}/100
              </p>
            </div>
          </div>

          {/* Enhanced confidence bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                Confidence Level
              </span>
              <span
                className={`text-sm font-bold px-3 py-1 rounded-full ${
                  recommendation.confidence >= 80
                    ? "text-green-700 bg-green-100"
                    : recommendation.confidence >= 60
                    ? "text-yellow-700 bg-yellow-100"
                    : "text-red-700 bg-red-100"
                }`}
              >
                {recommendation.confidence}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${recommendation.confidence}%` }}
                transition={{ duration: 0.8, delay: rank * 0.1 }}
                className={`h-3 rounded-full shadow-sm ${
                  recommendation.confidence >= 80
                    ? "bg-gradient-to-r from-green-400 to-green-600"
                    : recommendation.confidence >= 60
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                    : "bg-gradient-to-r from-red-400 to-red-600"
                }`}
              />
            </div>
          </div>

          {/* Key Metrics with better styling */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mb-6 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Key Metrics
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">P/E Ratio</p>
                <p className="text-lg font-bold text-gray-900">
                  {recommendation.keyMetrics.pe?.toFixed(1) || "N/A"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">P/B Ratio</p>
                <p className="text-lg font-bold text-gray-900">
                  {recommendation.keyMetrics.pb?.toFixed(1) || "N/A"}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-600 mb-1">ROE</p>
                <p className="text-lg font-bold text-gray-900">
                  {recommendation.keyMetrics.roe
                    ? `${recommendation.keyMetrics.roe.toFixed(1)}%`
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Market Cap */}
          <div className="mb-6">
            <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-100">
              <span className="text-sm font-medium text-indigo-600">
                Market Cap
              </span>
              <span className="text-lg font-bold text-indigo-900">
                {formatMarketCap(recommendation.keyMetrics.marketCap)}
              </span>
            </div>
          </div>

          {/* Top Reasoning Points */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Star className="w-4 h-4 text-amber-500" />
              <h4 className="text-sm font-semibold text-gray-700">
                Key Strengths
              </h4>
            </div>
            <div className="space-y-2">
              {recommendation.reasoning.slice(0, 2).map((reason, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-100"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {reason}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Risk */}
          {recommendation.risks.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h4 className="text-sm font-semibold text-gray-700">
                  Key Risk
                </h4>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-100">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  {recommendation.risks[0]}
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-gray-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                {recommendation.timeFrame} horizon
              </span>
            </div>
            <span className="text-xs text-gray-400">
              {new Date(recommendation.generatedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Subtle hover overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-purple-500/0 
                          opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none rounded-2xl"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RecommendationCard;
