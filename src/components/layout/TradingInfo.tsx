import React, { useState, useEffect } from 'react';
import { Clock, Calendar, TrendingUp, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  getCurrentDateTime, 
  getLastTradingDate, 
  getNextTradingDate, 
  getMarketStatus 
} from '@/utils/tradingDates';

interface TradingInfoProps {
  compact?: boolean;
}

const TradingInfo: React.FC<TradingInfoProps> = ({ compact = false }) => {
  const [currentTime, setCurrentTime] = useState(getCurrentDateTime());
  const [marketStatus, setMarketStatus] = useState(getMarketStatus());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentDateTime());
      setMarketStatus(getMarketStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const lastTradingDate = getLastTradingDate();
  const nextTradingDate = getNextTradingDate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'CLOSED':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'PRE_MARKET':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Activity className="w-4 h-4" />;
      case 'CLOSED':
        return <Clock className="w-4 h-4" />;
      case 'PRE_MARKET':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (compact) {
    return (
      <div className="text-right">
        <div className="flex items-center space-x-6">
          {/* Market Status */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(marketStatus.status)}`}
          >
            {getStatusIcon(marketStatus.status)}
            <span className="ml-2">{marketStatus.message}</span>
          </motion.div>

          {/* Current Time - Compact */}
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{currentTime.time}</p>
            <p className="text-xs text-gray-500">{currentTime.day}, {currentTime.date}</p>
          </div>
        </div>

        {/* Trading Dates - Compact */}
        <div className="flex items-center justify-end space-x-4 mt-2 text-xs text-gray-500">
          <div className="text-center">
            <span className="font-medium">Last:</span> {lastTradingDate.day}
          </div>
          <div className="text-center">
            <span className="font-medium">Next:</span> {nextTradingDate.day}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          
          {/* Market Status */}
          <div className="flex items-center space-x-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(marketStatus.status)}`}
            >
              {getStatusIcon(marketStatus.status)}
              <span className="ml-2">{marketStatus.message}</span>
            </motion.div>
            
            {marketStatus.status === 'OPEN' && (
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-3 h-3 bg-green-500 rounded-full"
              />
            )}
          </div>

          {/* Time Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            
            {/* Current Time */}
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Current</p>
                <p className="text-gray-600">{currentTime.day}</p>
                <p className="text-gray-500 text-xs">
                  {currentTime.date} • {currentTime.time}
                </p>
              </div>
            </div>

            {/* Last Trading Date */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Last Trading</p>
                <p className="text-gray-600">{lastTradingDate.day}</p>
                <p className="text-gray-500 text-xs">
                  {lastTradingDate.date} • {lastTradingDate.time}
                </p>
              </div>
            </div>

            {/* Next Trading Date */}
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Next Trading</p>
                <p className="text-gray-600">{nextTradingDate.day}</p>
                <p className="text-gray-500 text-xs">
                  {nextTradingDate.date} • {nextTradingDate.time}
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingInfo;