import { Timestamp } from "firebase/firestore";

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  isDefault: boolean;
  holdings: PortfolioHolding[];
  performance: PortfolioPerformance;
  settings: PortfolioSettings;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PortfolioHolding {
  coinId: string;
  symbol: string;
  name: string;
  amount: number;
  averagePrice: number;
  currentPrice: number;
  firstPurchaseDate: Timestamp;
  lastUpdated: Timestamp;
  notes?: string;
}

export interface PortfolioPerformance {
  totalValue: number;
  totalCost: number;
  unrealizedPnL: number;
  realizedPnL: number;
  roi: number;
  roiPercentage: number;
  dayChange: number;
  dayChangePercentage: number;
  weekChange: number;
  weekChangePercentage: number;
  monthChange: number;
  monthChangePercentage: number;
  yearChange: number;
  yearChangePercentage: number;
  allTimeHigh: number;
  allTimeLow: number;
  allocation: AssetAllocation[];
  lastCalculated: Timestamp;
}

export interface AssetAllocation {
  coinId: string;
  symbol: string;
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface PortfolioSettings {
  baseCurrency: string;
  hideBalances: boolean;
  showRealizedGains: boolean;
  trackDividends: boolean;
  autoSync: boolean;
  syncWallets: string[];
}

export interface Transaction {
  id: string;
  userId: string;
  portfolioId: string;
  type:
    | "buy"
    | "sell"
    | "transfer_in"
    | "transfer_out"
    | "dividend"
    | "staking_reward";
  coinId: string;
  symbol: string;
  name: string;
  amount: number;
  price: number;
  total: number;
  fee: number;
  feeCurrency: string;
  exchange?: string;
  wallet?: string;
  notes?: string;
  tags: string[];
  timestamp: Timestamp;
  createdAt: Timestamp;
  hash?: string; // For blockchain transactions
  blockNumber?: number;
  gasUsed?: number;
  gasPrice?: number;
}

export interface Watchlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coins: WatchlistCoin[];
  isDefault: boolean;
  isPublic: boolean;
  settings: WatchlistSettings;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WatchlistCoin {
  coinId: string;
  symbol: string;
  name: string;
  addedAt: Timestamp;
  notes?: string;
  alerts: PriceAlert[];
}

export interface WatchlistSettings {
  sortBy:
    | "rank"
    | "name"
    | "price"
    | "change_24h"
    | "market_cap"
    | "volume"
    | "added_date";
  sortOrder: "asc" | "desc";
  showPercentageChange: boolean;
  highlightChanges: boolean;
}

export interface PriceAlert {
  id: string;
  userId: string;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  condition: "above" | "below" | "change_up" | "change_down";
  targetPrice?: number;
  changePercentage?: number;
  currentPrice: number;
  isActive: boolean;
  isTriggered: boolean;
  notificationMethods: ("email" | "push" | "sms")[];
  repeatInterval?: "once" | "daily" | "weekly";
  createdAt: Timestamp;
  triggeredAt?: Timestamp;
  lastNotified?: Timestamp;
}

export interface PortfolioState {
  portfolios: Portfolio[];
  currentPortfolio: Portfolio | null;
  watchlists: Watchlist[];
  currentWatchlist: Watchlist | null;
  transactions: Transaction[];
  alerts: PriceAlert[];
  loading: boolean;
  error: string | null;

  // Actions
  createPortfolio: (
    portfolio: Omit<Portfolio, "id" | "createdAt" | "updatedAt">
  ) => Promise<Portfolio>;
  updatePortfolio: (id: string, updates: Partial<Portfolio>) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;
  setCurrentPortfolio: (portfolio: Portfolio | null) => void;

  addTransaction: (
    transaction: Omit<Transaction, "id" | "createdAt">
  ) => Promise<Transaction>;
  updateTransaction: (
    id: string,
    updates: Partial<Transaction>
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  createWatchlist: (
    watchlist: Omit<Watchlist, "id" | "createdAt" | "updatedAt">
  ) => Promise<Watchlist>;
  updateWatchlist: (id: string, updates: Partial<Watchlist>) => Promise<void>;
  deleteWatchlist: (id: string) => Promise<void>;
  addCoinToWatchlist: (
    watchlistId: string,
    coin: Omit<WatchlistCoin, "addedAt">
  ) => Promise<void>;
  removeCoinFromWatchlist: (
    watchlistId: string,
    coinId: string
  ) => Promise<void>;

  createAlert: (
    alert: Omit<PriceAlert, "id" | "createdAt">
  ) => Promise<PriceAlert>;
  updateAlert: (id: string, updates: Partial<PriceAlert>) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  triggerAlert: (id: string) => Promise<void>;
}
