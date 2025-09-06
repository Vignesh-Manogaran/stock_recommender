import React from "react";
import { DataSource } from "@/types";
import DataSourceBadge from "./DataSourceBadge";

interface RealMetric {
  key: string;
  label: string;
  value: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

interface RealMetricsGridProps {
  metrics: Record<string, number>;
  dataSource: DataSource;
  onMetricClick?: (key: string, value: string) => void;
}

const RealMetricsGrid: React.FC<RealMetricsGridProps> = ({
  metrics,
  dataSource,
  onMetricClick,
}) => {
  // Format currency values
  const formatCurrency = (value: number): string => {
    if (value > 10000000000) {
      return `₹${(value / 10000000000).toFixed(1)}B`;
    } else if (value > 10000000) {
      return `₹${(value / 10000000).toFixed(0)}Cr`;
    } else if (value > 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else {
      return `₹${value.toLocaleString("en-IN")}`;
    }
  };

  // Format percentage values
  const formatPercent = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  // Format ratio values
  const formatRatio = (value: number): string => {
    return value.toFixed(2);
  };

  // Convert metrics to display format
  const displayMetrics: RealMetric[] = [];

  // Add metrics based on availability
  if (metrics.currentPrice) {
    displayMetrics.push({
      key: "currentPrice",
      label: "Current Price (தற்போதைய விலை)",
      value: formatCurrency(metrics.currentPrice),
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      borderColor: "border-green-100",
    });
  }

  if (metrics.marketCap) {
    displayMetrics.push({
      key: "marketCap",
      label: "Market Cap (சந்தை மதிப்பு)",
      value: formatCurrency(metrics.marketCap),
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-100",
    });
  }

  if (metrics.peRatio) {
    displayMetrics.push({
      key: "peRatio",
      label: "P/E Ratio (விலை vs வருமானம்)",
      value: formatRatio(metrics.peRatio),
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      borderColor: "border-purple-100",
    });
  }

  if (metrics.pbRatio) {
    displayMetrics.push({
      key: "pbRatio",
      label: "P/B Ratio (விலை vs புத்தக மதிப்பு)",
      value: formatRatio(metrics.pbRatio),
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
      borderColor: "border-indigo-100",
    });
  }

  if (metrics.dividendYield) {
    displayMetrics.push({
      key: "dividendYield",
      label: "Dividend Yield (வருடாந்தர வருமானம்)",
      value: formatPercent(metrics.dividendYield),
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
      borderColor: "border-yellow-100",
    });
  }

  if (metrics.returnOnEquity) {
    displayMetrics.push({
      key: "returnOnEquity",
      label: "ROE (பங்குதாரர் வருமானம்)",
      value: formatPercent(metrics.returnOnEquity),
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      borderColor: "border-emerald-100",
    });
  }

  if (metrics.returnOnAssets) {
    displayMetrics.push({
      key: "returnOnAssets",
      label: "ROA (சொத்து வருமானம்)",
      value: formatPercent(metrics.returnOnAssets),
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      borderColor: "border-emerald-100",
    });
  }

  if (metrics.profitMargins) {
    displayMetrics.push({
      key: "profitMargins",
      label: "Net Profit Margin (நிகர லாப வீதம்)",
      value: formatPercent(metrics.profitMargins),
      bgColor: "bg-teal-50",
      textColor: "text-teal-600",
      borderColor: "border-teal-100",
    });
  }

  if (metrics.fiftyTwoWeekHigh && metrics.fiftyTwoWeekLow) {
    displayMetrics.push({
      key: "priceRange",
      label: "52W High/Low (52 வார உயர்ந்த/குறைந்த)",
      value: `${formatCurrency(metrics.fiftyTwoWeekHigh)} / ${formatCurrency(metrics.fiftyTwoWeekLow)}`,
      bgColor: "bg-gray-50",
      textColor: "text-gray-600",
      borderColor: "border-gray-100",
    });
  }

  if (metrics.bookValuePerShare) {
    displayMetrics.push({
      key: "bookValuePerShare",
      label: "Book Value (புத்தக மதிப்பு)",
      value: formatCurrency(metrics.bookValuePerShare),
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
      borderColor: "border-indigo-100",
    });
  }

  if (metrics.currentRatio) {
    displayMetrics.push({
      key: "currentRatio",
      label: "Current Ratio (தற்போதைய விகிதம்)",
      value: formatRatio(metrics.currentRatio),
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-600",
      borderColor: "border-cyan-100",
    });
  }

  if (metrics.volume) {
    displayMetrics.push({
      key: "volume",
      label: "Volume (வொல்யூம்)",
      value: metrics.volume.toLocaleString("en-IN"),
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
      borderColor: "border-orange-100",
    });
  }

  // If no real metrics available, show message
  if (displayMetrics.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No real API data available</p>
        <p className="text-sm text-gray-400 mt-2">Please try refreshing or check API connectivity</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {displayMetrics.map((metric) => (
        <div
          key={metric.key}
          className={`p-3 ${metric.bgColor} rounded-lg border ${metric.borderColor} cursor-pointer hover:shadow-md transition-all duration-200 relative`}
          onClick={() => onMetricClick && onMetricClick(metric.key, metric.value)}
        >
          <div className="flex items-center justify-between mb-1">
            <p className={`text-xs ${metric.textColor} font-medium`}>
              {metric.label}
            </p>
            <DataSourceBadge dataSource={dataSource} size="sm" />
          </div>
          <p className={`text-sm font-bold ${metric.textColor.replace('600', '900')}`}>
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default RealMetricsGrid;