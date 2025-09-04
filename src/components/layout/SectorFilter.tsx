import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Building2, 
  Cpu, 
  Zap, 
  ShoppingCart, 
  Coffee,
  Hammer,
  Heart,
  Home,
  Factory,
  Radio,
  Layers
} from 'lucide-react';
import { Sector } from '@/types';

interface SectorFilterProps {
  activeSector: Sector;
  onSectorChange: (sector: Sector) => void;
  className?: string;
}

const sectorConfig = [
  {
    value: Sector.ALL,
    label: 'All Sectors',
    icon: Layers,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    description: 'Top performers across all sectors'
  },
  {
    value: Sector.FINANCIAL,
    label: 'Financial',
    icon: Building2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Banks, Insurance, Financial Services'
  },
  {
    value: Sector.IT,
    label: 'IT/Technology',
    icon: Cpu,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: 'Software, IT Services, Hardware'
  },
  {
    value: Sector.ENERGY,
    label: 'Energy',
    icon: Zap,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    description: 'Oil & Gas, Renewable Energy'
  },
  {
    value: Sector.CONSUMER_DISCRETIONARY,
    label: 'Consumer Discretionary',
    icon: ShoppingCart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    description: 'Automobiles, Retail, Luxury Goods'
  },
  {
    value: Sector.CONSUMER_STAPLES,
    label: 'Consumer Staples',
    icon: Coffee,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'FMCG, Food & Beverages'
  },
  {
    value: Sector.MATERIALS,
    label: 'Materials',
    icon: Hammer,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    description: 'Metals, Chemicals, Construction'
  },
  {
    value: Sector.HEALTHCARE,
    label: 'Healthcare',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    description: 'Pharmaceuticals, Medical Equipment'
  },
  {
    value: Sector.REAL_ESTATE,
    label: 'Real Estate',
    icon: Home,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    description: 'Real Estate Development, REITs'
  },
  {
    value: Sector.UTILITIES,
    label: 'Utilities',
    icon: Factory,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
    description: 'Power, Water, Infrastructure'
  },
  {
    value: Sector.COMMUNICATION_SERVICES,
    label: 'Communication',
    icon: Radio,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    description: 'Telecom, Media, Internet'
  }
];

const SectorFilter: React.FC<SectorFilterProps> = ({
  activeSector,
  onSectorChange,
  className = ''
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const activeSectorConfig = sectorConfig.find(s => s.value === activeSector) || sectorConfig[0];

  return (
    <div className={`relative ${className}`}>
      {/* Desktop Grid Layout */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-4 xl:grid-cols-6 gap-3">
          {sectorConfig.map((sector) => {
            const Icon = sector.icon;
            const isActive = activeSector === sector.value;
            
            return (
              <button
                key={sector.value}
                onClick={() => onSectorChange(sector.value)}
                className={`
                  relative flex flex-col items-center space-y-2 p-3 rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? `${sector.color} ${sector.bgColor} border-2 border-current shadow-md` 
                    : 'text-gray-600 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                  }
                `}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSectorFilter"
                    className={`absolute inset-0 ${sector.bgColor} rounded-xl`}
                    initial={false}
                    transition={{ duration: 0.2 }}
                  />
                )}
                
                <div className="relative flex flex-col items-center space-y-2">
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-xs text-center leading-tight">{sector.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`
            flex items-center justify-between w-full px-4 py-3 rounded-lg border-2 transition-all duration-200
            ${activeSectorConfig.color} ${activeSectorConfig.bgColor} border-current
          `}
        >
          <div className="flex items-center space-x-2">
            <activeSectorConfig.icon className="w-5 h-5" />
            <span className="font-medium">{activeSectorConfig.label}</span>
          </div>
          <ChevronDown 
            className={`w-4 h-4 transition-transform duration-200 ${
              isDropdownOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isDropdownOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsDropdownOpen(false)}
              />
              
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-0 right-0 z-20 mt-2 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden"
              >
                <div className="max-h-64 overflow-y-auto">
                  {sectorConfig.map((sector) => {
                    const Icon = sector.icon;
                    const isActive = activeSector === sector.value;
                    
                    return (
                      <button
                        key={sector.value}
                        onClick={() => {
                          onSectorChange(sector.value);
                          setIsDropdownOpen(false);
                        }}
                        className={`
                          w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors duration-150
                          ${isActive 
                            ? `${sector.color} ${sector.bgColor}` 
                            : 'text-gray-700 hover:bg-gray-50'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{sector.label}</div>
                          <div className="text-xs text-gray-500 truncate">
                            {sector.description}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Tablet Grid View */}
      <div className="hidden md:block lg:hidden">
        <div className="grid grid-cols-2 gap-2">
          {sectorConfig.slice(0, 6).map((sector) => {
            const Icon = sector.icon;
            const isActive = activeSector === sector.value;
            
            return (
              <button
                key={sector.value}
                onClick={() => onSectorChange(sector.value)}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200
                  ${isActive 
                    ? `${sector.color} ${sector.bgColor} border-2 border-current` 
                    : 'text-gray-600 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium text-sm truncate">{sector.label}</span>
              </button>
            );
          })}
        </div>
        
        {sectorConfig.length > 6 && (
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="mt-2 w-full flex items-center justify-center space-x-2 px-3 py-2 text-gray-600 bg-white border-2 border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            <span className="text-sm font-medium">More Sectors</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Active Sector Description */}
      <div className="hidden lg:block mt-2">
        <p className="text-sm text-gray-600">
          {activeSectorConfig.description}
        </p>
      </div>
    </div>
  );
};

export default SectorFilter;