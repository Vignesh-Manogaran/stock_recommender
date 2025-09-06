// Core Stock Types
export interface Stock {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  marketCap: number;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  pe: number | null;
  pb: number | null;
  roe: number | null;
  roce: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
  quickRatio: number | null;
  grossMargin: number | null;
  operatingMargin: number | null;
  netMargin: number | null;
  bookValue: number | null;
  dividendYield: number | null;
  beta: number | null;
  eps: number | null;
  revenue: number | null;
  netIncome: number | null;
  health: HealthStatus;
  signal: SignalType;
  lastUpdated: Date;
}

// Health Status Enum
export enum HealthStatus {
  BEST = "BEST",
  GOOD = "GOOD",
  NORMAL = "NORMAL",
  BAD = "BAD",
  WORSE = "WORSE",
}

// Technical Indicator Health
export interface TechnicalIndicatorHealth {
  indicator: string;
  value: number;
  signal: SignalType;
  health: HealthStatus;
  description: string;
  buyPrice?: number;
  targetPrice?: number;
  stopLoss?: number;
}

// Detailed Stock Analysis Interface
export interface DetailedStockAnalysis {
  symbol: string;
  name: string;
  about: string;
  keyPoints: string[];
  currentPrice: number;
  marketCap: number;
  sector: string;
  industry: string;

  // Financial Health for each category
  financialHealth: {
    statements: {
      incomeStatement: HealthStatus;
      balanceSheet: HealthStatus;
      cashFlow: HealthStatus;
    };
    profitability: Record<string, MetricWithSource>;
    liquidity: Record<string, MetricWithSource>;
    valuation: Record<string, MetricWithSource>;
    growth: Record<string, MetricWithSource>;
    management: HealthStatus;
    industry: HealthStatus;
    risks: HealthStatus;
    outlook: HealthStatus;
  };

  // Technical Indicators
  technicalIndicators: {
    stochasticRSI: TechnicalIndicatorHealth;
    connorsRSI: TechnicalIndicatorHealth;
    macd: TechnicalIndicatorHealth;
    patterns: TechnicalIndicatorHealth;
    support: number[];
    resistance: number[];
  };

  // Pros and Cons
  pros: string[];
  cons: string[];

  // Price History
  priceHistory: PriceData[];

  lastUpdated: Date;
}

// Signal Types
export enum SignalType {
  BUY = "BUY",
  SELL = "SELL",
  HOLD = "HOLD",
}

// Data Source Types
export enum DataSource {
  YAHOO_FINANCE_API = "YAHOO_FINANCE_API",
  RAPID_API_YAHOO = "RAPID_API_YAHOO",
  CALCULATED = "CALCULATED",
  ESTIMATED = "ESTIMATED",
  MOCK = "MOCK",
  AI_GENERATED = "AI_GENERATED",
}

// Metric with data source information
export interface MetricWithSource {
  value: number;
  health: HealthStatus;
  dataSource: DataSource;
  lastUpdated?: Date;
}

// Sector Types
export enum Sector {
  ALL = "All",
  TECHNOLOGY = "Technology",
  FINANCIAL = "Financial Sector",
  IT = "IT",
  ENERGY = "Energy",
  CONSUMER_DISCRETIONARY = "Consumer Discretionary",
  CONSUMER_STAPLES = "Consumer Staples",
  MATERIALS = "Materials",
  HEALTHCARE = "Healthcare",
  REAL_ESTATE = "Real Estate",
  UTILITIES = "Utilities",
  COMMUNICATION_SERVICES = "Communication Services",
  BANKING = "Banking",
  PHARMA = "Pharmaceuticals",
  AUTO = "Automobile",
  FMCG = "FMCG",
  METALS = "Metals",
  TELECOM = "Telecommunications",
  INFRASTRUCTURE = "Infrastructure",
}

// Time Frame Types for Recommendations
export enum TimeFrame {
  SEVEN_DAYS = "7D",
  ONE_MONTH = "1M",
  THREE_MONTHS = "3M",
  SIX_MONTHS = "6M",
  ONE_YEAR = "1Y",
}

// Technical Analysis Data
export interface TechnicalData {
  rsi: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  sma20: number;
  sma50: number;
  sma200: number;
  ema20: number;
  ema50: number;
  supportLevels: number[];
  resistanceLevels: number[];
  volumeProfile: VolumeProfile[];
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
  };
}

export interface VolumeProfile {
  price: number;
  volume: number;
}

// Fundamental Analysis Data
export interface FundamentalData {
  valuation: {
    pe: number | null;
    pb: number | null;
    ps: number | null;
    pcf: number | null;
    ev_ebitda: number | null;
    peg: number | null;
  };
  profitability: {
    roe: number | null;
    roce: number | null;
    roa: number | null;
    grossMargin: number | null;
    operatingMargin: number | null;
    netMargin: number | null;
  };
  liquidity: {
    currentRatio: number | null;
    quickRatio: number | null;
    cashRatio: number | null;
  };
  leverage: {
    debtToEquity: number | null;
    debtToAssets: number | null;
    interestCoverage: number | null;
  };
  efficiency: {
    assetTurnover: number | null;
    inventoryTurnover: number | null;
    receivablesTurnover: number | null;
  };
  growth: {
    revenueGrowth: number | null;
    netIncomeGrowth: number | null;
    epsGrowth: number | null;
    bookValueGrowth: number | null;
  };
}

// Financial Statements
export interface IncomeStatement {
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingIncome: number;
  interestExpense: number;
  pretaxIncome: number;
  incomeTax: number;
  netIncome: number;
  eps: number;
  shares: number;
  period: string;
  year: number;
}

export interface BalanceSheet {
  totalAssets: number;
  currentAssets: number;
  cash: number;
  inventory: number;
  receivables: number;
  totalLiabilities: number;
  currentLiabilities: number;
  longTermDebt: number;
  totalEquity: number;
  retainedEarnings: number;
  period: string;
  year: number;
}

export interface CashFlowStatement {
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  netCashFlow: number;
  freeCashFlow: number;
  capitalExpenditure: number;
  period: string;
  year: number;
}

// AI Analysis Types
export interface AIAnalysis {
  id: string;
  stockId: string;
  recommendation: SignalType;
  confidence: number; // 0-100
  summary: string;
  keyPoints: string[];
  risks: string[];
  opportunities: string[];
  priceTarget: number | null;
  timeHorizon: string; // '3M', '6M', '1Y'
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  generatedAt: Date;
  model: string;
}

// Stock Recommendation Types
export interface StockRecommendation {
  id: string;
  stockId: string;
  symbol: string;
  name: string;
  sector: Sector;
  timeFrame: TimeFrame;
  recommendation: SignalType;
  confidence: number; // 0-100
  currentPrice: number;
  targetPrice: number | null;
  stopLoss: number | null;
  upside: number | null; // percentage
  reasoning: string[];
  risks: string[];
  keyMetrics: {
    pe?: number;
    pb?: number;
    roe?: number;
    marketCap: number;
  };
  aiScore: number; // 0-100
  generatedAt: Date;
  validUntil: Date;
}

export interface RecommendationResponse {
  recommendations: StockRecommendation[];
  metadata: {
    timeFrame: TimeFrame;
    sector: Sector;
    totalAnalyzed: number;
    modelUsed: string;
    generatedAt: Date;
  };
}

export interface MarketSentiment {
  overall: "BULLISH" | "BEARISH" | "NEUTRAL";
  score: number; // -100 to 100
  sectors: Record<string, number>;
  factors: {
    technical: number;
    fundamental: number;
    news: number;
    macro: number;
  };
  lastUpdated: Date;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  sectors?: Sector[];
  marketCapRange?: [number, number];
  priceRange?: [number, number];
  peRange?: [number, number];
  health?: HealthStatus[];
  signal?: SignalType[];
  minVolume?: number;
  minDividendYield?: number;
}

export interface SortOption {
  field: keyof Stock;
  direction: "asc" | "desc";
}

// User Preferences
export interface UserPreferences {
  favorites: string[]; // Stock IDs
  watchlist: string[];
  defaultFilters: SearchFilters;
  theme: "light" | "dark";
  currency: "INR" | "USD";
  notifications: {
    priceAlerts: boolean;
    newsAlerts: boolean;
    aiInsights: boolean;
  };
}

// Chart Data Types
export interface PriceData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ChartTimeRange {
  label: string;
  value: "1D" | "5D" | "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y" | "MAX";
  days: number;
}

// API Response Types
export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// News and Events
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  publishedAt: Date;
  sentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  relevantStocks: string[];
  tags: string[];
  url: string;
}

export interface EarningsEvent {
  stockId: string;
  date: Date;
  type: "EARNINGS" | "DIVIDEND" | "SPLIT" | "BONUS";
  expectedEPS?: number;
  actualEPS?: number;
  consensus?: "BEAT" | "MISS" | "INLINE";
}

// Error Types
export interface APIError {
  code: string;
  message: string;
  details?: any;
}

// Utility Types
export type LoadingState = "idle" | "loading" | "success" | "error";

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface StockCardProps extends BaseComponentProps {
  stock: Stock;
  onFavoriteToggle?: (stockId: string) => void;
  onSelect?: (stock: Stock) => void;
  isFavorite?: boolean;
}

export interface TableColumn<T> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

// Export additional types not already exported as interfaces/enums above
export type {
  VolumeProfile,
  TechnicalIndicatorHealth,
  LoadingState,
  AsyncState,
  BaseComponentProps,
  StockCardProps,
  TableColumn,
};
