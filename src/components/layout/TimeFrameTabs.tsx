import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, TrendingUp } from 'lucide-react';
import { TimeFrame } from '@/types';

interface TimeFrameTabsProps {
  activeTimeFrame: TimeFrame;
  onTimeFrameChange: (timeFrame: TimeFrame) => void;
  className?: string;
}

const timeFrameConfig = [
  {
    value: TimeFrame.SEVEN_DAYS,
    label: '7 Days',
    shortLabel: '7D',
    icon: Clock,
    description: 'Short-term trading opportunities'
  },
  {
    value: TimeFrame.ONE_MONTH,
    label: '1 Month',
    shortLabel: '1M',
    icon: Calendar,
    description: 'Short to medium-term positions'
  },
  {
    value: TimeFrame.THREE_MONTHS,
    label: '3 Months',
    shortLabel: '3M',
    icon: TrendingUp,
    description: 'Medium-term investments'
  },
  {
    value: TimeFrame.SIX_MONTHS,
    label: '6 Months',
    shortLabel: '6M',
    icon: TrendingUp,
    description: 'Medium to long-term growth'
  },
  {
    value: TimeFrame.ONE_YEAR,
    label: '1 Year',
    shortLabel: '1Y',
    icon: TrendingUp,
    description: 'Long-term investment horizon'
  }
];

const TimeFrameTabs: React.FC<TimeFrameTabsProps> = ({
  activeTimeFrame,
  onTimeFrameChange,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Desktop Tabs */}
      <div className="hidden md:flex bg-white rounded-lg border border-gray-200 p-1">
        {timeFrameConfig.map((timeFrame) => {
          const Icon = timeFrame.icon;
          const isActive = activeTimeFrame === timeFrame.value;
          
          return (
            <button
              key={timeFrame.value}
              onClick={() => onTimeFrameChange(timeFrame.value)}
              className={`
                relative flex-1 flex items-center justify-center px-4 py-3 rounded-md transition-all duration-200
                ${isActive 
                  ? 'text-blue-600 bg-blue-50 border border-blue-200 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTimeFrameTab"
                  className="absolute inset-0 bg-blue-50 border border-blue-200 rounded-md"
                  initial={false}
                  transition={{ duration: 0.2 }}
                />
              )}
              
              <div className="relative flex items-center space-x-2">
                <Icon className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium text-sm">
                    {timeFrame.label}
                  </div>
                  <div className={`text-xs ${
                    isActive ? 'text-blue-500' : 'text-gray-500'
                  }`}>
                    {timeFrame.description}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {timeFrameConfig.map((timeFrame) => {
            const isActive = activeTimeFrame === timeFrame.value;
            
            return (
              <button
                key={timeFrame.value}
                onClick={() => onTimeFrameChange(timeFrame.value)}
                className={`
                  relative flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
                  ${isActive 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTimeFrameTabMobile"
                    className="absolute inset-0 bg-white rounded-md shadow-sm"
                    initial={false}
                    transition={{ duration: 0.2 }}
                  />
                )}
                <span className="relative">
                  {timeFrame.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Mobile Description */}
        <div className="mt-2 px-1">
          <p className="text-sm text-gray-600">
            {timeFrameConfig.find(tf => tf.value === activeTimeFrame)?.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TimeFrameTabs;