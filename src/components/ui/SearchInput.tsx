import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import type { BaseComponentProps, Stock } from '@/types';

interface SearchInputProps extends BaseComponentProps {
  value?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  suggestions?: Stock[];
  onSuggestionSelect?: (stock: Stock) => void;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showSuggestions?: boolean;
  maxSuggestions?: number;
}

const SearchInput: React.FC<SearchInputProps> = ({
  className = '',
  value = '',
  onChange,
  onClear,
  placeholder = 'Search stocks...',
  suggestions = [],
  onSuggestionSelect,
  loading = false,
  disabled = false,
  size = 'md',
  showSuggestions = true,
  maxSuggestions = 5,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-5 py-3 text-lg',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Filter suggestions based on search value
  const filteredSuggestions = suggestions
    .filter(stock => {
      if (!value.trim()) return false;
      const query = value.toLowerCase();
      return (
        stock.name.toLowerCase().includes(query) ||
        stock.symbol.toLowerCase().includes(query) ||
        stock.sector.toLowerCase().includes(query)
      );
    })
    .slice(0, maxSuggestions);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange?.(newValue);
    setShowDropdown(showSuggestions && newValue.length > 0);
  };

  // Handle suggestion click
  const handleSuggestionClick = (stock: Stock) => {
    onSuggestionSelect?.(stock);
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  // Handle clear button click
  const handleClear = () => {
    onChange?.('');
    onClear?.();
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  // Handle input focus
  const handleFocus = () => {
    setIsFocused(true);
    if (showSuggestions && value.length > 0 && filteredSuggestions.length > 0) {
      setShowDropdown(true);
    }
  };

  // Handle input blur
  const handleBlur = () => {
    setIsFocused(false);
    // Delay hiding dropdown to allow for suggestion clicks
    setTimeout(() => setShowDropdown(false), 200);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const inputClasses = [
    'w-full border border-gray-300 rounded-lg transition-all duration-200',
    'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'pl-10 pr-10', // Space for icons
    sizeClasses[size],
    isFocused ? 'ring-2 ring-primary-500 border-primary-500' : '',
    className
  ].filter(Boolean).join(' ');

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change: number, changePercent: number): string => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  return (
    <div className="relative" {...props}>
      {/* Input field */}
      <div className="relative">
        {/* Search icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className={`text-gray-400 ${iconSizeClasses[size]}`} />
        </div>
        
        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
        />
        
        {/* Clear button or loading spinner */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {loading ? (
            <div className="animate-spin">
              <Search className={`text-gray-400 ${iconSizeClasses[size]}`} />
            </div>
          ) : value ? (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <X className={iconSizeClasses[size]} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showDropdown && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {filteredSuggestions.map((stock) => (
            <button
              key={stock.id}
              onClick={() => handleSuggestionClick(stock)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {stock.symbol}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {stock.name}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatPrice(stock.price)}
                  </p>
                  <p className={`text-xs ${
                    stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatChange(stock.change, stock.changePercent)}
                  </p>
                </div>
              </div>
            </button>
          ))}
          
          {/* Show more results indicator */}
          {suggestions.length > maxSuggestions && (
            <div className="px-4 py-2 text-xs text-gray-500 text-center border-t border-gray-100">
              {suggestions.length - maxSuggestions} more results available
            </div>
          )}
        </div>
      )}

      {/* No results message */}
      {showDropdown && value.trim() && filteredSuggestions.length === 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          <div className="px-4 py-3 text-center text-gray-500">
            No stocks found for "{value}"
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInput;