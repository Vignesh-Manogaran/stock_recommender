import React from 'react';
import { PieChart, TrendingUp, TrendingDown, Plus, Briefcase, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStockStore } from '@/stores/stockStore';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import { HealthBadge, SignalBadge } from '@/components/ui/Badge';
import type { Stock } from '@/types';

const HoldingsTab: React.FC = () => {
  const {
    stocks,
    userPreferences,
    toggleFavorite,
    setSelectedStock,
  } = useStockStore();

  // Get favorite stocks (simulate holdings)
  const favoriteStocks = stocks.filter(stock => 
    userPreferences.favorites.includes(stock.id)
  );

  // Calculate portfolio metrics
  const totalValue = favoriteStocks.reduce((sum, stock) => sum + (stock.price * 10), 0); // Assume 10 shares each
  const totalChange = favoriteStocks.reduce((sum, stock) => sum + (stock.change * 10), 0);
  const totalChangePercent = totalValue > 0 ? (totalChange / (totalValue - totalChange)) * 100 : 0;

  const gainers = favoriteStocks.filter(stock => stock.change > 0);
  const losers = favoriteStocks.filter(stock => stock.change < 0);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatLargeNumber = (num: number): string => {
    if (num >= 1e7) {
      return `₹${(num / 1e7).toFixed(2)}Cr`;
    } else if (num >= 1e5) {
      return `₹${(num / 1e5).toFixed(2)}L`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const HoldingRow: React.FC<{ stock: Stock }> = ({ stock }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors cursor-pointer"
      onClick={() => setSelectedStock(stock)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="font-semibold text-gray-900">{stock.symbol}</h3>
            <HealthBadge health={stock.health} size="sm" />
            <SignalBadge signal={stock.signal} size="sm" />
          </div>
          <p className="text-sm text-gray-600 mb-1">{stock.name}</p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Qty: 10</span>
            <span>Avg: {formatPrice(stock.price * 0.95)}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900">{formatPrice(stock.price)}</p>
          <p className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stock.change >= 0 ? '+' : ''}{formatPrice(stock.change * 10)}
          </p>
          <p className={`text-xs ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(stock.id);
          }}
          className="ml-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
        </button>
      </div>
    </motion.div>
  );

  if (favoriteStocks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Briefcase className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Holdings Yet</h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Start building your portfolio by adding stocks to your favorites. 
          Track their performance and get AI-powered insights.
        </p>
        <Button
          variant="primary"
          size="lg"
          icon={<Plus className="w-5 h-5" />}
        >
          Explore Stocks
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="md:col-span-2">
          <CardContent>
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Portfolio Value</h3>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {formatLargeNumber(totalValue)}
              </p>
              <div className="flex items-center justify-center space-x-1">
                {totalChange >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`font-medium ${
                  totalChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {totalChange >= 0 ? '+' : ''}{formatPrice(totalChange)}
                </span>
                <span className={`text-sm ${
                  totalChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ({totalChangePercent >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-600 mb-1">Holdings</h4>
              <p className="text-2xl font-bold text-gray-900">{favoriteStocks.length}</p>
              <p className="text-xs text-gray-500">stocks</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="text-center">
              <h4 className="text-sm font-medium text-gray-600 mb-1">Performance</h4>
              <div className="flex justify-center space-x-4">
                <div className="text-center">
                  <p className="text-lg font-semibold text-green-600">{gainers.length}</p>
                  <p className="text-xs text-gray-500">Gainers</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-red-600">{losers.length}</p>
                  <p className="text-xs text-gray-500">Losers</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holdings List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Holdings</h3>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" icon={<PieChart className="w-4 h-4" />}>
              Analytics
            </Button>
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />}>
              Add Stock
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {favoriteStocks.map(stock => (
            <HoldingRow key={stock.id} stock={stock} />
          ))}
        </div>
      </div>

      {/* Performance Summary */}
      {gainers.length > 0 || losers.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {gainers.length > 0 && (
            <Card>
              <CardHeader 
                title="Top Performers" 
                action={
                  <div className="text-green-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                }
              />
              <CardContent>
                <div className="space-y-3">
                  {gainers.slice(0, 5).map(stock => (
                    <div key={stock.id} className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{stock.symbol}</span>
                      <span className="text-sm font-medium text-green-600">
                        +{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {losers.length > 0 && (
            <Card>
              <CardHeader 
                title="Needs Attention" 
                action={
                  <div className="text-red-600">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                }
              />
              <CardContent>
                <div className="space-y-3">
                  {losers.slice(0, 5).map(stock => (
                    <div key={stock.id} className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{stock.symbol}</span>
                      <span className="text-sm font-medium text-red-600">
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default HoldingsTab;