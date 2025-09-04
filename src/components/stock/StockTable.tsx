import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Heart, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HealthBadge, SignalBadge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { TableSkeleton } from '@/components/ui/LoadingSpinner';
import type { Stock, SortOption, TableColumn } from '@/types';

interface StockTableProps {
  stocks: Stock[];
  loading?: boolean;
  onSort?: (sortOption: SortOption) => void;
  sortOption?: SortOption;
  onStockSelect?: (stock: Stock) => void;
  onFavoriteToggle?: (stockId: string) => void;
  favoriteStocks?: string[];
  className?: string;
  showPagination?: boolean;
  pageSize?: number;
}

const StockTable: React.FC<StockTableProps> = ({
  stocks,
  loading = false,
  onSort,
  sortOption,
  onStockSelect,
  onFavoriteToggle,
  favoriteStocks = [],
  className = '',
  showPagination = false,
  pageSize = 20,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
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
    }
    return `₹${(num / 1e5).toFixed(2)}L`;
  };

  const formatVolume = (volume: number): string => {
    if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
      return `${(volume / 1e3).toFixed(2)}K`;
    }
    return volume.toLocaleString();
  };

  const formatPercentage = (value: number | null): string => {
    if (value === null) return 'N/A';
    return `${value.toFixed(2)}%`;
  };

  const formatRatio = (value: number | null): string => {
    if (value === null) return 'N/A';
    return value.toFixed(2);
  };

  const columns: TableColumn<Stock>[] = [
    {
      key: 'symbol',
      title: 'Symbol',
      sortable: true,
      width: '200px',
      render: (value, stock) => (
        <div className="flex items-center space-x-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle?.(stock.id);
            }}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Heart 
              className={`w-4 h-4 ${
                favoriteStocks.includes(stock.id)
                  ? 'text-red-500 fill-current' 
                  : 'text-gray-400 hover:text-red-500'
              }`}
            />
          </button>
          <div>
            <p className="font-semibold text-gray-900">{stock.symbol}</p>
            <p className="text-sm text-gray-600 truncate max-w-[150px]" title={stock.name}>
              {stock.name}
            </p>
            <p className="text-xs text-gray-500">{stock.sector}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'price',
      title: 'Price',
      sortable: true,
      width: '150px',
      render: (value, stock) => (
        <div>
          <p className="font-semibold text-gray-900">{formatPrice(stock.price)}</p>
          <div className="flex items-center space-x-1 mt-1">
            {stock.change >= 0 ? (
              <TrendingUp className="w-3 h-3 text-green-600" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-600" />
            )}
            <span className={`text-sm ${
              stock.change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} 
              ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'marketCap',
      title: 'Market Cap',
      sortable: true,
      width: '120px',
      render: (value) => (
        <span className="font-medium text-gray-900">
          {formatLargeNumber(value)}
        </span>
      ),
    },
    {
      key: 'volume',
      title: 'Volume',
      sortable: true,
      width: '100px',
      render: (value) => (
        <span className="font-medium text-gray-900">
          {formatVolume(value)}
        </span>
      ),
    },
    {
      key: 'pe',
      title: 'P/E',
      sortable: true,
      width: '80px',
      render: (value) => (
        <span className="font-medium text-gray-900">
          {formatRatio(value)}
        </span>
      ),
    },
    {
      key: 'pb',
      title: 'P/B',
      sortable: true,
      width: '80px',
      render: (value) => (
        <span className="font-medium text-gray-900">
          {formatRatio(value)}
        </span>
      ),
    },
    {
      key: 'roe',
      title: 'ROE',
      sortable: true,
      width: '80px',
      render: (value) => (
        <span className="font-medium text-gray-900">
          {formatPercentage(value)}
        </span>
      ),
    },
    {
      key: 'roce',
      title: 'ROCE',
      sortable: true,
      width: '80px',
      render: (value) => (
        <span className="font-medium text-gray-900">
          {formatPercentage(value)}
        </span>
      ),
    },
    {
      key: 'health',
      title: 'Health',
      sortable: true,
      width: '100px',
      render: (value) => <HealthBadge health={value} size="sm" />,
    },
    {
      key: 'signal',
      title: 'Signal',
      sortable: true,
      width: '100px',
      render: (value) => <SignalBadge signal={value} size="sm" />,
    },
  ];

  const handleSort = (field: keyof Stock) => {
    if (!onSort) return;
    
    const direction = sortOption?.field === field && sortOption?.direction === 'asc' ? 'desc' : 'asc';
    onSort({ field, direction });
  };

  const getSortIcon = (field: keyof Stock) => {
    if (sortOption?.field !== field) return null;
    return sortOption.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(stocks.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedStocks = showPagination ? stocks.slice(startIndex, endIndex) : stocks;

  if (loading) {
    return <TableSkeleton rows={10} cols={columns.length} />;
  }

  if (stocks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500 text-lg mb-2">No stocks found</p>
        <p className="text-gray-400">Try adjusting your search criteria or filters</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Header */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key as string}
                  style={{ width: column.width }}
                  className={`px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-200">
            <AnimatePresence>
              {paginatedStocks.map((stock, index) => (
                <motion.tr
                  key={stock.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onStockSelect?.(stock)}
                >
                  {columns.map((column) => (
                    <td key={column.key as string} className="px-6 py-4 whitespace-nowrap">
                      {column.render
                        ? column.render(stock[column.key], stock)
                        : stock[column.key]
                      }
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<ExternalLink className="w-4 h-4" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onStockSelect?.(stock);
                      }}
                    >
                      View
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, stocks.length)} of {stocks.length} results
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  );
                })}
                {totalPages > 5 && <span className="text-gray-500">...</span>}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockTable;