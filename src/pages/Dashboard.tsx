import React, { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { getAllStocks } from '@/data/mockStocks';
import { useStockStore } from '@/stores/stockStore';
import Button from '@/components/ui/Button';
import Card, { CardContent } from '@/components/ui/Card';
import { PageLoading } from '@/components/ui/LoadingSpinner';
import TradingInfo from '@/components/layout/TradingInfo';
import TabNavigation from '@/components/layout/TabNavigation';
import AnalysisTab from '@/components/tabs/AnalysisTab';
import SearchTab from '@/components/tabs/SearchTab';
import HoldingsTab from '@/components/tabs/HoldingsTab';

const Dashboard: React.FC = () => {
  const {
    loadingState,
    error,
    setStocks,
    setLoadingState,
    setError,
  } = useStockStore();

  const [activeTab, setActiveTab] = useState<'analysis' | 'search' | 'holdings'>('analysis');

  // Load initial data
  useEffect(() => {
    const loadStocks = async () => {
      try {
        setLoadingState('loading');
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        const stocks = getAllStocks();
        setStocks(stocks);
        setLoadingState('success');
      } catch (err) {
        console.error('Failed to load stocks:', err);
        setError('Failed to load stocks. Please try again.');
        setLoadingState('error');
      }
    };

    loadStocks();
  }, [setStocks, setLoadingState, setError]);


  if (loadingState === 'loading') {
    return <PageLoading text="Loading your dashboard..." />;
  }

  if (loadingState === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <CardContent>
            <div className="text-red-500 mb-4">
              <BarChart3 className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Unable to Load Data
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="primary"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                StockSense India
              </h1>
              <p className="text-lg text-gray-600">
                AI-powered stock recommendations and market analysis
              </p>
            </div>
            <div className="hidden lg:block">
              <TradingInfo compact />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Trading Info */}
      <div className="lg:hidden">
        <TradingInfo />
      </div>

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <AnalysisTab />
            </motion.div>
          )}
          
          {activeTab === 'search' && (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <SearchTab />
            </motion.div>
          )}
          
          {activeTab === 'holdings' && (
            <motion.div
              key="holdings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <HoldingsTab />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;