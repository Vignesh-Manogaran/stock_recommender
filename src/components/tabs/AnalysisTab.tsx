import React, { useState, useEffect } from 'react';
import { LayoutGrid, List, Users, Filter, Brain, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useStockStore,
  useRecommendations,
  useRecommendationLoading,
  useRecommendationError,
  useSelectedTimeFrame,
  useSelectedSector
} from '@/stores/stockStore';
import Button from '@/components/ui/Button';
import StockCard, { StockCardCompact } from '@/components/stock/StockCard';
import StockTable from '@/components/stock/StockTable';
import TimeFrameTabs from '@/components/layout/TimeFrameTabs';
import SectorFilter from '@/components/layout/SectorFilter';
import RecommendationGrid from '@/components/stock/RecommendationGrid';
import RecommendationDetails from '@/components/stock/RecommendationDetails';
import type { Stock, SortOption, StockRecommendation } from '@/types';

const AnalysisTab: React.FC = () => {
  const {
    filteredStocks,
    sortOption,
    userPreferences,
    setSortOption,
    toggleFavorite,
    setSelectedStock,
    setSelectedTimeFrame,
    setSelectedSector,
    loadRecommendations,
    refreshRecommendations,
  } = useStockStore();

  // Recommendation state
  const recommendations = useRecommendations();
  const recommendationLoading = useRecommendationLoading();
  const recommendationError = useRecommendationError();
  const selectedTimeFrame = useSelectedTimeFrame();
  const selectedSector = useSelectedSector();

  const [viewMode, setViewMode] = useState<'recommendations' | 'grid' | 'list' | 'table'>('recommendations');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<StockRecommendation | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Load initial recommendations
  useEffect(() => {
    if (viewMode === 'recommendations' && recommendations.length === 0 && !recommendationLoading) {
      loadRecommendations();
    }
  }, [viewMode, recommendations.length, recommendationLoading, loadRecommendations]);

  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock);
    console.log('Selected stock:', stock);
  };

  const handleRecommendationSelect = (recommendation: StockRecommendation) => {
    // Find the full stock data for this recommendation
    const stock = filteredStocks.find(s => s.id === recommendation.stockId);
    if (stock) {
      setSelectedStock(stock);
      console.log('Selected recommendation:', recommendation, 'Stock:', stock);
    }
  };

  const handleViewDetails = (recommendation: StockRecommendation) => {
    setSelectedRecommendation(recommendation);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedRecommendation(null);
  };

  const handleSort = (newSortOption: SortOption) => {
    setSortOption(newSortOption);
  };

  const handleFavoriteToggle = (stockId: string) => {
    toggleFavorite(stockId);
  };

  return (
    <div className="space-y-6">
      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            {viewMode === 'recommendations' ? 'AI Stock Recommendations' : 'Market Analysis'}
          </h2>
          <span className="text-sm text-gray-600">
            {viewMode === 'recommendations' 
              ? `${recommendations.length} recommendations` 
              : `${filteredStocks.length} stocks`
            }
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Filters Button - only show for non-recommendation views */}
          {viewMode !== 'recommendations' && (
            <Button
              variant="outline"
              size="sm"
              icon={<Filter className="w-4 h-4" />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filters
            </Button>
          )}

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('recommendations')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'recommendations' 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="AI Recommendations"
            >
              <Brain className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'table' 
                  ? 'bg-primary-100 text-primary-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Table View"
            >
              <Users className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Recommendation Controls */}
      {viewMode === 'recommendations' && (
        <div className="space-y-4">
          <TimeFrameTabs 
            activeTimeFrame={selectedTimeFrame}
            onTimeFrameChange={setSelectedTimeFrame}
          />
          
          <SectorFilter 
            activeSector={selectedSector}
            onSectorChange={setSelectedSector}
          />
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-lg border border-gray-200 p-4"
        >
          <div className="text-sm text-gray-600">
            Filter controls will be implemented here
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {viewMode === 'recommendations' && (
          <motion.div
            key="recommendations"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <RecommendationGrid
              recommendations={recommendations}
              isLoading={recommendationLoading}
              error={recommendationError}
              timeFrame={selectedTimeFrame}
              sector={selectedSector}
              onRefresh={refreshRecommendations}
              onRecommendationSelect={handleRecommendationSelect}
              onViewDetails={handleViewDetails}
            />
          </motion.div>
        )}

        {viewMode === 'grid' && (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredStocks.map((stock) => (
              <StockCard
                key={stock.id}
                stock={stock}
                onSelect={handleStockSelect}
                onFavoriteToggle={handleFavoriteToggle}
                isFavorite={userPreferences.favorites.includes(stock.id)}
              />
            ))}
          </motion.div>
        )}

        {viewMode === 'list' && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {filteredStocks.map((stock) => (
              <StockCardCompact
                key={stock.id}
                stock={stock}
                onSelect={handleStockSelect}
                onFavoriteToggle={handleFavoriteToggle}
                isFavorite={userPreferences.favorites.includes(stock.id)}
              />
            ))}
          </motion.div>
        )}

        {viewMode === 'table' && (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <StockTable
              stocks={filteredStocks}
              onSort={handleSort}
              sortOption={sortOption}
              onStockSelect={handleStockSelect}
              onFavoriteToggle={handleFavoriteToggle}
              favoriteStocks={userPreferences.favorites}
              showPagination
              pageSize={20}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {filteredStocks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LayoutGrid className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No stocks found
          </h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or removing some filters
          </p>
        </div>
      )}

      {/* Recommendation Details Modal */}
      <RecommendationDetails
        recommendation={selectedRecommendation}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
      />
    </div>
  );
};

export default AnalysisTab;