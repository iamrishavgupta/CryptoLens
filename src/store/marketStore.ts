import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  marketCap: number;
  marketCapRank: number;
  fullyDilutedValuation: number;
  totalVolume: number;
  high24h: number;
  low24h: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCapChange24h: number;
  marketCapChangePercentage24h: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number | null;
  ath: number;
  athChangePercentage: number;
  athDate: string;
  atl: number;
  atlChangePercentage: number;
  atlDate: string;
  lastUpdated: string;
}

export interface MarketStats {
  totalMarketCap: number;
  totalVolume24h: number;
  marketCapPercentage: { [key: string]: number };
  marketCapChangePercentage24hUsd: number;
  activeCryptocurrencies: number;
  markets: number;
  endedIcos: number;
  ongoingIcos: number;
  upcomingIcos: number;
  updatedAt: number;
}

export interface TrendingCoin {
  id: string;
  coinId: number;
  name: string;
  symbol: string;
  marketCapRank: number;
  thumb: string;
  small: string;
  large: string;
  slug: string;
  priceBtc: number;
  score: number;
}

interface MarketState {
  // Data
  coins: CoinData[];
  trendingCoins: TrendingCoin[];
  globalStats: MarketStats | null;
  fearGreedIndex: number;

  // Loading states
  isLoadingCoins: boolean;
  isLoadingTrending: boolean;
  isLoadingGlobal: boolean;

  // Error states
  coinsError: string | null;
  trendingError: string | null;
  globalError: string | null;

  // Filters and pagination
  currentPage: number;
  perPage: number;
  sortBy: string;
  sortOrder: "asc" | "desc";
  priceFilter: { min: number; max: number } | null;

  // Actions
  setCoins: (coins: CoinData[]) => void;
  setTrendingCoins: (coins: TrendingCoin[]) => void;
  setGlobalStats: (stats: MarketStats) => void;
  setFearGreedIndex: (index: number) => void;

  setCoinsLoading: (loading: boolean) => void;
  setTrendingLoading: (loading: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;

  setCoinsError: (error: string | null) => void;
  setTrendingError: (error: string | null) => void;
  setGlobalError: (error: string | null) => void;

  // Pagination and filtering
  setPage: (page: number) => void;
  setSorting: (sortBy: string, order: "asc" | "desc") => void;
  setPriceFilter: (filter: { min: number; max: number } | null) => void;

  // API actions
  fetchCoins: () => Promise<void>;
  fetchTrendingCoins: () => Promise<void>;
  fetchGlobalStats: () => Promise<void>;
  fetchFearGreedIndex: () => Promise<void>;

  // Utility actions
  getCoinById: (id: string) => CoinData | undefined;
  searchCoins: (query: string) => CoinData[];
  getTopCoins: (limit: number) => CoinData[];
}

export const useMarketStore = create<MarketState>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      coins: [],
      trendingCoins: [],
      globalStats: null,
      fearGreedIndex: 50,

      isLoadingCoins: false,
      isLoadingTrending: false,
      isLoadingGlobal: false,

      coinsError: null,
      trendingError: null,
      globalError: null,

      currentPage: 1,
      perPage: 50,
      sortBy: "market_cap",
      sortOrder: "desc",
      priceFilter: null,

      // Setters
      setCoins: (coins) => set({ coins }),
      setTrendingCoins: (trendingCoins) => set({ trendingCoins }),
      setGlobalStats: (globalStats) => set({ globalStats }),
      setFearGreedIndex: (fearGreedIndex) => set({ fearGreedIndex }),

      setCoinsLoading: (isLoadingCoins) => set({ isLoadingCoins }),
      setTrendingLoading: (isLoadingTrending) => set({ isLoadingTrending }),
      setGlobalLoading: (isLoadingGlobal) => set({ isLoadingGlobal }),

      setCoinsError: (coinsError) => set({ coinsError }),
      setTrendingError: (trendingError) => set({ trendingError }),
      setGlobalError: (globalError) => set({ globalError }),

      setPage: (currentPage) => set({ currentPage }),
      setSorting: (sortBy, sortOrder) => set({ sortBy, sortOrder }),
      setPriceFilter: (priceFilter) => set({ priceFilter }),

      // API actions
      fetchCoins: async () => {
        const { setCoinsLoading, setCoinsError, setCoins } = get();
        try {
          setCoinsLoading(true);
          setCoinsError(null);
          const res = await fetch("/api/market?per_page=100&page=1");
          const json = await res.json();
          if (json.success) {
            setCoins(json.data);
          } else {
            throw new Error(json.error || "Failed to fetch coins");
          }
        } catch (error) {
          setCoinsError(
            error instanceof Error ? error.message : "Failed to fetch coins"
          );
        } finally {
          setCoinsLoading(false);
        }
      },

      fetchTrendingCoins: async () => {
        const { setTrendingLoading, setTrendingError, setTrendingCoins } = get();
        try {
          setTrendingLoading(true);
          setTrendingError(null);
          const res = await fetch(
            "https://api.coingecko.com/api/v3/search/trending",
            {
              headers: {
                Accept: "application/json",
                "x-cg-demo-api-key":
                  process.env.NEXT_PUBLIC_COINGECKO_API_KEY || "",
              },
            }
          );
          const json = await res.json();
          const trending =
            json.coins?.map((item: any) => ({
              id: item.item.id,
              coinId: item.item.coin_id,
              name: item.item.name,
              symbol: item.item.symbol,
              marketCapRank: item.item.market_cap_rank,
              thumb: item.item.thumb,
              small: item.item.small,
              large: item.item.large,
              slug: item.item.slug,
              priceBtc: item.item.price_btc,
              score: item.item.score,
            })) || [];
          setTrendingCoins(trending);
        } catch (error) {
          setTrendingError(
            error instanceof Error
              ? error.message
              : "Failed to fetch trending coins"
          );
        } finally {
          setTrendingLoading(false);
        }
      },

      fetchGlobalStats: async () => {
        const { setGlobalLoading, setGlobalError, setGlobalStats } = get();
        try {
          setGlobalLoading(true);
          setGlobalError(null);
          const res = await fetch("/api/market/global");
          const json = await res.json();
          if (json.success) {
            setGlobalStats(json.data);
          } else {
            throw new Error(json.error || "Failed to fetch global stats");
          }
        } catch (error) {
          setGlobalError(
            error instanceof Error
              ? error.message
              : "Failed to fetch global stats"
          );
        } finally {
          setGlobalLoading(false);
        }
      },

      fetchFearGreedIndex: async () => {
        try {
          const res = await fetch(
            "https://api.alternative.me/fng/?limit=1&format=json"
          );
          const json = await res.json();
          const value = parseInt(json?.data?.[0]?.value || "50");
          set({ fearGreedIndex: value });
        } catch (error) {
          console.error("Failed to fetch fear & greed index:", error);
        }
      },

      // Utility functions
      getCoinById: (id: string) => {
        const { coins } = get();
        return coins.find((coin) => coin.id === id);
      },

      searchCoins: (query: string) => {
        const { coins } = get();
        const lowercaseQuery = query.toLowerCase();
        return coins.filter(
          (coin) =>
            coin.name.toLowerCase().includes(lowercaseQuery) ||
            coin.symbol.toLowerCase().includes(lowercaseQuery)
        );
      },

      getTopCoins: (limit: number) => {
        const { coins } = get();
        return coins
          .sort((a, b) => a.marketCapRank - b.marketCapRank)
          .slice(0, limit);
      },
    })),
    { name: "market-store" }
  )
);