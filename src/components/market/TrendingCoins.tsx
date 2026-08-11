"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Flame, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

const formatPrice = (price: number | null | undefined) => {
  if (price == null) return "N/A";
  if (price >= 1000)
    return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  return `$${price.toFixed(6)}`;
};

const formatLargeNumber = (num: number | null | undefined) => {
  if (num == null) return "N/A";
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  return `$${num.toLocaleString()}`;
};

export const TrendingCoins: React.FC<TrendingCoinsProps> = ({
  coins,
  isLoading = false,
}) => {
  const router = useRouter();

  return (
    <Card className="w-full max-w-full overflow-hidden rounded-none border-0 shadow-none sm:rounded-lg sm:border sm:shadow-sm">
      <CardHeader className="hidden flex-row items-center justify-between px-3 sm:flex sm:p-6">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Flame className="h-5 w-5 text-orange-500" />
          <span className="truncate">Trending Coins</span>
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link
            href="/market"
            className="text-xs text-muted-foreground"
          >
            View All
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            Loading live data...
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="w-full table-fixed sm:table-auto">
              <thead>
                <tr className="border-b-0 sm:border-b text-[10px] sm:text-xs text-muted-foreground">
                  <th className="w-[7%] sm:w-auto text-left px-1 sm:px-6 py-3">#</th>
                  <th className="w-[27%] sm:w-auto text-left px-1 sm:px-4 py-3">Coin</th>
                  <th className="w-[24%] sm:w-auto text-right px-1 sm:px-4 py-3">Price</th>
                  <th className="w-[18%] sm:w-auto text-right px-1 sm:px-4 py-3">24H</th>
                  <th className="w-[24%] sm:w-auto text-right px-1 sm:px-4 py-3">
                    Market Cap
                  </th>
                  <th className="text-right px-4 sm:px-6 py-3 hidden lg:table-cell">
                    Volume 24h
                  </th>
                </tr>
              </thead>
              <tbody>
                {coins.map((coin, index) => {
                  const isPositive = (coin.priceChangePercentage24h ?? 0) >= 0;
                  return (
                    <tr
                      key={coin.id}
                      className="border-b-0 sm:border-b hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/coin/${coin.id}`)}
                    >
                      <td className="px-1 sm:px-6 py-4 text-[11px] sm:text-sm text-muted-foreground">
                        {coin.rank || index + 1}
                      </td>
                      <td className="px-1 sm:px-4 py-4">
                        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
                          <Image
                            src={coin.image}
                            alt={coin.name}
                            width={32}
                            height={32}
                            className="h-6 w-6 sm:h-8 sm:w-8 rounded-full flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-medium truncate uppercase sm:normal-case">
                              <span className="sm:hidden">{coin.symbol}</span>
                              <span className="hidden sm:inline">{coin.name}</span>
                            </p>
                            <p className="hidden sm:block text-xs text-muted-foreground uppercase">
                              {coin.symbol}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-1 sm:px-4 py-4 text-right text-[11px] sm:text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                        {formatPrice(coin.currentPrice)}
                      </td>
                      <td className="px-1 sm:px-4 py-4 text-right">
                        <div
                          className={`flex items-center justify-end gap-0.5 sm:gap-1 text-[11px] sm:text-sm font-medium whitespace-nowrap ${
                            isPositive ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {isPositive ? (
                            <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                          )}
                          {Math.abs(coin.priceChangePercentage24h ?? 0).toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-1 sm:px-4 py-4 text-right text-[11px] sm:text-sm text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                        {formatLargeNumber(coin.marketCap)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right text-sm text-muted-foreground hidden lg:table-cell">
                        {formatLargeNumber(coin.volume24h)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
