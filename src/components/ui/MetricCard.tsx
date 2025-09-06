import React from "react";
import { MetricWithSource, HealthStatus } from "@/types";
import { getDataSourceConfig, isRealData } from "@/utils/dataSourceUtils";
import DataSourceBadge from "./DataSourceBadge";

interface MetricCardProps {
  title: string;
  metric: MetricWithSource;
  onClick?: () => void;
  formatter?: (value: number) => string;
  suffix?: string;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  metric,
  onClick,
  formatter,
  suffix = "",
  className = "",
}) => {
  const config = getDataSourceConfig(metric.dataSource);
  const isReal = isRealData(metric.dataSource);

  // Format the value
  const formatValue = (value: number) => {
    if (formatter) return formatter(value);
    return value.toFixed(1) + suffix;
  };

  // Get health color
  const getHealthColor = (health: HealthStatus) => {
    switch (health) {
      case HealthStatus.BEST:
        return "text-green-700 bg-green-100";
      case HealthStatus.GOOD:
        return "text-green-600 bg-green-50";
      case HealthStatus.NORMAL:
        return "text-gray-600 bg-gray-100";
      case HealthStatus.BAD:
        return "text-red-600 bg-red-50";
      case HealthStatus.WORSE:
        return "text-red-700 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div
      className={`rounded-lg p-4 border cursor-pointer hover:shadow-md transition-all duration-200 ${config.bgColor} ${config.borderColor} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900">{title}</h4>
        <div className="flex items-center space-x-2">
          <DataSourceBadge dataSource={metric.dataSource} />
          {!isReal && (
            <div className="w-2 h-2 bg-red-500 rounded-full" title="Mock/Estimated Data" />
          )}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className={`text-xl font-bold ${config.textColor}`}>
          {formatValue(metric.value)}
        </span>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${getHealthColor(metric.health)}`}
        >
          {metric.health}
        </span>
      </div>
      {metric.lastUpdated && (
        <p className="text-xs text-gray-500 mt-1">
          Updated: {new Date(metric.lastUpdated).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

export default MetricCard;