"use client";

import React, { useState, useEffect } from "react";
import { TrendingCoins } from "@/components/market/TrendingCoins";
import { FeaturedNews } from "@/components/news/FeaturedNews";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Star, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface MockTrendingCoin {
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

interface MockNewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  publishedAt: string;
  imageUrl: string;
  sourceUrl: string;
  source: string;
  category:
    | "bitcoin"
    | "ethereum"
    | "defi"
    | "nft"
    | "regulation"
    | "market"
    | "technology";
  readTime: number;
  tags: string[];
}

interface MockPortfolio {
  id: string;
  name: string;
  totalValue: number;
  totalCost: number;
  totalPnL: number;
  totalPnLPercentage: number;
  dayChange: number;
  dayChangePercentage: number;
  holdings: Array<{
    coinId: string;
    symbol: string;
    name: string;
    amount: number;
    currentValue: number;
    allocation: number;
    priceChange24h: number;
  }>;
}

interface HomePageClientProps {
  trendingCoins: MockTrendingCoin[];
  newsArticles: MockNewsArticle[];
  portfolio: MockPortfolio;
}

export function HomePageClient({
  trendingCoins,
  newsArticles,
}: HomePageClientProps) {
  const [topGainers, setTopGainers] = useState<any[]>([]);
  const [topTrending, setTopTrending] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/market?per_page=100&page=1")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          // Top 3 gainers (highest 24h % change)
          const gainers = [...json.data]
            .filter((c: any) => c.priceChangePercentage24h != null)
            .sort((a: any, b: any) => b.priceChangePercentage24h - a.priceChangePercentage24h)
            .slice(0, 3);
          setTopGainers(gainers);

          // Top 3 trending by volume
          const trending = [...json.data]
            .filter((c: any) => c.totalVolume != null)
            .sort((a: any, b: any) => b.totalVolume - a.totalVolume)
            .slice(0, 3);
          setTopTrending(trending);
        }
      })
      .catch(() => {});
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(4)}`;
  };

  return (
    <>
      {/* Hero Section with Trending & Hot Lists */}
      <section className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Trending by Volume */}
          <Card className="flex-1 rounded-none border-x-0 shadow-none sm:rounded-lg sm:border sm:shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
                🔥 Trending
                <Link href="/market" className="ml-auto">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                    View more
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 gap-2">
                {topTrending.length === 0
                  ? [1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg">
                        <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                        <div className="flex-1 h-4 bg-muted rounded animate-pulse" />
                        <div className="w-12 h-4 bg-muted rounded animate-pulse" />
                      </div>
                    ))
                  : topTrending.map((coin, index) => {
                      const isPos = coin.priceChangePercentage24h >= 0;
                      return (
                        <Link key={coin.id} href={`/coin/${coin.id}`}>
                          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                            <span className="text-sm font-medium text-muted-foreground w-4 text-center">
                              {index + 1}
                            </span>
                            <Image
                              src={coin.image}
                              alt={coin.name}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium truncate">{coin.name}</div>
                              <div className="text-xs text-muted-foreground uppercase">{coin.symbol}</div>
                            </div>
                            <Badge
                              variant="outline"
                              className={`text-xs gap-1 ${isPos ? "text-green-500 border-green-500" : "text-red-500 border-red-500"}`}
                            >
                              {isPos ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                              {Math.abs(coin.priceChangePercentage24h).toFixed(1)}%
                            </Badge>
                          </div>
                        </Link>
                      );
                    })}
              </div>
            </CardContent>
          </Card>

          {/* Hot — Top Gainers */}
          <Card className="flex-1 rounded-none border-x-0 shadow-none sm:rounded-lg sm:border sm:shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Star className="h-4 w-4 md:h-5 md:w-5 text-yellow-500" />
                ⭐ Hot
                <Link href="/market" className="ml-auto">
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                    View more
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 gap-2">
                {topGainers.length === 0
                  ? [1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg">
                        <div className="w-4 h-4 bg-muted rounded animate-pulse" />
                        <div className="flex-1 h-4 bg-muted rounded animate-pulse" />
                        <div className="w-12 h-4 bg-muted rounded animate-pulse" />
                      </div>
                    ))
                  : topGainers.map((coin, index) => (
                      <Link key={coin.id} href={`/coin/${coin.id}`}>
                        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                          <span className="text-sm font-medium text-muted-foreground w-4 text-center">
                            {index + 1}
                          </span>
                          <Image
                            src={coin.image}
                            alt={coin.name}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{coin.name}</div>
                            <div className="text-xs text-muted-foreground uppercase">{coin.symbol}</div>
                          </div>
                          <Badge variant="outline" className="text-xs text-green-500 border-green-500 gap-1">
                            <ArrowUpRight className="h-3 w-3" />
                            {coin.priceChangePercentage24h.toFixed(1)}%
                          </Badge>
                        </div>
                      </Link>
                    ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trending Coins List */}
        <div className="lg:col-span-2">
          <TrendingCoins
            coins={trendingCoins}
            isLoading={trendingCoins.length === 0}
          />
        </div>

        {/* News */}
        <div className="lg:col-span-1">
          <FeaturedNews />
        </div>
      </div>
    </>
  );
}