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
import { PriceData, DataSource } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import DataSourceBadge from "@/components/ui/DataSourceBadge";
import { getStockChartData } from "@/services/hybridStockService";

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
  const [timeRange, setTimeRange] = useState<"1mo" | "3mo" | "6mo" | "1y" | "2y">(
    "3mo"
  );
  const [loading, setLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [dataSource, setDataSource] = useState<DataSource>(DataSource.MOCK);
  const [isRealData, setIsRealData] = useState(false);

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

  // Convert PriceData to ChartDataPoint for the chart component
  const convertPriceDataToChartData = (priceData: PriceData[]): ChartDataPoint[] => {
    return priceData.map((item) => ({
      date: item.date.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      }),
      price: item.close,
      volume: item.volume,
      timestamp: item.date.getTime(),
    }));
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
          setChartData(parsed.chartData);
          setCurrentPrice(parsed.chartData[parsed.chartData.length - 1]?.price || null);
          setDataSource(parsed.dataSource || DataSource.MOCK);
          setIsRealData(parsed.isRealData || false);
          setLoading(false);
          return;
        }
      }

      // Fetch real chart data
      console.log(`📈 Loading chart data for ${symbol} (${timeRange})`);
      const { data, isRealData: realData, dataSource: source } = await getStockChartData(
        symbol,
        timeRange,
        timeRange === "1mo" || timeRange === "3mo" ? "1d" : "1wk"
      );

      // Convert to chart format
      const chartData = convertPriceDataToChartData(data);

      // Cache the data
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          chartData,
          dataSource: source,
          isRealData: realData,
          timestamp: new Date().getTime(),
        })
      );

      setChartData(chartData);
      setCurrentPrice(chartData[chartData.length - 1]?.price || null);
      setDataSource(source);
      setIsRealData(realData);

      console.log(
        `✅ Chart data loaded: ${chartData.length} points (Real: ${realData})`
      );
    } catch (error) {
      console.error("Error loading chart data:", error);
      
      // Fallback to mock data
      const days = timeRange === "1mo" ? 30 : timeRange === "3mo" ? 90 : 
                   timeRange === "6mo" ? 180 : timeRange === "1y" ? 365 : 730;
      const mockData = generateMockData(days);
      
      setChartData(mockData);
      setCurrentPrice(mockData[mockData.length - 1]?.price || null);
      setDataSource(DataSource.MOCK);
      setIsRealData(false);
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
            வொல்யூம்: {data.volume.toLocaleString()}
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
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {symbol} Price Chart
            </h3>
            <DataSourceBadge dataSource={dataSource} showLabel />
            {!isRealData && (
              <div className="w-2 h-2 bg-red-500 rounded-full" title="Mock/Estimated Data" />
            )}
          </div>
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
                {priceChange?.toFixed(2) || "0.00"}%
              </span>
              <span className="text-xs text-gray-500">
                {isRealData ? "Real-time" : "Estimated"}
              </span>
            </div>
          )}
        </div>

        {/* Time Range Selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(["1mo", "3mo", "6mo", "1y", "2y"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                timeRange === range
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {range.toUpperCase()}
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
              label={{ value: "துணை", position: "right" }}
            />
            <ReferenceLine
              y={maxPrice * 0.98}
              stroke="#EF4444"
              strokeDasharray="5 5"
              label={{ value: "எதிர்ப்பு", position: "right" }}
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
            {maxPrice && minPrice ? (((maxPrice - minPrice) / minPrice) * 100).toFixed(1) : "0.0"}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">சராசரி வொல்யூம்</p>
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
