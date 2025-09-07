import React from "react";
import { DataSource, MetricWithSource } from "@/types";
import DataSourceBadge from "./DataSourceBadge";
import { XCircle, CheckCircle, AlertTriangle } from "lucide-react";
import Badge from "./Badge";


interface RealMetricsGridProps {
  metrics: Record<string, MetricWithSource>;
  title?: string;
  onMetricClick?: (key: string, value: string) => void;
}

const RealMetricsGrid: React.FC<RealMetricsGridProps> = ({
  metrics,
  title,
  onMetricClick,
}) => {

  const getDataSourceBadge = (metric: MetricWithSource) => {
    if (metric.isNA) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1 bg-red-100 text-red-800 text-xs">
          <XCircle className="w-3 h-3" />
          N/A
        </Badge>
      );
    }

    switch (metric.dataSource) {
      case DataSource.RAPID_API_YAHOO:
        return (
          <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 text-xs">
            <CheckCircle className="w-3 h-3" />
            Real API
          </Badge>
        );
      case DataSource.YAHOO_FINANCE_API:
        return (
          <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 text-xs">
            <CheckCircle className="w-3 h-3" />
            Real API
          </Badge>
        );
      case DataSource.CALCULATED:
        return (
          <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs">
            <AlertTriangle className="w-3 h-3" />
            Calc
          </Badge>
        );
      case DataSource.ESTIMATED:
        return (
          <Badge variant="secondary" className="flex items-center gap-1 bg-orange-100 text-orange-800 text-xs">
            <AlertTriangle className="w-3 h-3" />
            Est
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="flex items-center gap-1 bg-gray-100 text-gray-800 text-xs">
            <XCircle className="w-3 h-3" />
            Mock
          </Badge>
        );
    }
  };

  const formatValue = (metric: MetricWithSource, key: string): string => {
    if (metric.isNA) {
      return 'N/A';
    }

    const value = metric.value;
    
    if (!value && value !== 0) return 'N/A';
    
    // Format currency values
    if (key.includes('Price') || key.includes('Value') || key.includes('Cap')) {
      if (value > 10000000000) {
        return `₹${((value || 0) / 10000000000).toFixed(1)}B`;
      } else if (value > 10000000) {
        return `₹${((value || 0) / 10000000).toFixed(0)}Cr`;
      } else if (value > 100000) {
        return `₹${((value || 0) / 100000).toFixed(1)}L`;
      } else {
        return `₹${(value || 0).toLocaleString("en-IN")}`;
      }
    }
    
    // Format percentage values
    if (key.includes('Margin') || key.includes('ROE') || key.includes('ROA') || key.includes('ROCE') || key.includes('Growth') || key.includes('Yield')) {
      return `${(value || 0).toFixed(1)}%`;
    }
    
    // Format ratio values
    if (key.includes('Ratio') || key.includes('Coverage')) {
      return (value || 0).toFixed(2);
    }
    
    // Default formatting
    return (value || 0).toFixed(1);
  };

  // If no metrics available, show message
  if (Object.keys(metrics).length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <XCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No {title?.toLowerCase() || 'financial'} metrics available</p>
        <p className="text-sm">Data not provided by Yahoo Finance API</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && <h3 className="font-semibold text-lg text-gray-900">{title}</h3>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(metrics).map(([key, metric]) => (
          <div 
            key={key} 
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-all duration-200"
            onClick={() => onMetricClick && onMetricClick(key, formatValue(metric, key))}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-sm font-medium text-gray-700">{key}</h4>
              {getDataSourceBadge(metric)}
            </div>
            
            <div className={`text-2xl font-bold ${metric.isNA ? 'text-red-600' : 'text-gray-900'} mb-1`}>
              {formatValue(metric, key)}
            </div>
            
            {!metric.isNA && (
              <div className="text-xs text-gray-500">
                Last updated: {metric.lastUpdated?.toLocaleDateString()}
              </div>
            )}
            
            {metric.isNA && (
              <div className="text-xs text-red-600">
                Not available from Yahoo Finance API
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RealMetricsGrid;