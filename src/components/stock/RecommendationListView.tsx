import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  IndianRupee,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  Clock
} from 'lucide-react';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { StockRecommendation, SignalType } from '@/types';

interface RecommendationListViewProps {
  recommendations: StockRecommendation[];
  onViewDetails?: (recommendation: StockRecommendation) => void;
  onSelect?: (recommendation: StockRecommendation) => void;
  className?: string;
}

const RecommendationListView: React.FC<RecommendationListViewProps> = ({
  recommendations,
  onViewDetails,
  onSelect,
  className = ''
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const getSignalConfig = (signal: SignalType) => {
    switch (signal) {
      case 'BUY':
        return {
          icon: TrendingUp,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          label: 'BUY'
        };
      case 'SELL':
        return {
          icon: TrendingDown,
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          label: 'SELL'
        };
      case 'HOLD':
        return {
          icon: Minus,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          label: 'HOLD'
        };
    }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'N/A';
    return price.toFixed(2);
  };

  const calculateUpside = (current: number, target: number | null) => {
    if (!target) return null;
    return ((target - current) / current * 100).toFixed(1);
  };

  const getTimeFrameLabel = (timeFrame: string) => {
    const labels = {
      '7D': '1W',
      '1M': '1M', 
      '3M': '3M',
      '6M': '6M',
      '1Y': '1Y'
    };
    return labels[timeFrame as keyof typeof labels] || timeFrame;
  };

  return (
    <div className={className}>
      <Card>
        <CardContent className="p-0">
          {/* Table Header */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 px-4 py-3 text-sm font-medium text-gray-700">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-3">Stock Name</div>
              <div className="col-span-1 text-right">Current</div>
              <div className="col-span-1 text-right">Target</div>
              <div className="col-span-1 text-right">Stop Loss</div>
              <div className="col-span-1 text-center">Upside %</div>
              <div className="col-span-1 text-center">Signal</div>
              <div className="col-span-1 text-center">Time</div>
              <div className="col-span-1 text-center">Confidence</div>
              <div className="col-span-1 text-center">Actions</div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-100">
            {recommendations.map((recommendation, index) => {
              const signalConfig = getSignalConfig(recommendation.recommendation);
              const SignalIcon = signalConfig.icon;
              const upside = calculateUpside(recommendation.currentPrice, recommendation.targetPrice);
              const isSelected = selectedId === recommendation.id;

              return (
                <motion.div
                  key={recommendation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`
                    grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors
                    ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}
                  `}
                  onClick={() => {
                    setSelectedId(isSelected ? null : recommendation.id);
                    onSelect?.(recommendation);
                  }}
                >
                  {/* Rank */}
                  <div className="col-span-1 flex items-center justify-center">
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white
                      ${index < 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-500'}
                    `}>
                      {index + 1}
                    </div>
                  </div>

                  {/* Stock Name */}
                  <div className="col-span-3 flex items-center">
                    <div>
                      <p className="font-semibold text-gray-900">{recommendation.symbol}</p>
                      <p className="text-sm text-gray-600 truncate">
                        {recommendation.name}
                      </p>
                    </div>
                  </div>

                  {/* Current Price */}
                  <div className="col-span-1 flex items-center justify-end">
                    <div className="text-right">
                      <div className="flex items-center justify-end text-sm font-medium text-gray-900">
                        <IndianRupee className="w-3 h-3 mr-1" />
                        {formatPrice(recommendation.currentPrice)}
                      </div>
                    </div>
                  </div>

                  {/* Target Price */}
                  <div className="col-span-1 flex items-center justify-end">
                    <div className="text-right">
                      {recommendation.targetPrice ? (
                        <div className="flex items-center justify-end text-sm font-medium text-blue-600">
                          <IndianRupee className="w-3 h-3 mr-1" />
                          {formatPrice(recommendation.targetPrice)}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </div>
                  </div>

                  {/* Stop Loss */}
                  <div className="col-span-1 flex items-center justify-end">
                    <div className="text-right">
                      {recommendation.stopLoss ? (
                        <div className="flex items-center justify-end text-sm font-medium text-red-600">
                          <IndianRupee className="w-3 h-3 mr-1" />
                          {formatPrice(recommendation.stopLoss)}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
                    </div>
                  </div>

                  {/* Upside % */}
                  <div className="col-span-1 flex items-center justify-center">
                    {upside ? (
                      <div className={`
                        flex items-center text-sm font-medium
                        ${parseFloat(upside) >= 0 ? 'text-green-600' : 'text-red-600'}
                      `}>
                        {parseFloat(upside) >= 0 ? (
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                        ) : (
                          <ArrowDownLeft className="w-3 h-3 mr-1" />
                        )}
                        {Math.abs(parseFloat(upside))}%
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">N/A</span>
                    )}
                  </div>

                  {/* Signal */}
                  <div className="col-span-1 flex items-center justify-center">
                    <div className={`
                      flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium
                      ${signalConfig.color} ${signalConfig.bgColor}
                    `}>
                      <SignalIcon className="w-3 h-3" />
                      <span>{signalConfig.label}</span>
                    </div>
                  </div>

                  {/* Time Frame */}
                  <div className="col-span-1 flex items-center justify-center">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-3 h-3 mr-1" />
                      {getTimeFrameLabel(recommendation.timeFrame)}
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="col-span-1 flex items-center justify-center">
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

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Eye className="w-3 h-3" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails?.(recommendation);
                      }}
                      className="h-7 px-2 text-xs"
                    >
                      View
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Empty State */}
          {recommendations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No recommendations available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mobile Responsive Cards (shown on smaller screens) */}
      <div className="md:hidden space-y-3">
        {recommendations.map((recommendation, index) => {
          const signalConfig = getSignalConfig(recommendation.recommendation);
          const SignalIcon = signalConfig.icon;
          const upside = calculateUpside(recommendation.currentPrice, recommendation.targetPrice);

          return (
            <motion.div
              key={`mobile-${recommendation.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onSelect?.(recommendation)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white
                        ${index < 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-500'}
                      `}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{recommendation.symbol}</h4>
                        <p className="text-sm text-gray-600">{recommendation.name}</p>
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

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-600">Current</p>
                      <p className="font-medium">₹{formatPrice(recommendation.currentPrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Target</p>
                      <p className="font-medium text-blue-600">
                        ₹{formatPrice(recommendation.targetPrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Stop Loss</p>
                      <p className="font-medium text-red-600">
                        ₹{formatPrice(recommendation.stopLoss)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Upside</p>
                      <p className={`font-medium ${upside && parseFloat(upside) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {upside ? `${upside}%` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Eye className="w-4 h-4" />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails?.(recommendation);
                    }}
                    className="w-full"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendationListView;