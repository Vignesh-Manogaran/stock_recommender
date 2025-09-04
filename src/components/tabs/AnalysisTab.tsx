import React, { useState, useEffect } from 'react';
import { RefreshCw, LayoutGrid, List } from 'lucide-react';
import { 
  useStockStore,
  useRecommendations,
  useRecommendationLoading,
  useRecommendationError,
  useSelectedTimeFrame,
  useSelectedSector,
  useRecommendationViewMode
} from '@/stores/stockStore';
import TimeFrameTabs from '@/components/layout/TimeFrameTabs';
import SectorFilter from '@/components/layout/SectorFilter';
import RecommendationGrid from '@/components/stock/RecommendationGrid';
import RecommendationDetails from '@/components/stock/RecommendationDetails';
import Button from '@/components/ui/Button';
import type { StockRecommendation } from '@/types';

const AnalysisTab: React.FC = () => {
  const {
    filteredStocks,
    setSelectedStock,
    setSelectedTimeFrame,
    setSelectedSector,
    loadRecommendations,
    refreshRecommendations,
    setRecommendationViewMode,
  } = useStockStore();

  // Recommendation state
  const recommendations = useRecommendations();
  const recommendationLoading = useRecommendationLoading();
  const recommendationError = useRecommendationError();
  const selectedTimeFrame = useSelectedTimeFrame();
  const selectedSector = useSelectedSector();
  const recommendationViewMode = useRecommendationViewMode();

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
      {/* Recommendation Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <TimeFrameTabs 
            activeTimeFrame={selectedTimeFrame}
            onTimeFrameChange={setSelectedTimeFrame}
          />
          
          <SectorFilter 
            activeSector={selectedSector}
            onSectorChange={setSelectedSector}
          />
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
            onClick={refreshRecommendations}
            variant="outline"
            size="sm"
            icon={<RefreshCw className={`w-4 h-4 ${recommendationLoading ? 'animate-spin' : ''}`} />}
            disabled={recommendationLoading}
          >
            Refresh
          </Button>
        </div>
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
        hideControls={true}
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