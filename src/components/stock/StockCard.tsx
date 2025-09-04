import React from 'react';
import { Heart, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Card, { CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { HealthBadge, SignalBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import type { Stock } from '@/types';

interface StockCardProps {
  stock: Stock;
  onSelect?: (stock: Stock) => void;
  onFavoriteToggle?: (stockId: string) => void;
  isFavorite?: boolean;
  showFullDetails?: boolean;
  className?: string;
}

const StockCard: React.FC<StockCardProps> = ({
  stock,
  onSelect,
  onFavoriteToggle,
  isFavorite = false,
  showFullDetails = false,
  className = '',
}) => {
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatLargeNumber = (num: number): string => {
    if (num >= 1e12) {
      return `₹${(num / 1e12).toFixed(2)}T`;
    } else if (num >= 1e9) {
      return `₹${(num / 1e9).toFixed(2)}B`;
    } else if (num >= 1e7) {
      return `₹${(num / 1e7).toFixed(2)}Cr`;
    } else if (num >= 1e5) {
      return `₹${(num / 1e5).toFixed(2)}L`;
    }
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
      return `${(volume / 1e3).toFixed(2)}K`;
    }
    return volume.toLocaleString();
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle?.(stock.id);
  };

  const handleCardClick = () => {
    onSelect?.(stock);
  };

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${className}`}
      hover
      clickable
      onClick={handleCardClick}
    >
      {/* Favorite Button */}
      <button
        onClick={handleFavoriteClick}
        className="absolute top-4 right-4 z-10 p-1.5 rounded-full transition-colors hover:bg-gray-100"
      >
        <Heart 
          className={`w-5 h-5 transition-colors ${
            isFavorite 
              ? 'text-red-500 fill-current' 
              : 'text-gray-400 hover:text-red-500'
          }`}
        />
      </button>

      <CardHeader>
        <div className="pr-8"> {/* Space for favorite button */}
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {stock.symbol}
            </h3>
            <div className="flex space-x-2">
              <HealthBadge health={stock.health} size="sm" />
              <SignalBadge signal={stock.signal} size="sm" />
            </div>
          </div>
          <p className="text-sm text-gray-600 truncate mb-1">
            {stock.name}
          </p>
          <p className="text-xs text-gray-500">
            {stock.sector} • {stock.industry}
          </p>
        </div>
      </CardHeader>

      <CardContent>
        {/* Price Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(stock.price)}
              </p>
              <div className="flex items-center space-x-1 mt-1">
                {stock.change >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm font-medium ${
                  stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} 
                  ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Market Cap</p>
            <p className="font-semibold text-gray-900">
              {formatLargeNumber(stock.marketCap)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Volume</p>
            <p className="font-semibold text-gray-900">
              {formatVolume(stock.volume)}
            </p>
          </div>
          {stock.pe && (
            <div>
              <p className="text-gray-500">P/E Ratio</p>
              <p className="font-semibold text-gray-900">
                {stock.pe.toFixed(2)}
              </p>
            </div>
          )}
          {stock.roe && (
            <div>
              <p className="text-gray-500">ROE</p>
              <p className="font-semibold text-gray-900">
                {stock.roe.toFixed(2)}%
              </p>
            </div>
          )}
        </div>

        {/* Additional Details for Full View */}
        {showFullDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {stock.pb && (
                <div>
                  <p className="text-gray-500">P/B Ratio</p>
                  <p className="font-semibold text-gray-900">
                    {stock.pb.toFixed(2)}
                  </p>
                </div>
              )}
              {stock.roce && (
                <div>
                  <p className="text-gray-500">ROCE</p>
                  <p className="font-semibold text-gray-900">
                    {stock.roce.toFixed(2)}%
                  </p>
                </div>
              )}
              {stock.dividendYield && (
                <div>
                  <p className="text-gray-500">Dividend Yield</p>
                  <p className="font-semibold text-gray-900">
                    {stock.dividendYield.toFixed(2)}%
                  </p>
                </div>
              )}
              {stock.beta && (
                <div>
                  <p className="text-gray-500">Beta</p>
                  <p className="font-semibold text-gray-900">
                    {stock.beta.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer with Action Button */}
      <CardFooter align="between">
        <div className="text-xs text-gray-500">
          Updated {new Date(stock.lastUpdated).toLocaleString()}
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={<ArrowRight className="w-4 h-4" />}
          iconPosition="right"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

// Compact version of stock card for lists
export const StockCardCompact: React.FC<StockCardProps> = ({
  stock,
  onSelect,
  onFavoriteToggle,
  isFavorite = false,
  className = '',
}) => {
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFavoriteToggle?.(stock.id);
  };

  return (
    <motion.div
      className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${className}`}
      onClick={() => onSelect?.(stock)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {stock.symbol}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {stock.name}
              </p>
            </div>
            <div className="flex space-x-1">
              <HealthBadge health={stock.health} size="sm" showText={false} dot />
              <SignalBadge signal={stock.signal} size="sm" />
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              {formatPrice(stock.price)}
            </p>
            <p className={`text-xs ${
              stock.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
            </p>
          </div>
          
          <button
            onClick={handleFavoriteClick}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Heart 
              className={`w-4 h-4 ${
                isFavorite 
                  ? 'text-red-500 fill-current' 
                  : 'text-gray-400 hover:text-red-500'
              }`}
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default StockCard;