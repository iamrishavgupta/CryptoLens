"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Flame, Users, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { useMarketData } from "@/hooks/useMarketData";
import Image from "next/image";

interface TrendingStats {
  totalTrending: number;
  avgPriceChange: number;
  topGainer: {
    name: string;
    symbol: string;
    change: number;
  };
  totalSearchVolume: number;
  updatedAt: string;
}

interface TrendingPageClientProps {
  trendingStats: TrendingStats;
}

export function TrendingPageClient({ trendingStats }: TrendingPageClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { coins, isLoading } = useMarketData({ perPage: 100 });

  const formatSearchVolume = (volume: number) => {
  if (volume >= 1e12) return `$${(volume / 1e12).toFixed(2)}T`;
  if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
  if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
  return `$${volume.toLocaleString()}`;
};

  const formatPrice = (price: number | null | undefined) => {
    if (price == null) return "N/A";
    if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(6)}`;
  };

  const formatMarketCap = (cap: number | null | undefined) => {
    if (cap == null) return "N/A";
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
    return `$${cap.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        variant="simplified"
        isMobileMenuOpen={sidebarOpen}
        setIsMobileMenuOpen={setSidebarOpen}
      />
      <div className="w-full px-3 sm:px-4">
  <div className="w-full max-w-[1536px] mx-auto flex">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 p-3 sm:p-5 space-y-4 sm:space-y-6 min-w-0">

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Flame className="h-6 w-6 text-orange-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Trending</p>
                      <p className="text-2xl font-bold">{trendingStats.totalTrending}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Price Change</p>
                      <p className="text-2xl font-bold text-green-500">
                        +{trendingStats.avgPriceChange}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Search Volume</p>
                      <p className="text-2xl font-bold">
                        {formatSearchVolume(trendingStats.totalSearchVolume)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-6 w-6 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Top Gainer</p>
                      <p className="text-lg font-bold">
                        {trendingStats.topGainer.symbol} +{trendingStats.topGainer.change}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trending Coins Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
  <Flame className="h-5 w-5 text-orange-500" />
  <span className="truncate">Trending Coins</span>
</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20 text-muted-foreground">
                    Loading live data...
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-xs text-muted-foreground">
                          <th className="text-left px-6 py-3">#</th>
                          <th className="text-left px-4 py-3">Coin</th>
                          <th className="text-right px-4 py-3">Price</th>
                          <th className="text-right px-4 py-3">24h %</th>
                          <th className="text-right px-4 py-3 hidden md:table-cell">Market Cap</th>
                          <th className="text-right px-4 py-3 hidden lg:table-cell">Volume 24h</th>
                          <th className="text-right px-6 py-3 hidden lg:table-cell">High 24h</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coins.map((coin, index) => {
                          const isPositive = (coin.priceChangePercentage24h ?? 0) >= 0;
                          return (
                            <tr
                              key={coin.id}
                              className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                            >
                              <td className="px-6 py-4 text-sm text-muted-foreground">
                                {coin.marketCapRank || index + 1}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <Image
                                    src={coin.image}
                                    alt={coin.name}
                                    width={32}
                                    height={32}
                                    className="rounded-full"
                                  />
                                  <div>
                                    <p className="text-sm font-medium">{coin.name}</p>
                                    <p className="text-xs text-muted-foreground uppercase">
                                      {coin.symbol}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-right text-sm font-medium">
                                {formatPrice(coin.currentPrice)}
                              </td>
                              <td className="px-4 py-4 text-right">
                                <Badge
                                  variant="outline"
                                  className={`text-xs gap-1 ${
                                    isPositive
                                      ? "text-green-500 border-green-500"
                                      : "text-red-500 border-red-500"
                                  }`}
                                >
                                  {isPositive ? (
                                    <ArrowUpRight className="h-3 w-3" />
                                  ) : (
                                    <ArrowDownRight className="h-3 w-3" />
                                  )}
                                  {Math.abs(coin.priceChangePercentage24h ?? 0).toFixed(2)}%
                                </Badge>
                              </td>
                              <td className="px-4 py-4 text-right text-sm text-muted-foreground hidden md:table-cell">
                                {formatMarketCap(coin.marketCap)}
                              </td>
                              <td className="px-4 py-4 text-right text-sm text-muted-foreground hidden lg:table-cell">
                                {formatMarketCap(coin.totalVolume)}
                              </td>
                              <td className="px-6 py-4 text-right text-sm text-muted-foreground hidden lg:table-cell">
                                {formatPrice(coin.high24h)}
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

          </main>
        </div>
      </div>
    </div>
  );
}