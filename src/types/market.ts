export interface MarketState {
  coins: CoinMarketData[];
  trending: TrendingCoin[];
  globalData: GlobalMarketData | null;
  featuredCoins: CoinMarketData[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Filters and pagination
  filters: MarketFilters;
  pagination: PaginationState;

  // Actions
  fetchCoins: (params?: FetchCoinsParams) => Promise<void>;
  fetchTrending: () => Promise<void>;
  fetchGlobalData: () => Promise<void>;
  searchCoins: (query: string) => Promise<SearchResult[]>;
  setFilters: (filters: Partial<MarketFilters>) => void;
  setPagination: (pagination: Partial<PaginationState>) => void;
}

export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: {
    times: number;
    currency: string;
    percentage: number;
  } | null;
  last_updated: string;
  price_change_percentage_7d_in_currency: number;
  price_change_percentage_30d_in_currency: number;
  price_change_percentage_1y_in_currency: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface TrendingCoin {
  id: string;
  coin_id: number;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  small: string;
  large: string;
  slug: string;
  price_btc: number;
  score: number;
}

export interface GlobalMarketData {
  active_cryptocurrencies: number;
  upcoming_icos: number;
  ongoing_icos: number;
  ended_icos: number;
  markets: number;
  total_market_cap: Record<string, number>;
  total_volume: Record<string, number>;
  market_cap_percentage: Record<string, number>;
  market_cap_change_percentage_24h_usd: number;
  updated_at: number;
}

export interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number | null;
  thumb: string;
  large: string;
}

export interface MarketFilters {
  category: string;
  sortBy:
    | "market_cap_desc"
    | "market_cap_asc"
    | "volume_desc"
    | "volume_asc"
    | "price_desc"
    | "price_asc"
    | "percent_change_24h_desc"
    | "percent_change_24h_asc";
  priceRange: {
    min: number | null;
    max: number | null;
  };
  marketCapRange: {
    min: number | null;
    max: number | null;
  };
  volumeRange: {
    min: number | null;
    max: number | null;
  };
  changeRange: {
    min: number | null;
    max: number | null;
  };
  currency: string;
  includePlatform: boolean;
  includeSparkline: boolean;
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface FetchCoinsParams {
  vs_currency?: string;
  order?: string;
  per_page?: number;
  page?: number;
  sparkline?: boolean;
  price_change_percentage?: string;
  ids?: string;
  category?: string;
}

export interface ChartTimeframe {
  label: string;
  value: "1h" | "24h" | "7d" | "30d" | "90d" | "1y" | "max";
  days: number | "max";
  interval?: "minutely" | "hourly" | "daily";
}

export interface ChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface PricePoint {
  timestamp: number;
  price: number;
  volume?: number;
  market_cap?: number;
}

export interface WebSocketState {
  connected: boolean;
  subscriptions: Set<string>;
  data: Record<string, number | string | object>;
  error: string | null;

  connect: () => void;
  disconnect: () => void;
  subscribe: (symbol: string) => void;
  unsubscribe: (symbol: string) => void;
  getPrice: (symbol: string) => number | null;
}

export interface FearGreedIndex {
  value: number;
  value_classification:
    | "Extreme Fear"
    | "Fear"
    | "Neutral"
    | "Greed"
    | "Extreme Greed";
  timestamp: number;
  time_until_update: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    id: string;
    name: string;
  };
  sentiment?: "positive" | "neutral" | "negative";
  relevantCoins?: string[];
}

export interface DeFiProtocol {
  id: string;
  name: string;
  address: string;
  symbol: string;
  url: string;
  description: string;
  chain: string;
  logo: string;
  audits: string;
  audit_note: string;
  gecko_id: string;
  cmcId: string;
  category: string;
  chains: string[];
  module: string;
  twitter: string;
  language: string;
  audit_links: string[];
  oracles: string[];
  slug: string;
  tvl: number;
  chainTvls: Record<string, number>;
  change_1h: number;
  change_1d: number;
  change_7d: number;
  tokenBreakdowns: Record<string, number>;
  mcap: number;
}

// Simplified coin data interface for components
export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  marketCap: number;
  marketCapRank: number;
  totalVolume: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  circulatingSupply: number;
  maxSupply: number | null;
}
