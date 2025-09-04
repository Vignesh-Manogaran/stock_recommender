import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Target,
  Shield,
  IndianRupee,
  Eye,
  Clock
} from 'lucide-react';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { StockRecommendation, SignalType } from '@/types';

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

  const formatPrice = (price: number | null) => {
    if (!price) return 'N/A';
    return `₹${price.toFixed(2)}`;
  };

  const getTimeFrameLabel = (timeFrame: string) => {
    const labels = {
      '7D': '1 Week',
      '1M': '1 Month', 
      '3M': '3 Months',
      '6M': '6 Months',
      '1Y': '1 Year'
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
          h-full cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1
          ${signalConfig.borderColor} border-l-4 relative overflow-hidden
        `}
        onClick={() => onSelect?.(recommendation)}
      >
        <CardContent className="p-4">
          {/* Header with Rank and Signal */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`
                flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white
                ${rank <= 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-500'}
              `}>
                {rank}
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">{recommendation.symbol}</h3>
                <p className="text-sm text-gray-600 truncate max-w-[160px]">
                  {recommendation.name}
                </p>
              </div>
            </div>
            
            <div className={`
              flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
              ${signalConfig.color} ${signalConfig.bgColor}
            `}>
              <SignalIcon className="w-3 h-3" />
              <span>{signalConfig.label}</span>
            </div>
          </div>

          {/* Price Information Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Current Price */}
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Current Price</p>
              <p className="text-lg font-bold text-gray-900 flex items-center justify-center">
                <IndianRupee className="w-4 h-4 mr-1" />
                {recommendation.currentPrice.toFixed(2)}
              </p>
            </div>
            
            {/* Target Price */}
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 mb-1 flex items-center justify-center">
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
            <div className="text-center p-2 bg-purple-50 rounded-lg">
              <p className="text-xs text-purple-600 mb-1 flex items-center justify-center">
                <Clock className="w-3 h-3 mr-1" />
                Target Time
              </p>
              <p className="text-sm font-semibold text-purple-600">
                {getTimeFrameLabel(recommendation.timeFrame)}
              </p>
            </div>
            
            {/* Stop Loss */}
            <div className="text-center p-2 bg-red-50 rounded-lg">
              <p className="text-xs text-red-600 mb-1 flex items-center justify-center">
                <Shield className="w-3 h-3 mr-1" />
                Stop Loss
              </p>
              <p className="text-sm font-semibold text-red-600 flex items-center justify-center">
                <IndianRupee className="w-3 h-3 mr-1" />
                {formatPrice(recommendation.stopLoss)}
              </p>
            </div>
          </div>

          {/* Rationale */}
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-2 font-medium">Rationale</p>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-sm text-gray-700 line-clamp-2">
                {recommendation.reasoning[0] || 'AI-based recommendation'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              icon={<Eye className="w-4 h-4" />}
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(recommendation);
              }}
            >
              Details
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(recommendation);
              }}
            >
              {signalConfig.label}
            </Button>
          </div>

          {/* Confidence Badge */}
          <div className="absolute top-2 right-2">
            <div className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${recommendation.confidence >= 80 
                ? 'bg-green-100 text-green-700' 
                : recommendation.confidence >= 60 
                ? 'bg-yellow-100 text-yellow-700' 
                : 'bg-red-100 text-red-700'
              }
            `}>
              {recommendation.confidence}%
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RecommendationCardSimple;