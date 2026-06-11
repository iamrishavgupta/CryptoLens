"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Star, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { CoinData } from "@/types/market";

interface CoinCardProps {
  coin: CoinData;
  variant?: "default" | "compact" | "detailed";
  showActions?: boolean;
  className?: string;
}

export function CoinCard({
  coin,
  variant = "default",
  showActions = false,
  className,
}: CoinCardProps) {
  const isPositive = coin.priceChange24h >= 0;
  const priceChangeColor = isPositive
    ? "text-coingecko-green-600"
    : "text-red-600";
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  const formatPrice = (price: number) => {
    if (price < 1) return `$${price.toFixed(6)}`;
    if (price < 100) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`;
    return `$${marketCap.toLocaleString()}`;
  };

  if (variant === "compact") {
    return (
      <Card
        className={cn(
          "hover:shadow-md transition-shadow cursor-pointer",
          className
        )}
      >
        <Link href={`/coin/${coin.id}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative w-8 h-8">
                  <Image
                    src={coin.image}
                    alt={coin.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {coin.symbol.toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">{coin.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-sm">
                  {formatPrice(coin.currentPrice)}
                </p>
                <div
                  className={cn("flex items-center text-xs", priceChangeColor)}
                >
                  <TrendIcon className="w-3 h-3 mr-1" />
                  {Math.abs(coin.priceChangePercentage24h).toFixed(2)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-all duration-200 group",
        className
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Link
            href={`/coin/${coin.id}`}
            className="flex items-center space-x-3 flex-1"
          >
            <div className="relative w-12 h-12">
              <Image
                src={coin.image}
                alt={coin.name}
                fill
                className="rounded-full object-cover group-hover:scale-110 transition-transform duration-200"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg truncate">{coin.name}</h3>
                <Badge variant="secondary" className="text-xs">
                  {coin.symbol.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Rank #{coin.marketCapRank}
              </p>
            </div>
          </Link>
          {showActions && (
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Star className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {formatPrice(coin.currentPrice)}
            </span>
            <div
              className={cn("flex items-center space-x-1", priceChangeColor)}
            >
              <TrendIcon className="w-4 h-4" />
              <span className="font-medium">
                {isPositive ? "+" : ""}
                {coin.priceChangePercentage24h.toFixed(2)}%
              </span>
            </div>
          </div>

          <div className={cn("text-sm font-medium", priceChangeColor)}>
            {isPositive ? "+" : ""}${coin.priceChange24h.toFixed(2)} (24h)
          </div>
        </div>

        {variant === "detailed" && (
          <div className="space-y-3 pt-2 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Market Cap</p>
                <p className="font-medium">{formatMarketCap(coin.marketCap)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Volume (24h)</p>
                <p className="font-medium">
                  {formatMarketCap(coin.totalVolume)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Circulating Supply</p>
                <p className="font-medium">
                  {coin.circulatingSupply.toLocaleString()}{" "}
                  {coin.symbol.toUpperCase()}
                </p>
              </div>
              {coin.maxSupply && (
                <div>
                  <p className="text-muted-foreground">Max Supply</p>
                  <p className="font-medium">
                    {coin.maxSupply.toLocaleString()}{" "}
                    {coin.symbol.toUpperCase()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
