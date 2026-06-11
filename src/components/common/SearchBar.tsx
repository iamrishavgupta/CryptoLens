/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  priceChangePercentage24h: number;
  marketCapRank: number;
  type: "coin" | "exchange" | "nft" | "defi";
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  variant?: "default" | "compact";
  showRecentSearches?: boolean;
  autoFocus?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onResultSelect?: (result: SearchResult) => void;
}

// Mock search results for demonstration
const MOCK_RESULTS: SearchResult[] = [
  {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    image: "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png",
    currentPrice: 43250.45,
    priceChangePercentage24h: 2.45,
    marketCapRank: 1,
    type: "coin",
  },
  {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    image:
      "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png",
    currentPrice: 2385.67,
    priceChangePercentage24h: -1.23,
    marketCapRank: 2,
    type: "coin",
  },
  {
    id: "binancecoin",
    symbol: "bnb",
    name: "BNB",
    image:
      "https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
    currentPrice: 315.82,
    priceChangePercentage24h: 0.89,
    marketCapRank: 4,
    type: "coin",
  },
  {
    id: "solana",
    symbol: "sol",
    name: "Solana",
    image:
      "https://coin-images.coingecko.com/coins/images/4128/large/solana.png",
    currentPrice: 98.45,
    priceChangePercentage24h: 5.67,
    marketCapRank: 5,
    type: "coin",
  },
];

const TRENDING_SEARCHES = [
  "Bitcoin",
  "Ethereum",
  "Solana",
  "Dogecoin",
  "Cardano",
];

export function SearchBar({
  placeholder = "Search cryptocurrencies, NFTs, DeFi...",
  className,
  variant = "default",
  showRecentSearches = true,
  autoFocus = false,
  value,
  onChange,
  onResultSelect,
}: SearchBarProps) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Update internal state when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setQuery(value);
    }
  }, [value]);

  const handleQueryChange = (newQuery: string) => {
    setQuery(newQuery);
    if (onChange) {
      onChange(newQuery);
    }
  };

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("crypto-search-history");
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse search history:", e);
        }
      }
    }
  }, []);

  // Mock search function - replace with real API call
  const searchCoins = async (searchQuery: string): Promise<SearchResult[]> => {
    if (!searchQuery.trim()) return [];

    return MOCK_RESULTS.filter(
      (coin) =>
        coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.length > 0) {
        setLoading(true);
        try {
          const searchResults = await searchCoins(query);
          setResults(searchResults);
          setShowResults(true);
        } catch (error) {
          console.error("Search failed:", error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
      setSelectedIndex(-1);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!showResults) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : results.length - 1
          );
          break;
        case "Enter":
          event.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultSelect(results[selectedIndex]);
          }
          break;
        case "Escape":
          setShowResults(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showResults, results, selectedIndex]);

  const handleResultSelect = (result: SearchResult) => {
    // Add to recent searches
    const newRecentSearches = [
      result.name,
      ...recentSearches.filter((item) => item !== result.name),
    ].slice(0, 5);

    setRecentSearches(newRecentSearches);
    localStorage.setItem(
      "crypto-search-history",
      JSON.stringify(newRecentSearches)
    );

    // Clear search
    handleQueryChange("");
    setResults([]);
    setShowResults(false);
    setSelectedIndex(-1);

    // Handle result selection
    if (onResultSelect) {
      onResultSelect(result);
    } else {
      // Default navigation
      router.push(`/coin/${result.id}`);
    }
  };

  const handleTrendingClick = (trend: string) => {
    handleQueryChange(trend);
    inputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("crypto-search-history");
  };

  const formatPrice = (price: number) => {
    if (price < 1) return `$${price.toFixed(6)}`;
    if (price < 100) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  };

  const getTypeColor = (type: SearchResult["type"]) => {
    switch (type) {
      case "coin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "defi":
        return "bg-coingecko-green-100 text-coingecko-green-800 dark:bg-coingecko-green-900 dark:text-coingecko-green-200";
      case "nft":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "exchange":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => {
            if (query || showRecentSearches) {
              setShowResults(true);
            }
          }}
          autoFocus={autoFocus}
          className={cn("pl-10 pr-10", variant === "compact" && "h-9")}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              handleQueryChange("");
              setResults([]);
              setShowResults(false);
              inputRef.current?.focus();
            }}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {showResults && (
        <Card
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-hidden"
        >
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">
                  Searching...
                </p>
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {results.map((result, index) => {
                  const isPositive = result.priceChangePercentage24h >= 0;
                  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={result.id}
                      onClick={() => handleResultSelect(result)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 hover:bg-muted transition-colors text-left",
                        isSelected && "bg-muted"
                      )}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="relative w-8 h-8 flex-shrink-0">
                          <Image
                            src={result.image}
                            alt={result.name}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="font-semibold text-sm truncate">
                              {result.name}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {result.symbol.toUpperCase()}
                            </Badge>
                            <Badge
                              className={cn(
                                "text-xs",
                                getTypeColor(result.type)
                              )}
                            >
                              {result.type.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Rank #{result.marketCapRank}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium">
                          {formatPrice(result.currentPrice)}
                        </p>
                        <div
                          className={cn(
                            "flex items-center text-xs",
                            isPositive
                              ? "text-coingecko-green-600"
                              : "text-red-600"
                          )}
                        >
                          <TrendIcon className="w-3 h-3 mr-1" />
                          {Math.abs(result.priceChangePercentage24h).toFixed(2)}
                          %
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : query ? (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No results found for &quot;{query}&quot;
                </p>
              </div>
            ) : (
              <div className="p-4">
                {/* Recent Searches */}
                {showRecentSearches && recentSearches.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground">
                        Recent
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearRecentSearches}
                        className="h-6 text-xs"
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleTrendingClick(search)}
                          className="flex items-center space-x-2 w-full p-2 hover:bg-muted rounded text-left transition-colors"
                        >
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{search}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Searches */}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Trending
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING_SEARCHES.map((trend) => (
                      <button
                        key={trend}
                        onClick={() => handleTrendingClick(trend)}
                        className="px-3 py-1 bg-muted hover:bg-muted/80 rounded-full text-sm transition-colors"
                      >
                        {trend}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
