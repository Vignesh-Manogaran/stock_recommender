import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Shield,
  IndianRupee,
  Eye,
  Clock,
} from "lucide-react";
import Card, { CardContent } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { StockRecommendation, SignalType } from "@/types";

interface RecommendationCardSimpleProps {
  recommendation: StockRecommendation;
  rank: number;
  onSelect?: (recommendation: StockRecommendation) => void;
  onViewDetails?: (recommendation: StockRecommendation) => void;
  className?: string;
}

const RecommendationCardSimple: React.FC<RecommendationCardSimpleProps> = ({
  recommendation,
  rank,
  onSelect,
  onViewDetails,
  className = "",
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/stock/${recommendation.symbol}`);
  };

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const formatPrice = (price: number | null) => {
    if (!price) return "N/A";
    return `₹${price.toFixed(2)}`;
  };

  const getTimeFrameLabel = (timeFrame: string) => {
    const labels = {
      "7D": "1 Week",
      "1M": "1 Month",
      "3M": "3 Months",
      "6M": "6 Months",
      "1Y": "1 Year",
    };
    return labels[timeFrame as keyof typeof labels] || timeFrame;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.05 }}
      className={className}
    >
      <Card
        className={`
          h-full cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-2
          bg-white border border-gray-100 rounded-xl relative overflow-hidden group
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

        <CardContent className="p-5">
          {/* Header with Rank and Signal */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className={`
                flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold text-white shadow-sm
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
                <h3 className="font-bold text-lg text-gray-900">
                  {recommendation.symbol}
                </h3>
                <p className="text-sm text-gray-600 truncate max-w-[160px] font-medium">
                  {recommendation.name}
                </p>
              </div>
            </div>

            <div
              className={`
              flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm
              ${signalConfig.color} ${signalConfig.bgColor} border ${signalConfig.borderColor}
            `}
            >
              <SignalIcon className="w-3 h-3" />
              <span>{signalConfig.label}</span>
            </div>
          </div>

          {/* Price Information Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Current Price */}
            <div className="text-center p-3 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-600 mb-1.5 font-medium">
                Current Price
              </p>
              <p className="text-lg font-bold text-gray-900 flex items-center justify-center">
                <IndianRupee className="w-4 h-4 mr-1" />
                {recommendation.currentPrice.toFixed(2)}
              </p>
            </div>

            {/* Target Price */}
            <div className="text-center p-3 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-600 mb-1.5 font-medium flex items-center justify-center">
                <Target className="w-3 h-3 mr-1" />
                Target Price
              </p>
              <p className="text-lg font-bold text-blue-600 flex items-center justify-center">
                <IndianRupee className="w-4 h-4 mr-1" />
                {formatPrice(recommendation.targetPrice)}
              </p>
            </div>
          </div>

          {/* Target Time & Stop Loss */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Target Time */}
            <div className="text-center p-3 bg-purple-50 rounded-xl border border-purple-100">
              <p className="text-xs text-purple-600 mb-1.5 font-medium flex items-center justify-center">
                <Clock className="w-3 h-3 mr-1" />
                Target Time
              </p>
              <p className="text-sm font-semibold text-purple-600">
                {getTimeFrameLabel(recommendation.timeFrame)}
              </p>
            </div>

            {/* Stop Loss */}
            <div className="text-center p-3 bg-red-50 rounded-xl border border-red-100">
              <p className="text-xs text-red-600 mb-1.5 font-medium flex items-center justify-center">
                <Shield className="w-3 h-3 mr-1" />
                Stop Loss
              </p>
              <p className="text-sm font-semibold text-red-600 flex items-center justify-center">
                <IndianRupee className="w-3 h-3 mr-1" />
                {formatPrice(recommendation.stopLoss)}
              </p>
            </div>
          </div>

          {/* Confidence Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">
                Confidence
              </span>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-md ${
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
            <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${recommendation.confidence}%` }}
                transition={{ duration: 0.6, delay: rank * 0.05 }}
                className={`h-2 rounded-full ${
                  recommendation.confidence >= 80
                    ? "bg-gradient-to-r from-green-400 to-green-600"
                    : recommendation.confidence >= 60
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                    : "bg-gradient-to-r from-red-400 to-red-600"
                }`}
              />
            </div>
          </div>

          {/* Rationale */}
          <div className="mb-5">
            <p className="text-xs text-gray-600 mb-2 font-semibold">
              Rationale
            </p>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                {recommendation.reasoning[0] || "Strong best fundamentals"}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-10 rounded-xl border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              icon={<Eye className="w-4 h-4" />}
              onClick={handleDetailsClick}
            >
              Details
            </Button>

            <Button
              variant="primary"
              size="sm"
              className={`flex-1 h-10 rounded-xl font-semibold transition-all duration-200 ${
                recommendation.recommendation === "BUY"
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-sm"
                  : recommendation.recommendation === "SELL"
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                  : "bg-yellow-600 hover:bg-yellow-700 text-white shadow-sm"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(recommendation);
              }}
            >
              {signalConfig.label}
            </Button>
          </div>

          {/* Subtle hover overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-purple-500/0 
                          opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none rounded-xl"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RecommendationCardSimple;
