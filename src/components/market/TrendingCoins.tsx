"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { TrendingUp, TrendingDown, Star, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TrendingCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCap: number;
  volume24h: number;
  sparkline: number[];
  rank: number;
}

interface TrendingCoinsProps {
  coins: TrendingCoin[];
  isLoading?: boolean;
  onAddToWatchlist?: (coinId: string) => void;
  onAddToPortfolio?: (coinId: string) => void;
}

export const TrendingCoins: React.FC<TrendingCoinsProps> = ({
  coins,
  isLoading = false,
  onAddToWatchlist,
  onAddToPortfolio,
}) => {
  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  const MiniSparkline: React.FC<{ data: number[]; isPositive: boolean }> = ({
    data,
    isPositive,
  }) => {
    if (!data || data.length === 0) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min;

    const points = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * 60;
        const y = range === 0 ? 15 : 30 - ((value - min) / range) * 30;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <svg width="60" height="30" className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={isPositive ? "#22c55e" : "#ef4444"}
          strokeWidth="1.5"
          className="drop-shadow-sm"
        />
      </svg>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trending</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse w-20" />
                </div>
                <div className="text-right space-y-1">
                  <div className="h-4 bg-muted rounded animate-pulse w-16" />
                  <div className="h-3 bg-muted rounded animate-pulse w-12" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <span>🔥</span>
          Trending
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link
            href="/market/trending"
            className="text-coingecko-green-500 hover:text-coingecko-green-600"
          >
            View All
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {coins.slice(0, 5).map((coin, index) => (
            <div
              key={coin.id}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* Rank */}
              <div className="w-6 text-center">
                <span className="text-sm font-medium text-muted-foreground">
                  {index + 1}
                </span>
              </div>

              {/* Coin Info */}
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="relative w-8 h-8 flex-shrink-0">
                  <Image
                    src={coin.image}
                    alt={coin.name}
                    fill
                    className="rounded-full object-cover"
                    sizes="32px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/coin/${coin.id}`}
                    className="font-medium hover:text-primary transition-colors truncate block"
                  >
                    {coin.name}
                  </Link>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-muted-foreground uppercase">
                      {coin.symbol}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      #{coin.rank}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mini Chart */}
              <div className="hidden sm:block">
                <MiniSparkline
                  data={coin.sparkline}
                  isPositive={coin.priceChangePercentage24h >= 0}
                />
              </div>

              {/* Price Info */}
              <div className="text-right space-y-1 min-w-0">
                <div className="font-medium">
                  {formatCurrency(coin.currentPrice)}
                </div>
                <div className="flex items-center justify-end space-x-1">
                  {coin.priceChangePercentage24h >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-coingecko-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      coin.priceChangePercentage24h >= 0
                        ? "text-coingecko-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {formatPercentage(coin.priceChangePercentage24h)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onAddToWatchlist?.(coin.id)}>
                    <Star className="mr-2 h-4 w-4" />
                    Add to Watchlist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAddToPortfolio?.(coin.id)}>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Add to Portfolio
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/coin/${coin.id}`}>View Details</Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>

        {coins.length > 5 && (
          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/market/trending">View All Trending Coins</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
