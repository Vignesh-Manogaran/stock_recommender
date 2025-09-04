import React from 'react';
import type { BaseComponentProps } from '@/types';

interface LoadingSpinnerProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  text?: string;
  center?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  className = '',
  size = 'md',
  color = 'primary',
  text,
  center = false,
  ...props
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };
  
  const colorClasses = {
    primary: 'text-primary-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-400',
  };
  
  const containerClasses = center 
    ? 'flex flex-col items-center justify-center min-h-[200px]' 
    : 'flex items-center';
  
  const spinnerClasses = [
    'animate-spin',
    sizeClasses[size],
    colorClasses[color],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} {...props}>
      <svg 
        className={spinnerClasses}
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
        />
        <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <span className={`ml-2 text-sm ${colorClasses[color]} ${center ? 'mt-2 ml-0' : ''}`}>
          {text}
        </span>
      )}
    </div>
  );
};

// Skeleton loader component for better UX
interface SkeletonProps extends BaseComponentProps {
  height?: string;
  width?: string;
  rounded?: boolean;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  height = '1rem',
  width = '100%',
  rounded = false,
  lines = 1,
  ...props
}) => {
  const baseClasses = 'bg-gray-200 animate-pulse';
  const roundedClass = rounded ? 'rounded-full' : 'rounded';
  
  const skeletonClasses = [
    baseClasses,
    roundedClass,
    className
  ].filter(Boolean).join(' ');

  if (lines === 1) {
    return (
      <div 
        className={skeletonClasses}
        style={{ height, width }}
        {...props}
      />
    );
  }

  return (
    <div className="space-y-2" {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={skeletonClasses}
          style={{ 
            height, 
            width: index === lines - 1 ? '75%' : width 
          }}
        />
      ))}
    </div>
  );
};

// Page loading component
interface PageLoadingProps {
  text?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  text = 'Loading...'
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <LoadingSpinner size="xl" />
      <p className="mt-4 text-lg text-gray-600 font-medium">
        {text}
      </p>
    </div>
  );
};

// Card loading skeleton
export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton width="60%" height="1.5rem" />
        <Skeleton width="20%" height="1rem" rounded />
      </div>
      <div className="space-y-3">
        <Skeleton lines={2} />
        <div className="flex justify-between items-center">
          <Skeleton width="30%" />
          <Skeleton width="25%" />
        </div>
      </div>
    </div>
  );
};

// Table loading skeleton
export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex space-x-4">
          {Array.from({ length: cols }).map((_, index) => (
            <Skeleton key={`header-${index}`} width="20%" height="1rem" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="px-6 py-4 border-b border-gray-100 last:border-b-0">
          <div className="flex space-x-4">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <Skeleton key={`cell-${rowIndex}-${colIndex}`} width="20%" height="1rem" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;