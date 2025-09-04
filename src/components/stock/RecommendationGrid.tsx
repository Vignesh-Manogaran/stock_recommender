import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, AlertCircle, TrendingUp, Brain, Clock, LayoutGrid, List } from 'lucide-react';
import RecommendationCardSimple from './RecommendationCardSimple';
import RecommendationListView from './RecommendationListView';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import { useRecommendationViewMode, useStockStore } from '@/stores/stockStore';
import type { StockRecommendation, TimeFrame, Sector } from '@/types';

interface RecommendationGridProps {
  recommendations: StockRecommendation[];
  isLoading: boolean;
  error: string | null;
  timeFrame: TimeFrame;
  sector: Sector;
  onRefresh: () => void;
  onRecommendationSelect?: (recommendation: StockRecommendation) => void;
  onViewDetails?: (recommendation: StockRecommendation) => void;
  className?: string;
  hideControls?: boolean;
}

const RecommendationGrid: React.FC<RecommendationGridProps> = ({
  recommendations,
  isLoading,
  error,
  timeFrame,
  sector,
  onRefresh,
  onRecommendationSelect,
  onViewDetails,
  className = '',
  hideControls = false
}) => {
  const recommendationViewMode = useRecommendationViewMode();
  const { setRecommendationViewMode } = useStockStore();
  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index} className="h-96 animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full" />
              <div>
                <div className="h-4 bg-gray-300 rounded w-16 mb-1" />
                <div className="h-3 bg-gray-200 rounded w-24" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-300 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="h-8 bg-gray-200 rounded w-full" />
              <div className="flex space-x-2">
                <div className="h-3 bg-gray-300 rounded flex-1" />
                <div className="h-3 bg-gray-300 rounded flex-1" />
                <div className="h-3 bg-gray-300 rounded flex-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // Error state component
  const ErrorState = () => (
    <Card className="p-8 text-center">
      <CardContent>
        <div className="text-red-500 mb-4">
          <AlertCircle className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Failed to Load Recommendations
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button
          onClick={onRefresh}
          variant="primary"
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Try Again
        </Button>
      </CardContent>
    </Card>
  );

  // Empty state component
  const EmptyState = () => (
    <Card className="p-8 text-center">
      <CardContent>
        <div className="text-gray-400 mb-4">
          <Brain className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Recommendations Available
        </h3>
        <p className="text-gray-600 mb-4">
          No recommendations found for {sector} sector with {timeFrame} timeframe.
        </p>
        <Button
          onClick={onRefresh}
          variant="outline"
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh
        </Button>
      </CardContent>
    </Card>
  );

  // Header with metadata
  const GridHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">
            Top 5 Recommendations
          </h2>
        </div>
        
        <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{timeFrame} horizon</span>
          </div>
          <span>•</span>
          <span>{sector === 'All' ? 'All Sectors' : sector}</span>
          <span>•</span>
          <span>{recommendations.length} stocks</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* View Mode Toggle */}
        <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
          <button
            onClick={() => setRecommendationViewMode('cards')}
            className={`p-2 rounded transition-colors ${
              recommendationViewMode === 'cards' 
                ? 'bg-primary-100 text-primary-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Card View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setRecommendationViewMode('list')}
            className={`p-2 rounded transition-colors ${
              recommendationViewMode === 'list' 
                ? 'bg-primary-100 text-primary-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
          icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {!hideControls && <GridHeader />}

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingSkeleton />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ErrorState />
          </motion.div>
        ) : recommendations.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <EmptyState />
          </motion.div>
        ) : recommendationViewMode === 'list' ? (
          <motion.div
            key="recommendations-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <RecommendationListView
              recommendations={recommendations}
              onViewDetails={onViewDetails}
              onSelect={onRecommendationSelect}
            />
          </motion.div>
        ) : (
          <motion.div
            key="recommendations-cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {recommendations.map((recommendation, index) => (
              <RecommendationCardSimple
                key={recommendation.id}
                recommendation={recommendation}
                rank={index + 1}
                onSelect={onRecommendationSelect}
                onViewDetails={onViewDetails}
                className="h-full"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer with disclaimer */}
      {recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Investment Disclaimer</p>
              <p>
                These AI-powered recommendations are for informational purposes only and should not be 
                considered as financial advice. Past performance does not guarantee future results. 
                Please conduct your own research and consult with a financial advisor before making 
                investment decisions.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RecommendationGrid;