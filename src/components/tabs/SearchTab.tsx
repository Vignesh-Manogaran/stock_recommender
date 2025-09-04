import React, { useState } from 'react';
import { Search, TrendingUp, Filter, Star, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStockStore } from '@/stores/stockStore';
import SearchInput from '@/components/ui/SearchInput';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardContent } from '@/components/ui/Card';
import { HealthBadge, SignalBadge } from '@/components/ui/Badge';
import type { Stock } from '@/types';

const SearchTab: React.FC = () => {
  const {
    stocks,
    filteredStocks,
    searchQuery,
    userPreferences,
    setSearchQuery,
    toggleFavorite,
    setSelectedStock,
  } = useStockStore();

  const [recentSearches] = useState<string[]>([
    'RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK'
  ]);

  const [popularSearches] = useState<string[]>([
    'ADANIENT', 'BAJFINANCE', 'MARUTI', 'SUNPHARMA', 'TATAMOTORS'
  ]);


  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock);
    console.log('Selected stock:', stock);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const QuickSearchButton: React.FC<{ query: string }> = ({ query }) => (
    <button
      onClick={() => setSearchQuery(query)}
      className="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
    >
      {query}
    </button>
  );

  const StockSearchResult: React.FC<{ stock: Stock }> = ({ stock }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors cursor-pointer"
      onClick={() => handleStockSelect(stock)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="font-semibold text-gray-900">{stock.symbol}</h3>
            <HealthBadge health={stock.health} size="sm" />
            <SignalBadge signal={stock.signal} size="sm" />
          </div>
          <p className="text-sm text-gray-600 mb-1">{stock.name}</p>
          <p className="text-xs text-gray-500">{stock.sector}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900">{formatPrice(stock.price)}</p>
          <p className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(stock.id);
          }}
          className="ml-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Star 
            className={`w-4 h-4 ${
              userPreferences.favorites.includes(stock.id)
                ? 'text-yellow-500 fill-current' 
                : 'text-gray-400'
            }`}
          />
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Stock Search</h2>
        <p className="text-gray-600">
          Search from {stocks.length}+ Indian stocks across all sectors
        </p>
      </div>

      {/* Enhanced Search Bar */}
      <div className="max-w-2xl mx-auto">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          suggestions={stocks}
          onSuggestionSelect={handleStockSelect}
          placeholder="Search by company name, symbol, or sector..."
          size="lg"
          maxSuggestions={8}
        />
      </div>

      {/* Search Results */}
      {searchQuery && filteredStocks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results ({filteredStocks.length})
            </h3>
            <Button variant="outline" size="sm" icon={<Filter className="w-4 h-4" />}>
              Filter
            </Button>
          </div>
          <div className="grid gap-4 max-h-96 overflow-y-auto">
            {filteredStocks.slice(0, 10).map(stock => (
              <StockSearchResult key={stock.id} stock={stock} />
            ))}
          </div>
          {filteredStocks.length > 10 && (
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Showing 10 of {filteredStocks.length} results
              </p>
            </div>
          )}
        </div>
      )}

      {/* No Search Results */}
      {searchQuery && filteredStocks.length === 0 && (
        <div className="text-center py-8">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No stocks found
          </h3>
          <p className="text-gray-600">
            No results for "{searchQuery}". Try a different search term.
          </p>
        </div>
      )}

      {/* Default Content (when no search) */}
      {!searchQuery && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Quick Search */}
          <Card>
            <CardHeader title="Quick Search" />
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Recent Searches
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map(query => (
                      <QuickSearchButton key={query} query={query} />
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Popular Searches
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map(query => (
                      <QuickSearchButton key={query} query={query} />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
};

export default SearchTab;