"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PriceChart } from "@/components/market/PriceChart";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  TrendingUp,
  TrendingDown,
  Star,
  Plus,
  ExternalLink,
  Globe,
  Twitter,
  Github,
  MessageCircle,
  BookOpen,
  Share2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CoinDetailProps {
  coin: {
    id: string;
    name: string;
    symbol: string;
    image?: {
      large?: string;
    };
    market_data?: {
      current_price?: { usd?: number };
      price_change_24h?: number;
      price_change_percentage_24h?: number;
      market_cap?: { usd?: number };
      total_volume?: { usd?: number };
      market_cap_rank?: number;
      high_24h?: { usd?: number };
      low_24h?: { usd?: number };
      ath?: { usd?: number };
      ath_change_percentage?: { usd?: number };
      ath_date?: { usd?: string };
      atl?: { usd?: number };
      atl_change_percentage?: { usd?: number };
      atl_date?: { usd?: string };
      circulating_supply?: number;
      max_supply?: number;
    };
    links?: {
      homepage?: string[];
      whitepaper?: string;
      twitter_screen_name?: string;
      repos_url?: {
        github?: string[];
      };
      subreddit_url?: string;
    };
    description?: {
      en?: string;
    };
  };
}

export function CoinDetailClient({ coin }: CoinDetailProps) {
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  const marketData = coin.market_data;
  const currentPrice = marketData?.current_price?.usd || 0;
  const priceChange24h = marketData?.price_change_24h || 0;
  const priceChangePercentage24h = marketData?.price_change_percentage_24h || 0;
  const isPositive = priceChangePercentage24h >= 0;

  const formatPrice = (price: number) => {
    if (price < 1) return `$${price.toFixed(6)}`;
    if (price < 100) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toLocaleString()}`;
  };

  const formatSupply = (supply: number) => {
    if (supply >= 1e9) return `${(supply / 1e9).toFixed(2)}B`;
    if (supply >= 1e6) return `${(supply / 1e6).toFixed(2)}M`;
    if (supply >= 1e3) return `${(supply / 1e3).toFixed(2)}K`;
    return supply.toLocaleString();
  };

  const handleWatchlistToggle = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsWatchlisted(!isWatchlisted);
    setLoading(false);
  };

  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const trendColor = isPositive ? "text-green-600" : "text-red-600";

  const links = coin.links || {};
  const description = coin.description?.en || "";

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative w-12 h-12">
            <Image
              src={coin.image?.large || "/placeholder-coin.png"}
              alt={coin.name}
              fill
              className="rounded-full object-cover"
              priority
            />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold">{coin.name}</h1>
              <Badge variant="secondary" className="text-lg">
                {coin.symbol?.toUpperCase()}
              </Badge>
              {marketData?.market_cap_rank && (
                <Badge variant="outline">
                  Rank #{marketData.market_cap_rank}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-3xl font-bold">
                {formatPrice(currentPrice)}
              </span>
              <div className={cn("flex items-center space-x-1", trendColor)}>
                <TrendIcon className="w-5 h-5" />
                <span className="font-semibold text-lg">
                  {isPositive ? "+" : ""}
                  {priceChangePercentage24h.toFixed(2)}%
                </span>
              </div>
            </div>
            <p className={cn("text-sm mt-1", trendColor)}>
              {isPositive ? "+" : ""}${priceChange24h.toFixed(2)} (24h)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={handleWatchlistToggle}
            disabled={loading}
            variant={isWatchlisted ? "default" : "outline"}
            className="flex items-center space-x-2"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Star
                className={cn("w-4 h-4", isWatchlisted && "fill-current")}
              />
            )}
            <span>{isWatchlisted ? "Watchlisted" : "Add to Watchlist"}</span>
          </Button>
          <Button variant="outline" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <PriceChart
            coinId={coin.id}
            symbol={coin.symbol}
            currentPrice={currentPrice}
            priceChange24h={priceChange24h}
            priceChangePercentage24h={priceChangePercentage24h}
            height={400}
          />
        </div>

        {/* Market Statistics */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Market Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="font-semibold text-lg">
                    {formatLargeNumber(marketData?.market_cap?.usd || 0)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">24h Volume</p>
                  <p className="font-semibold text-lg">
                    {formatLargeNumber(marketData?.total_volume?.usd || 0)}
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground">24h High</p>
                  <p className="font-semibold">
                    {formatPrice(marketData?.high_24h?.usd || 0)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">24h Low</p>
                  <p className="font-semibold">
                    {formatPrice(marketData?.low_24h?.usd || 0)}
                  </p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground">All-Time High</p>
                  <div>
                    <p className="font-semibold">
                      {formatPrice(marketData?.ath?.usd || 0)}
                    </p>
                    <p
                      className={cn(
                        "text-xs",
                        (marketData?.ath_change_percentage?.usd ?? 0) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      )}
                    >
                      {marketData?.ath_change_percentage?.usd?.toFixed(2)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {marketData?.ath_date?.usd &&
                        new Date(marketData.ath_date.usd).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">All-Time Low</p>
                  <div>
                    <p className="font-semibold">
                      {formatPrice(marketData?.atl?.usd || 0)}
                    </p>
                    <p
                      className={cn(
                        "text-xs",
                        (marketData?.atl_change_percentage?.usd ?? 0) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      )}
                    >
                      +{marketData?.atl_change_percentage?.usd?.toFixed(2)}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {marketData?.atl_date?.usd &&
                        new Date(marketData.atl_date.usd).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-muted-foreground">
                    Circulating Supply
                  </p>
                  <p className="font-semibold">
                    {formatSupply(marketData?.circulating_supply || 0)}{" "}
                    {coin.symbol?.toUpperCase()}
                  </p>
                </div>

                {marketData?.max_supply && (
                  <div>
                    <p className="text-sm text-muted-foreground">Max Supply</p>
                    <p className="font-semibold">
                      {formatSupply(marketData.max_supply)}{" "}
                      {coin.symbol?.toUpperCase()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card>
            <CardHeader>
              <CardTitle>Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {links.homepage?.[0] && (
                <Link
                  href={links.homepage[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm hover:underline"
                >
                  <Globe className="w-4 h-4" />
                  <span>Website</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}

              {links.whitepaper && (
                <Link
                  href={links.whitepaper}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm hover:underline"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Whitepaper</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}

              {links.twitter_screen_name && (
                <Link
                  href={`https://twitter.com/${links.twitter_screen_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm hover:underline"
                >
                  <Twitter className="w-4 h-4" />
                  <span>Twitter</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}

              {links.repos_url?.github?.[0] && (
                <Link
                  href={links.repos_url.github[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm hover:underline"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}

              {links.subreddit_url && (
                <Link
                  href={links.subreddit_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-sm hover:underline"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Reddit</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Description */}
      {description && (
        <Card>
          <CardHeader>
            <CardTitle>About {coin.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </CardContent>
        </Card>
      )}

      {/* Risk Warning */}
      <Card className="border-yellow-200 dark:border-yellow-800">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">
                Investment Risk Warning
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Cryptocurrency investments are subject to high market risk.
                Please make your investments cautiously. This platform will not
                be responsible for any of your investment losses.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
