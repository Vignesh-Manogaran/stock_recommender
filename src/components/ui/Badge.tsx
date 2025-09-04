import React from 'react';
import type { BaseComponentProps, HealthStatus, SignalType } from '@/types';

interface BadgeProps extends BaseComponentProps {
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  health?: HealthStatus;
  signal?: SignalType;
  dot?: boolean;
  outline?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  health,
  signal,
  dot = false,
  outline = false,
  ...props
}) => {
  // Determine variant based on health or signal if provided
  let computedVariant = variant;
  
  if (health) {
    switch (health) {
      case 'BEST':
        computedVariant = 'success';
        break;
      case 'GOOD':
        computedVariant = 'info';
        break;
      case 'NORMAL':
        computedVariant = 'warning';
        break;
      case 'BAD':
        computedVariant = 'danger';
        break;
      case 'WORSE':
        computedVariant = 'danger';
        break;
    }
  }
  
  if (signal) {
    switch (signal) {
      case 'BUY':
        computedVariant = 'success';
        break;
      case 'SELL':
        computedVariant = 'danger';
        break;
      case 'HOLD':
        computedVariant = 'warning';
        break;
    }
  }

  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-all duration-200';
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };
  
  const solidVariantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };
  
  const outlineVariantClasses = {
    default: 'border border-gray-300 text-gray-700 bg-white',
    primary: 'border border-primary-300 text-primary-700 bg-white',
    secondary: 'border border-gray-300 text-gray-700 bg-white',
    success: 'border border-green-300 text-green-700 bg-white',
    warning: 'border border-yellow-300 text-yellow-700 bg-white',
    danger: 'border border-red-300 text-red-700 bg-white',
    info: 'border border-blue-300 text-blue-700 bg-white',
  };
  
  const variantClasses = outline 
    ? outlineVariantClasses[computedVariant]
    : solidVariantClasses[computedVariant];
  
  const combinedClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses,
    className
  ].filter(Boolean).join(' ');

  const dotElement = dot && (
    <span 
      className={`w-2 h-2 rounded-full mr-1.5 ${
        computedVariant === 'success' ? 'bg-green-400' :
        computedVariant === 'danger' ? 'bg-red-400' :
        computedVariant === 'warning' ? 'bg-yellow-400' :
        computedVariant === 'info' ? 'bg-blue-400' :
        computedVariant === 'primary' ? 'bg-primary-400' :
        'bg-gray-400'
      }`}
    />
  );

  // Display text based on health or signal
  const displayText = health || signal || children;

  return (
    <span className={combinedClasses} {...props}>
      {dotElement}
      {displayText}
    </span>
  );
};

// Specialized health badge component
interface HealthBadgeProps extends Omit<BadgeProps, 'health'> {
  health: HealthStatus;
  showText?: boolean;
}

export const HealthBadge: React.FC<HealthBadgeProps> = ({
  health,
  showText = true,
  ...props
}) => {
  const healthTexts = {
    BEST: 'Best',
    GOOD: 'Good',
    NORMAL: 'Normal',
    BAD: 'Bad',
    WORSE: 'Worse',
  };

  return (
    <Badge health={health} dot={!showText} {...props}>
      {showText ? healthTexts[health] : ''}
    </Badge>
  );
};

// Specialized signal badge component
interface SignalBadgeProps extends Omit<BadgeProps, 'signal'> {
  signal: SignalType;
  showIcon?: boolean;
}

export const SignalBadge: React.FC<SignalBadgeProps> = ({
  signal,
  showIcon = false,
  ...props
}) => {
  const signalIcons = {
    BUY: '↗',
    SELL: '↘',
    HOLD: '→',
  };

  const signalTexts = {
    BUY: 'Buy',
    SELL: 'Sell',
    HOLD: 'Hold',
  };

  return (
    <Badge signal={signal} {...props}>
      {showIcon && (
        <span className="mr-1">{signalIcons[signal]}</span>
      )}
      {signalTexts[signal]}
    </Badge>
  );
};

export default Badge;