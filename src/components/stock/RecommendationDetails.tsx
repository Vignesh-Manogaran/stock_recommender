import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Target,
  Shield,
  IndianRupee,
  Clock,
  Brain,
  AlertTriangle,
  Star,
  BarChart3,
  Calendar
} from 'lucide-react';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { StockRecommendation, SignalType } from '@/types';

interface RecommendationDetailsProps {
  recommendation: StockRecommendation | null;
  isOpen: boolean;
  onClose: () => void;
}

const RecommendationDetails: React.FC<RecommendationDetailsProps> = ({
  recommendation,
  isOpen,
  onClose
}) => {
  if (!recommendation) return null;

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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {recommendation.symbol}
                      </h2>
                      <p className="text-gray-600">{recommendation.name}</p>
                    </div>
                    
                    <div className={`
                      flex items-center space-x-2 px-3 py-2 rounded-lg
                      ${signalConfig.color} ${signalConfig.bgColor} ${signalConfig.borderColor} border
                    `}>
                      <SignalIcon className="w-5 h-5" />
                      <span className="font-semibold">{signalConfig.label}</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<X className="w-4 h-4" />}
                    onClick={onClose}
                  />
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <IndianRupee className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Current Price</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatPrice(recommendation.currentPrice)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Target Price</p>
                      <p className="text-xl font-bold text-green-600">
                        {formatPrice(recommendation.targetPrice)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <Shield className="w-6 h-6 text-red-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Stop Loss</p>
                      <p className="text-xl font-bold text-red-600">
                        {formatPrice(recommendation.stopLoss)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Upside Potential</p>
                      <p className="text-xl font-bold text-purple-600">
                        {recommendation.upside ? `${recommendation.upside.toFixed(1)}%` : 'N/A'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Analysis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Brain className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">AI Analysis</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">AI Score</span>
                          <span className="font-medium">{recommendation.aiScore}/100</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Confidence</span>
                          <span className="font-medium">{recommendation.confidence}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Time Horizon</span>
                          <span className="font-medium">{recommendation.timeFrame}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <BarChart3 className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-gray-900">Key Metrics</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">P/E Ratio</span>
                          <span className="font-medium">
                            {recommendation.keyMetrics.pe?.toFixed(1) || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">P/B Ratio</span>
                          <span className="font-medium">
                            {recommendation.keyMetrics.pb?.toFixed(1) || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">ROE</span>
                          <span className="font-medium">
                            {recommendation.keyMetrics.roe ? `${recommendation.keyMetrics.roe.toFixed(1)}%` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Market Cap</span>
                          <span className="font-medium">
                            {formatMarketCap(recommendation.keyMetrics.marketCap)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Reasoning */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Star className="w-5 h-5 text-green-600" />
                        <h3 className="font-semibold text-gray-900">Key Strengths</h3>
                      </div>
                      <ul className="space-y-2">
                        {recommendation.reasoning.map((reason, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm">
                            <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                            <span className="text-gray-700">{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <h3 className="font-semibold text-gray-900">Risk Factors</h3>
                      </div>
                      <ul className="space-y-2">
                        {recommendation.risks.map((risk, index) => (
                          <li key={index} className="flex items-start space-x-2 text-sm">
                            <span className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                            <span className="text-gray-700">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Generated: {new Date(recommendation.generatedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Valid until: {new Date(recommendation.validUntil).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RecommendationDetails;