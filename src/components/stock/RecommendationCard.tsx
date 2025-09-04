import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target, 
  AlertTriangle, 
  Star, 
  Clock,
  Brain,
  IndianRupee
} from 'lucide-react';
import Card, { CardContent } from '@/components/ui/Card';
import type { StockRecommendation, SignalType } from '@/types';

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
  className = ''
}) => {
  const getSignalConfig = (signal: SignalType) => {
    switch (signal) {
      case 'BUY':
        return {
          icon: TrendingUp,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          label: 'BUY'
        };
      case 'SELL':
        return {
          icon: TrendingDown,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          label: 'SELL'
        };
      case 'HOLD':
        return {
          icon: Minus,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          label: 'HOLD'
        };
    }
  };

  const signalConfig = getSignalConfig(recommendation.recommendation);
  const SignalIcon = signalConfig.icon;

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
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
          h-full cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1
          ${signalConfig.borderColor} border-l-4 relative overflow-hidden
        `}
        onClick={() => onSelect?.(recommendation)}
      >
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white
                ${rank <= 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-500'}
              `}>
                {rank}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">{recommendation.symbol}</h3>
                <p className="text-sm text-gray-600 truncate max-w-[200px]">
                  {recommendation.name}
                </p>
              </div>
            </div>
            
            <div className={`
              flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium
              ${signalConfig.color} ${signalConfig.bgColor}
            `}>
              <SignalIcon className="w-3 h-3" />
              <span>{signalConfig.label}</span>
            </div>
          </div>

          {/* Price and Target */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Current Price</p>
              <p className="text-lg font-bold text-gray-900 flex items-center">
                <IndianRupee className="w-4 h-4 mr-1" />
                {recommendation.currentPrice.toFixed(2)}
              </p>
            </div>
            
            {recommendation.targetPrice && (
              <div>
                <p className="text-xs text-gray-600 mb-1 flex items-center">
                  <Target className="w-3 h-3 mr-1" />
                  Target Price
                </p>
                <p className="text-lg font-bold text-green-600 flex items-center">
                  <IndianRupee className="w-4 h-4 mr-1" />
                  {recommendation.targetPrice.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Upside and AI Score */}
          <div className="flex items-center justify-between mb-4">
            {recommendation.upside && (
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  +{recommendation.upside.toFixed(1)}% upside
                </span>
              </div>
            )}
            
            <div className="flex items-center space-x-1">
              <Brain className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">
                {recommendation.aiScore}/100
              </span>
            </div>
          </div>

          {/* Confidence Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Confidence</span>
              <span className="text-xs font-medium text-gray-900">
                {recommendation.confidence}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${recommendation.confidence}%` }}
                transition={{ duration: 0.6, delay: rank * 0.1 }}
                className={`h-2 rounded-full ${
                  recommendation.confidence >= 80 
                    ? 'bg-green-500' 
                    : recommendation.confidence >= 60 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
                }`}
              />
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-gray-600">P/E</p>
              <p className="text-sm font-medium">
                {recommendation.keyMetrics.pe?.toFixed(1) || 'N/A'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600">P/B</p>
              <p className="text-sm font-medium">
                {recommendation.keyMetrics.pb?.toFixed(1) || 'N/A'}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600">ROE</p>
              <p className="text-sm font-medium">
                {recommendation.keyMetrics.roe ? `${recommendation.keyMetrics.roe.toFixed(1)}%` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Market Cap */}
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-1">Market Cap</p>
            <p className="text-sm font-medium text-gray-900">
              {formatMarketCap(recommendation.keyMetrics.marketCap)}
            </p>
          </div>

          {/* Top Reasoning Points */}
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-2 flex items-center">
              <Star className="w-3 h-3 mr-1" />
              Key Strengths
            </p>
            <div className="space-y-1">
              {recommendation.reasoning.slice(0, 2).map((reason, index) => (
                <p key={index} className="text-xs text-gray-700 flex items-start">
                  <span className="w-1 h-1 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                  {reason}
                </p>
              ))}
            </div>
          </div>

          {/* Top Risk */}
          {recommendation.risks.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-2 flex items-center">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Key Risk
              </p>
              <p className="text-xs text-gray-700 flex items-start">
                <span className="w-1 h-1 bg-red-500 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                {recommendation.risks[0]}
              </p>
            </div>
          )}

          {/* Time Frame Badge */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{recommendation.timeFrame} horizon</span>
            </div>
            <span>
              Generated {new Date(recommendation.generatedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RecommendationCard;