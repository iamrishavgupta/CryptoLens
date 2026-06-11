"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

interface MarketDataParams {
  page?: number;
  perPage?: number;
  currency?: string;
  order?: string;
  sparkline?: boolean;
  priceChangePercentage?: string;
}

interface CoinData {
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
  high24h: number;
  low24h: number;
  ath: number;
  athChangePercentage: number;
  athDate: string;
  atl: number;
  atlChangePercentage: number;
  atlDate: string;
  lastUpdated: string;
}

interface GlobalMarketData {
  totalMarketCap: number;
  totalVolume: number;
  marketCapChange24h: number;
  activeCryptocurrencies: number;
  markets: number;
  bitcoinDominance: number;
  ethereumDominance: number;
  altcoinDominance: number;
  volumeToMarketCapRatio: number;
  fearGreedIndex: {
    value: number;
    classification: string;
    timestamp: string;
  };
  marketCapPercentage: Record<string, number>;
  lastUpdated: string;
}

interface MarketResponse {
  success: boolean;
  data: CoinData[];
  pagination: {
    page: number;
    perPage: number;
    total: number;
  };
  metadata: {
    currency: string;
    order: string;
    lastUpdated: string;
  };
}

interface GlobalMarketResponse {
  success: boolean;
  data: GlobalMarketData;
  metadata: {
    currency: string;
    source: string;
    cacheTime: number;
    lastUpdated: string;
  };
}

// Fetch market data
async function fetchMarketData(
  params: MarketDataParams
): Promise<MarketResponse> {
  const searchParams = new URLSearchParams({
    page: (params.page || 1).toString(),
    per_page: (params.perPage || 100).toString(),
    currency: params.currency || "usd",
    order: params.order || "market_cap_desc",
    sparkline: (params.sparkline || false).toString(),
    price_change_percentage: params.priceChangePercentage || "24h",
  });

  const response = await fetch(`/api/market?${searchParams}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch market data: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch market data");
  }

  return data;
}

// Fetch global market data
async function fetchGlobalMarketData(
  currency = "usd"
): Promise<GlobalMarketResponse> {
  const response = await fetch(`/api/market/global?currency=${currency}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch global market data: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch global market data");
  }

  return data;
}

// Hook for fetching market data with pagination
export function useMarketData(params: MarketDataParams = {}) {
  const { data, error, isLoading, isError, refetch } = useQuery({
    queryKey: ["marketData", params],
    queryFn: () => fetchMarketData(params),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 60 * 1000, // Refetch every minute
    refetchIntervalInBackground: false,
  });

  return {
    coins: data?.data || [],
    pagination: data?.pagination,
    metadata: data?.metadata,
    isLoading,
    isError,
    error,
    refetch,
  };
}

// Hook for infinite scrolling market data
export function useInfiniteMarketData(params: MarketDataParams = {}) {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["infiniteMarketData", params],
    queryFn: ({ pageParam }) => fetchMarketData({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (
        lastPage.pagination.page * lastPage.pagination.perPage >=
        lastPage.pagination.total
      ) {
        return undefined;
      }
      return lastPage.pagination.page + 1;
    },
    staleTime: 60 * 1000, // 1 minute
  });

  // Flatten all pages into a single array
  const coins = data?.pages.flatMap((page) => page.data) || [];

  return {
    coins,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  };
}

// Hook for global market data
export function useGlobalMarketData(currency = "usd") {
  const { data, error, isLoading, isError, refetch } = useQuery({
    queryKey: ["globalMarketData", currency],
    queryFn: () => fetchGlobalMarketData(currency),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    refetchIntervalInBackground: false,
  });

  return {
    globalData: data?.data,
    metadata: data?.metadata,
    isLoading,
    isError,
    error,
    refetch,
  };
}

// Hook for searching coins
export function useCoinSearch() {
  const [searchResults, setSearchResults] = useState<CoinData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const searchCoins = useCallback(
    async (query: string): Promise<CoinData[]> => {
      if (!query.trim()) {
        setSearchResults([]);
        return [];
      }

      setIsSearching(true);
      setSearchError(null);

      try {
        // For now, search through the first 250 coins
        // In a real app, you'd have a dedicated search endpoint
        const response = await fetchMarketData({ perPage: 250 });
        const filtered = response.data.filter(
          (coin) =>
            coin.name.toLowerCase().includes(query.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(query.toLowerCase())
        );

        setSearchResults(filtered);
        return filtered;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Search failed";
        setSearchError(errorMessage);
        setSearchResults([]);
        return [];
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
  }, []);

  return {
    searchResults,
    isSearching,
    searchError,
    searchCoins,
    clearSearch,
  };
}

// Hook for real-time price updates (WebSocket simulation)
export function useRealTimePrices(coinIds: string[]) {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    if (coinIds.length === 0) return;

    // Simulate real-time price updates
    const interval = setInterval(() => {
      setPrices((prevPrices) => {
        const newPrices = { ...prevPrices };

        coinIds.forEach((coinId) => {
          const currentPrice = newPrices[coinId] || 100; // Default price
          // Simulate price movement (-2% to +2%)
          const change = (Math.random() - 0.5) * 0.04;
          newPrices[coinId] = currentPrice * (1 + change);
        });

        return newPrices;
      });

      setLastUpdated(new Date());
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [coinIds]);

  return {
    prices,
    lastUpdated,
  };
}

// Hook for favorite coins
export function useFavoriteCoins() {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // Load favorites from localStorage
    const saved = localStorage.getItem("favorite-coins");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to parse favorite coins:", error);
      }
    }
  }, []);

  const addFavorite = useCallback((coinId: string) => {
    setFavorites((prev) => {
      if (prev.includes(coinId)) return prev;
      const updated = [...prev, coinId];
      localStorage.setItem("favorite-coins", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFavorite = useCallback((coinId: string) => {
    setFavorites((prev) => {
      const updated = prev.filter((id) => id !== coinId);
      localStorage.setItem("favorite-coins", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleFavorite = useCallback(
    (coinId: string) => {
      if (favorites.includes(coinId)) {
        removeFavorite(coinId);
      } else {
        addFavorite(coinId);
      }
    },
    [favorites, addFavorite, removeFavorite]
  );

  const isFavorite = useCallback(
    (coinId: string) => {
      return favorites.includes(coinId);
    },
    [favorites]
  );

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
  };
}
