import React from 'react';
import { BarChart3, Search, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

interface TabNavigationProps {
  activeTab: 'analysis' | 'search' | 'holdings';
  onTabChange: (tab: 'analysis' | 'search' | 'holdings') => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'analysis' as const,
      label: 'Analysis',
      icon: BarChart3,
      description: 'Market analysis and insights',
    },
    {
      id: 'search' as const,
      label: 'Search',
      icon: Search,
      description: 'Find and explore stocks',
    },
    {
      id: 'holdings' as const,
      label: 'Holdings',
      icon: Briefcase,
      description: 'Your portfolio and favorites',
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </div>
                
                {/* Active tab indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary-50 rounded-t-lg -z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {tab.description}
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default TabNavigation;