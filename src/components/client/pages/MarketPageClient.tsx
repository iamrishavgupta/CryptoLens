"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Flame, ArrowUpRight, ArrowDownRight, Search, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMarketData } from "@/hooks/useMarketData";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface MockGlobalData {
  totalMarketCap: number;
  totalVolume: number;
  marketCapChange24h: number;
  bitcoinDominance: number;
  ethereumDominance: number;
  fearGreedIndex: {
    value: number;
    classification: string;
  };
}

interface MarketPageClientProps {
  globalData: MockGlobalData;
}

export function MarketPageClient({ globalData }: MarketPageClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { coins, isLoading } = useMarketData({ perPage: 100 });

  const formatLargeNumber = (num: number | null | undefined) => {
    if (num == null) return "N/A";
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  const formatPrice = (price: number | null | undefined) => {
    if (price == null) return "N/A";
    if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(6)}`;
  };

  const isMarketPositive = globalData.marketCapChange24h >= 0;

  const filteredCoins = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(search.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header
        variant="simplified"
        isMobileMenuOpen={sidebarOpen}
        setIsMobileMenuOpen={setSidebarOpen}
      />
      <div className="w-full px-3 md:px-4">
  <div className="w-full max-w-[1536px] mx-auto flex">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 p-3 sm:p-5 min-w-0">
            <div className="space-y-6">

              {/* Header */}
              <div className="flex flex-col gap-3">
                <div>
                  <h1 className="text-3xl font-bold">Cryptocurrency Market</h1>
                  <p className="text-muted-foreground mt-1">
                    Track prices, market cap, and trading volume of top cryptocurrencies
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Link href="/market/trending">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Flame className="h-4 w-4" />
                      Trending Coins
                    </Button>
                  </Link>
                  <div className="relative lg:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search cryptocurrencies..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 pr-9"
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Market Overview Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Market Cap
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-xl sm:text-2xl font-bold">
            
                        {formatLargeNumber(globalData.totalMarketCap)}
                      </span>
                      <div className={`flex items-center space-x-1 ${isMarketPositive ? "text-green-500" : "text-red-500"}`}>
                        {isMarketPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        <span className="text-sm font-medium">
                          {isMarketPositive ? "+" : ""}{globalData.marketCapChange24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      24h Volume
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <span className="text-2xl font-bold">
                      {formatLargeNumber(globalData.totalVolume)}
                    </span>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      BTC Dominance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {globalData.bitcoinDominance.toFixed(1)}%
                      </span>
                      <Badge variant="secondary">
                        ETH {globalData.ethereumDominance.toFixed(1)}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Fear & Greed Index
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                   <div className="flex flex-col gap-1">
  <span className="text-xl sm:text-2xl font-bold">
    {globalData.fearGreedIndex.value}
  </span>
  <Badge
    className={
      globalData.fearGreedIndex.value > 75
        ? "bg-green-100 text-green-800 w-fit"
        : globalData.fearGreedIndex.value > 50
        ? "bg-yellow-100 text-yellow-800 w-fit"
        : "bg-red-100 text-red-800 w-fit"
    }
  >
    {globalData.fearGreedIndex.classification}
  </Badge>
</div>
                  </CardContent>
                </Card>
              </div>

              {/* Market Table */}
              <Card>
                <CardHeader>
                  <CardTitle>All Cryptocurrencies</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-20 text-muted-foreground">
                      Loading live market data...
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
                            <th className="text-right px-6 py-3 hidden lg:table-cell">Low 24h</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCoins.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="text-center py-20 text-muted-foreground">
                                No coins found for &quot;{search}&quot;
                              </td>
                            </tr>
                          ) : (
                            filteredCoins.map((coin, index) => {
                              const isPositive = (coin.priceChangePercentage24h ?? 0) >= 0;
                              return (
                                <tr
                                  key={coin.id}
                                  className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                                  onClick={() => router.push(`/coin/${coin.id}`)}
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
                                        <p className="text-xs text-muted-foreground uppercase">{coin.symbol}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4 text-right text-sm font-medium">
                                    {formatPrice(coin.currentPrice)}
                                  </td>
                                  <td className="px-4 py-4 text-right">
                                    <Badge
                                      variant="outline"
                                      className={`text-xs gap-1 ${isPositive ? "text-green-500 border-green-500" : "text-red-500 border-red-500"}`}
                                    >
                                      {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                      {Math.abs(coin.priceChangePercentage24h ?? 0).toFixed(2)}%
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-4 text-right text-sm text-muted-foreground hidden md:table-cell">
                                    {formatLargeNumber(coin.marketCap)}
                                  </td>
                                  <td className="px-4 py-4 text-right text-sm text-muted-foreground hidden lg:table-cell">
                                    {formatLargeNumber(coin.totalVolume)}
                                  </td>
                                  <td className="px-6 py-4 text-right text-sm text-muted-foreground hidden lg:table-cell">
                                    {formatPrice(coin.high24h)}
                                  </td>
                                  <td className="px-6 py-4 text-right text-sm text-muted-foreground hidden lg:table-cell">
                                    {formatPrice(coin.low24h)}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}