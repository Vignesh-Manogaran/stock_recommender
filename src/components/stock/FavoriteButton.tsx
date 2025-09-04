import React from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import type { BaseComponentProps } from '@/types';

interface FavoriteButtonProps extends BaseComponentProps {
  isFavorite?: boolean;
  onToggle?: () => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  showTooltip?: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  className = '',
  isFavorite = false,
  onToggle,
  size = 'md',
  disabled = false,
  showTooltip = true,
  ...props
}) => {
  const sizeClasses = {
    sm: 'p-1',
    md: 'p-1.5',
    lg: 'p-2',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const buttonClasses = [
    'inline-flex items-center justify-center rounded-full transition-all duration-200',
    'hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    sizeClasses[size],
    className
  ].filter(Boolean).join(' ');

  const iconClasses = [
    'transition-all duration-200',
    iconSizeClasses[size],
    isFavorite 
      ? 'text-red-500 fill-current' 
      : 'text-gray-400 hover:text-red-500'
  ].filter(Boolean).join(' ');

  const tooltipText = isFavorite ? 'Remove from favorites' : 'Add to favorites';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onToggle?.();
    }
  };

  return (
    <div className="relative group">
      <motion.button
        className={buttonClasses}
        onClick={handleClick}
        disabled={disabled}
        whileHover={{ scale: disabled ? 1 : 1.1 }}
        whileTap={{ scale: disabled ? 1 : 0.9 }}
        {...props}
      >
        <motion.div
          animate={isFavorite ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Heart className={iconClasses} />
        </motion.div>
      </motion.button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {tooltipText}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

export default FavoriteButton;