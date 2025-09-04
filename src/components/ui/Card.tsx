import React from "react";
import { motion } from "framer-motion";
import type { BaseComponentProps } from "@/types";

interface CardProps extends BaseComponentProps {
  variant?: "default" | "elevated" | "outlined" | "filled";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = "",
  variant = "default",
  padding = "md",
  hover = false,
  clickable = false,
  onClick,
  ...props
}) => {
  const baseClasses =
    "bg-white rounded-xl transition-all duration-300 relative overflow-hidden";

  const variantClasses = {
    default: "border border-gray-100 shadow-sm hover:shadow-md",
    elevated: "shadow-lg hover:shadow-xl border border-gray-50",
    outlined: "border-2 border-gray-300 hover:border-gray-400",
    filled:
      "bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 hover:from-gray-100 hover:to-gray-200",
  };

  const paddingClasses = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
    xl: "p-8",
  };

  const interactiveClasses = clickable || onClick ? "cursor-pointer group" : "";

  const hoverClasses =
    hover || clickable || onClick ? "hover:shadow-xl hover:-translate-y-2" : "";

  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    interactiveClasses,
    hoverClasses,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const Component = onClick ? motion.div : "div";
  const motionProps = onClick
    ? {
        whileHover: { y: -4, scale: 1.01 },
        whileTap: { scale: 0.98 },
        onClick,
        transition: { type: "spring", stiffness: 300, damping: 30 },
      }
    : {};

  return (
    <Component className={combinedClasses} {...motionProps} {...props}>
      {children}
      {/* Subtle shine effect on hover for interactive cards */}
      {(clickable || onClick) && (
        <div
          className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        />
      )}
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
  className = "",
  title,
  subtitle,
  action,
  ...props
}) => {
  return (
    <div
      className={`flex items-start justify-between mb-6 ${className}`}
      {...props}
    >
      <div className="flex-1">
        {title && (
          <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-gray-600 font-medium leading-relaxed">
            {subtitle}
          </p>
        )}
        {children}
      </div>
      {action && <div className="flex-shrink-0 ml-4">{action}</div>}
    </div>
  );
};

interface CardContentProps extends BaseComponentProps {}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`text-gray-700 leading-relaxed ${className}`} {...props}>
      {children}
    </div>
  );
};

interface CardFooterProps extends BaseComponentProps {
  align?: "left" | "center" | "right" | "between";
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = "",
  align = "left",
  ...props
}) => {
  const alignClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  };

  return (
    <div
      className={`flex items-center mt-6 pt-4 border-t border-gray-200 ${alignClasses[align]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
