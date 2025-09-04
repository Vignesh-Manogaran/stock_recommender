import React, { useState, useEffect } from 'react';
import { 
  useStockStore,
  useRecommendations,
  useRecommendationLoading,
  useRecommendationError,
  useSelectedTimeFrame,
  useSelectedSector
} from '@/stores/stockStore';
import TimeFrameTabs from '@/components/layout/TimeFrameTabs';
import SectorFilter from '@/components/layout/SectorFilter';
import RecommendationGrid from '@/components/stock/RecommendationGrid';
import RecommendationDetails from '@/components/stock/RecommendationDetails';
import type { StockRecommendation } from '@/types';

const AnalysisTab: React.FC = () => {
  const {
    filteredStocks,
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

  const [selectedRecommendation, setSelectedRecommendation] = useState<StockRecommendation | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Load initial recommendations
  useEffect(() => {
    if (recommendations.length === 0 && !recommendationLoading) {
      loadRecommendations();
    }
  }, [recommendations.length, recommendationLoading, loadRecommendations]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            AI Stock Recommendations
          </h2>
          <span className="text-sm text-gray-600">
            {recommendations.length} recommendations
          </span>
        </div>
      </div>

      {/* Recommendation Controls */}
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

      {/* Main Content */}
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