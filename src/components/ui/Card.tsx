import React from 'react';
import { motion } from 'framer-motion';
import type { BaseComponentProps } from '@/types';

interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  hover = false,
  clickable = false,
  onClick,
  ...props
}) => {
  const baseClasses = 'bg-white rounded-xl transition-all duration-200';
  
  const variantClasses = {
    default: 'border border-gray-200 shadow-sm',
    elevated: 'shadow-lg border border-gray-100',
    outlined: 'border-2 border-gray-300',
    filled: 'bg-gray-50 border border-gray-200',
  };
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };
  
  const interactiveClasses = clickable || onClick 
    ? 'cursor-pointer' 
    : '';
  
  const hoverClasses = hover || clickable || onClick
    ? 'hover:shadow-lg hover:-translate-y-1'
    : '';
  
  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    interactiveClasses,
    hoverClasses,
    className
  ].filter(Boolean).join(' ');

  const Component = onClick ? motion.div : 'div';
  const motionProps = onClick ? {
    whileHover: { y: -2 },
    whileTap: { scale: 0.98 },
    onClick,
  } : {};

  return (
    <Component
      className={combinedClasses}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  );
};

// Card sub-components
interface CardHeaderProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  ...props
}) => {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`} {...props}>
      <div>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-gray-600">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

interface CardContentProps extends BaseComponentProps {}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`text-gray-700 ${className}`} {...props}>
      {children}
    </div>
  );
};

interface CardFooterProps extends BaseComponentProps {
  align?: 'left' | 'center' | 'right' | 'between';
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
  align = 'left',
  ...props
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div 
      className={`flex items-center mt-4 pt-4 border-t border-gray-200 ${alignClasses[align]} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;