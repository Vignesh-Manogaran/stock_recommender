import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getStockRecommendations } from '@/services/stockRecommendations';
import { 
  HealthStatus,
  SignalType,
  Sector,
  TimeFrame
} from '@/types';
import type { 
  Stock, 
  SearchFilters, 
  SortOption, 
  UserPreferences,
  LoadingState,
  StockRecommendation,
  RecommendationResponse
} from '@/types';

interface StockState {
  // Stock Data
  stocks: Stock[];
  selectedStock: Stock | null;
  filteredStocks: Stock[];
  
  // Search & Filters
  searchQuery: string;
  filters: SearchFilters;
  sortOption: SortOption;
  
  // UI State  
  loadingState: LoadingState;
  error: string | null;
  isFilterModalOpen: boolean;
  activeTab: string;
  
  // Recommendations State
  recommendations: StockRecommendation[];
  recommendationLoading: boolean;
  recommendationError: string | null;
  selectedTimeFrame: TimeFrame;
  selectedSector: Sector;
  recommendationViewMode: 'cards' | 'list';
  
  // User Preferences
  userPreferences: UserPreferences;
  
  // Actions
  setStocks: (stocks: Stock[]) => void;
  setSelectedStock: (stock: Stock | null) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  setSortOption: (sort: SortOption) => void;
  setLoadingState: (state: LoadingState) => void;
  setError: (error: string | null) => void;
  setFilterModalOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  
  // Recommendation Actions
  setRecommendations: (recommendations: StockRecommendation[]) => void;
  setRecommendationLoading: (loading: boolean) => void;
  setRecommendationError: (error: string | null) => void;
  setSelectedTimeFrame: (timeFrame: TimeFrame) => void;
  setSelectedSector: (sector: Sector) => void;
  setRecommendationViewMode: (mode: 'cards' | 'list') => void;
  loadRecommendations: (timeFrame?: TimeFrame, sector?: Sector) => Promise<void>;
  refreshRecommendations: () => Promise<void>;
  
  // User Actions
  toggleFavorite: (stockId: string) => void;
  addToWatchlist: (stockId: string) => void;
  removeFromWatchlist: (stockId: string) => void;
  updateUserPreferences: (prefs: Partial<UserPreferences>) => void;
  
  // Computed Values
  favoriteStocks: () => Stock[];
  watchlistStocks: () => Stock[];
  filterAndSortStocks: () => void;
  
  // Utility Actions
  resetFilters: () => void;
  clearSearch: () => void;
}

const defaultFilters: SearchFilters = {
  query: '',
  sectors: [],
  marketCapRange: [0, Infinity],
  priceRange: [0, Infinity],
  peRange: [0, Infinity],
  health: [],
  signal: [],
};

const defaultUserPreferences: UserPreferences = {
  favorites: [],
  watchlist: [],
  defaultFilters: defaultFilters,
  theme: 'light',
  currency: 'INR',
  notifications: {
    priceAlerts: true,
    newsAlerts: true,
    aiInsights: true,
  },
};

const defaultSortOption: SortOption = {
  field: 'marketCap',
  direction: 'desc',
};

export const useStockStore = create<StockState>()(
  persist(
    (set, get) => ({
      // Initial State
      stocks: [],
      selectedStock: null,
      filteredStocks: [],
      searchQuery: '',
      filters: defaultFilters,
      sortOption: defaultSortOption,
      loadingState: 'idle',
      error: null,
      isFilterModalOpen: false,
      activeTab: 'overview',
      
      // Recommendations Initial State
      recommendations: [],
      recommendationLoading: false,
      recommendationError: null,
      selectedTimeFrame: TimeFrame.THREE_MONTHS,
      selectedSector: Sector.ALL,
      recommendationViewMode: 'cards',
      
      userPreferences: defaultUserPreferences,

      // Actions
      setStocks: (stocks) => {
        set({ stocks });
        get().filterAndSortStocks();
      },

      setSelectedStock: (stock) => set({ selectedStock: stock }),

      setSearchQuery: (query) => {
        set({ 
          searchQuery: query,
          filters: { ...get().filters, query }
        });
        get().filterAndSortStocks();
      },

      setFilters: (filters) => {
        set({ filters });
        get().filterAndSortStocks();
      },

      setSortOption: (sortOption) => {
        set({ sortOption });
        get().filterAndSortStocks();
      },

      setLoadingState: (loadingState) => set({ loadingState }),
      
      setError: (error) => set({ error }),
      
      setFilterModalOpen: (isFilterModalOpen) => set({ isFilterModalOpen }),
      
      setActiveTab: (activeTab) => set({ activeTab }),

      // Recommendation Actions
      setRecommendations: (recommendations) => set({ recommendations }),
      
      setRecommendationLoading: (recommendationLoading) => set({ recommendationLoading }),
      
      setRecommendationError: (recommendationError) => set({ recommendationError }),
      
      setSelectedTimeFrame: (selectedTimeFrame) => {
        set({ selectedTimeFrame });
        // Auto-load recommendations when time frame changes
        get().loadRecommendations(selectedTimeFrame);
      },
      
      setSelectedSector: (selectedSector) => {
        set({ selectedSector });
        // Auto-load recommendations when sector changes  
        get().loadRecommendations(undefined, selectedSector);
      },
      
      setRecommendationViewMode: (recommendationViewMode) => set({ recommendationViewMode }),
      
      loadRecommendations: async (timeFrame?, sector?) => {
        const currentTimeFrame = timeFrame || get().selectedTimeFrame;
        const currentSector = sector || get().selectedSector;
        
        try {
          set({ 
            recommendationLoading: true, 
            recommendationError: null 
          });
          
          const response = await getStockRecommendations(currentTimeFrame, currentSector);
          
          set({ 
            recommendations: response.recommendations,
            recommendationLoading: false 
          });
        } catch (error) {
          console.error('Failed to load recommendations:', error);
          set({ 
            recommendationLoading: false,
            recommendationError: error instanceof Error ? error.message : 'Failed to load recommendations'
          });
        }
      },
      
      refreshRecommendations: async () => {
        const { selectedTimeFrame, selectedSector } = get();
        await get().loadRecommendations(selectedTimeFrame, selectedSector);
      },

      // User Actions
      toggleFavorite: (stockId) => {
        const { userPreferences } = get();
        const favorites = userPreferences.favorites.includes(stockId)
          ? userPreferences.favorites.filter(id => id !== stockId)
          : [...userPreferences.favorites, stockId];
        
        set({
          userPreferences: {
            ...userPreferences,
            favorites,
          },
        });
      },

      addToWatchlist: (stockId) => {
        const { userPreferences } = get();
        if (!userPreferences.watchlist.includes(stockId)) {
          set({
            userPreferences: {
              ...userPreferences,
              watchlist: [...userPreferences.watchlist, stockId],
            },
          });
        }
      },

      removeFromWatchlist: (stockId) => {
        const { userPreferences } = get();
        set({
          userPreferences: {
            ...userPreferences,
            watchlist: userPreferences.watchlist.filter(id => id !== stockId),
          },
        });
      },

      updateUserPreferences: (prefs) => {
        const { userPreferences } = get();
        set({
          userPreferences: {
            ...userPreferences,
            ...prefs,
          },
        });
      },

      // Computed Values
      favoriteStocks: () => {
        const { stocks, userPreferences } = get();
        return stocks.filter(stock => userPreferences.favorites.includes(stock.id));
      },

      watchlistStocks: () => {
        const { stocks, userPreferences } = get();
        return stocks.filter(stock => userPreferences.watchlist.includes(stock.id));
      },

      filterAndSortStocks: () => {
        const { stocks, filters, sortOption } = get();
        
        let filtered = stocks.filter(stock => {
          // Text search
          if (filters.query) {
            const query = filters.query.toLowerCase();
            const searchableText = `${stock.name} ${stock.symbol} ${stock.sector} ${stock.industry}`.toLowerCase();
            if (!searchableText.includes(query)) return false;
          }

          // Sector filter
          if (filters.sectors && filters.sectors.length > 0) {
            if (!filters.sectors.includes(stock.sector as Sector)) return false;
          }

          // Market Cap range
          if (filters.marketCapRange) {
            const [min, max] = filters.marketCapRange;
            if (stock.marketCap < min || stock.marketCap > max) return false;
          }

          // Price range
          if (filters.priceRange) {
            const [min, max] = filters.priceRange;
            if (stock.price < min || stock.price > max) return false;
          }

          // P/E range
          if (filters.peRange && stock.pe !== null) {
            const [min, max] = filters.peRange;
            if (stock.pe < min || stock.pe > max) return false;
          }

          // Health filter
          if (filters.health && filters.health.length > 0) {
            if (!filters.health.includes(stock.health)) return false;
          }

          // Signal filter
          if (filters.signal && filters.signal.length > 0) {
            if (!filters.signal.includes(stock.signal)) return false;
          }

          // Volume filter
          if (filters.minVolume && stock.volume < filters.minVolume) return false;

          // Dividend yield filter
          if (filters.minDividendYield && stock.dividendYield !== null) {
            if (stock.dividendYield < filters.minDividendYield) return false;
          }

          return true;
        });

        // Sort the filtered results
        filtered.sort((a, b) => {
          const aValue = a[sortOption.field];
          const bValue = b[sortOption.field];
          
          // Handle null values
          if (aValue === null && bValue === null) return 0;
          if (aValue === null) return 1;
          if (bValue === null) return -1;

          // Sort based on data type
          let comparison = 0;
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            comparison = aValue.localeCompare(bValue);
          } else if (typeof aValue === 'number' && typeof bValue === 'number') {
            comparison = aValue - bValue;
          }

          return sortOption.direction === 'desc' ? -comparison : comparison;
        });

        set({ filteredStocks: filtered });
      },

      // Utility Actions
      resetFilters: () => {
        set({ 
          filters: defaultFilters,
          searchQuery: '',
        });
        get().filterAndSortStocks();
      },

      clearSearch: () => {
        set({ 
          searchQuery: '',
          filters: { ...get().filters, query: '' }
        });
        get().filterAndSortStocks();
      },
    }),
    {
      name: 'stock-store',
      // Only persist user preferences and some UI state
      partialize: (state) => ({
        userPreferences: state.userPreferences,
        activeTab: state.activeTab,
        sortOption: state.sortOption,
      }),
    }
  )
);

// Selectors for optimized re-renders
export const useStocks = () => useStockStore(state => state.stocks);
export const useFilteredStocks = () => useStockStore(state => state.filteredStocks);
export const useSelectedStock = () => useStockStore(state => state.selectedStock);
export const useSearchQuery = () => useStockStore(state => state.searchQuery);
export const useFilters = () => useStockStore(state => state.filters);
export const useLoadingState = () => useStockStore(state => state.loadingState);
export const useError = () => useStockStore(state => state.error);
export const useUserPreferences = () => useStockStore(state => state.userPreferences);
export const useFavoriteStocks = () => useStockStore(state => state.favoriteStocks());
export const useWatchlistStocks = () => useStockStore(state => state.watchlistStocks());

// Recommendation Selectors
export const useRecommendations = () => useStockStore(state => state.recommendations);
export const useRecommendationLoading = () => useStockStore(state => state.recommendationLoading);
export const useRecommendationError = () => useStockStore(state => state.recommendationError);
export const useSelectedTimeFrame = () => useStockStore(state => state.selectedTimeFrame);
export const useSelectedSector = () => useStockStore(state => state.selectedSector);
export const useRecommendationViewMode = () => useStockStore(state => state.recommendationViewMode);