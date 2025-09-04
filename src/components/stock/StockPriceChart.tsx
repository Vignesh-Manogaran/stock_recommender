import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";
import { PriceData } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface StockPriceChartProps {
  symbol: string;
  className?: string;
}

interface ChartDataPoint {
  date: string;
  price: number;
  volume: number;
  timestamp: number;
}

const StockPriceChart: React.FC<StockPriceChartProps> = ({
  symbol,
  className = "",
}) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<"1M" | "3M" | "6M" | "1Y" | "2Y">(
    "3M"
  );
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  // Generate mock price data for demonstration
  const generateMockData = (days: number): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    const basePrice = 1000 + Math.random() * 1000; // Random base price between 1000-2000
    let currentPrice = basePrice;

    const now = new Date();

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Add some realistic price movement
      const change = (Math.random() - 0.5) * 0.04; // ±2% daily change
      const trend = Math.sin(i / 10) * 0.01; // Add some trending pattern
      currentPrice = currentPrice * (1 + change + trend);

      // Ensure price doesn't go negative
      currentPrice = Math.max(currentPrice, basePrice * 0.5);

      data.push({
        date: date.toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
        }),
        price: Math.round(currentPrice * 100) / 100,
        volume: Math.floor(Math.random() * 1000000) + 100000,
        timestamp: date.getTime(),
      });
    }

    return data;
  };

  const getDaysForTimeRange = (range: string): number => {
    switch (range) {
      case "1M":
        return 30;
      case "3M":
        return 90;
      case "6M":
        return 180;
      case "1Y":
        return 365;
      case "2Y":
        return 730;
      default:
        return 90;
    }
  };

  const loadChartData = async () => {
    setLoading(true);

    try {
      // Check cache first
      const cacheKey = `chart_${symbol}_${timeRange}`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        // Check if data is less than 5 minutes old
        if (new Date().getTime() - parsed.timestamp < 300000) {
          setChartData(parsed.data);
          setCurrentPrice(parsed.data[parsed.data.length - 1]?.price || null);
          setLoading(false);
          return;
        }
      }

      // For now, use mock data since we don't have a real API endpoint
      const days = getDaysForTimeRange(timeRange);
      const mockData = generateMockData(days);

      // Cache the data
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: mockData,
          timestamp: new Date().getTime(),
        })
      );

      setChartData(mockData);
      setCurrentPrice(mockData[mockData.length - 1]?.price || null);
    } catch (error) {
      console.error("Error loading chart data:", error);
      // Fallback to mock data
      const days = getDaysForTimeRange(timeRange);
      const mockData = generateMockData(days);
      setChartData(mockData);
      setCurrentPrice(mockData[mockData.length - 1]?.price || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChartData();
  }, [symbol, timeRange]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-sm text-blue-600">
            Price: ₹{data.price.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            Volume: {data.volume.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className={`h-96 flex items-center justify-center ${className}`}>
        <LoadingSpinner className="w-8 h-8" />
      </div>
    );
  }

  const minPrice = Math.min(...chartData.map((d) => d.price));
  const maxPrice = Math.max(...chartData.map((d) => d.price));
  const priceChange =
    currentPrice && chartData.length > 1
      ? ((currentPrice - chartData[0].price) / chartData[0].price) * 100
      : 0;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {symbol} Price Chart
          </h3>
          {currentPrice && (
            <div className="flex items-center space-x-3 mt-1">
              <span className="text-2xl font-bold text-gray-900">
                ₹{currentPrice.toLocaleString()}
              </span>
              <span
                className={`text-sm font-medium px-2 py-1 rounded ${
                  priceChange >= 0
                    ? "text-green-700 bg-green-100"
                    : "text-red-700 bg-red-100"
                }`}
              >
                {priceChange >= 0 ? "+" : ""}
                {priceChange.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        {/* Time Range Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(["1M", "3M", "6M", "1Y", "2Y"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                timeRange === range
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              stroke="#666"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              domain={[minPrice * 0.98, maxPrice * 1.02]}
              stroke="#666"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `₹${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Support and Resistance Lines */}
            <ReferenceLine
              y={minPrice * 1.02}
              stroke="#10B981"
              strokeDasharray="5 5"
              label={{ value: "Support", position: "right" }}
            />
            <ReferenceLine
              y={maxPrice * 0.98}
              stroke="#EF4444"
              strokeDasharray="5 5"
              label={{ value: "Resistance", position: "right" }}
            />

            <Line
              type="monotone"
              dataKey="price"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: "#3B82F6",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">High</p>
          <p className="text-sm font-semibold text-gray-900">
            ₹{maxPrice.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Low</p>
          <p className="text-sm font-semibold text-gray-900">
            ₹{minPrice.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Range</p>
          <p className="text-sm font-semibold text-gray-900">
            {(((maxPrice - minPrice) / minPrice) * 100).toFixed(1)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Avg Volume</p>
          <p className="text-sm font-semibold text-gray-900">
            {(
              chartData.reduce((sum, d) => sum + d.volume, 0) / chartData.length
            ).toLocaleString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default StockPriceChart;
