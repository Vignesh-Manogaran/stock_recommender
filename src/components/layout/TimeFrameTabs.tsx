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
    <div className={`${className}`}>
      {/* Compact Segmented Control */}
      <div className="inline-flex bg-gray-100 rounded-lg p-0.5 h-8">
        {timeFrameConfig.map((timeFrame) => {
          const isActive = activeTimeFrame === timeFrame.value;
          
          return (
            <button
              key={timeFrame.value}
              onClick={() => onTimeFrameChange(timeFrame.value)}
              className={`
                relative px-3 py-1 text-sm font-medium rounded-md transition-all duration-200
                ${isActive 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
                }
              `}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTimeFrameSegment"
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
    </div>
  );
};

export default TimeFrameTabs;