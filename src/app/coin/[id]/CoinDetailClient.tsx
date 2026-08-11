"use client";

import { type ComponentType, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceChart } from "@/components/market/PriceChart";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  AlertTriangle,
  BookOpen,
  ExternalLink,
  Github,
  Globe,
  MessageCircle,
  Plus,
  Share2,
  Star,
  TrendingDown,
  TrendingUp,
  Twitter,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CoinDetailProps {
  coin: {
    id: string;
    name: string;
    symbol: string;
    image?: { large?: string };
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
      sparkline_7d?: { price?: number[] };
    };
    links?: {
      homepage?: string[];
      whitepaper?: string;
      twitter_screen_name?: string;
      repos_url?: { github?: string[] };
      subreddit_url?: string;
    };
    description?: { en?: string };
  };
}

interface DetailLinkProps {
  href?: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

function DetailLink({ href, label, icon: Icon }: DetailLinkProps) {
  if (!href) return null;
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-w-0 items-center gap-2 rounded-lg bg-muted/60 px-3 py-3 text-sm transition-colors hover:bg-muted"
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
    </Link>
  );
}

export function CoinDetailClient({ coin }: CoinDetailProps) {
  const router = useRouter();
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const marketData = coin.market_data;
  const currentPrice = marketData?.current_price?.usd ?? 0;
  const priceChange24h = marketData?.price_change_24h ?? 0;
  const priceChangePercentage24h = marketData?.price_change_percentage_24h ?? 0;
  const isPositive = priceChangePercentage24h >= 0;
  const symbol = coin.symbol?.toUpperCase();

  const formatPrice = (price?: number) => {
    if (price == null) return "N/A";
    if (price < 1) return `$${price.toFixed(6)}`;
    if (price < 100) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  };

  const formatLargeNumber = (value?: number) => {
    if (value == null) return "N/A";
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toLocaleString()}`;
  };

  const formatSupply = (value?: number) => {
    if (value == null) return "N/A";
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toLocaleString();
  };

  const formatChange = (value?: number) => {
    if (value == null) return "N/A";
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  const formatDate = (value?: string) =>
    value ? new Date(value).toLocaleDateString() : "N/A";

  const description = coin.description?.en || "";
  const descriptionText = description
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+/g, "\n")
    .trim();

  const handleWatchlistToggle = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsWatchlisted((value) => !value);
    setLoading(false);
  };

  const handleShare = async () => {
    const shareData = {
      title: `${coin.name} (${symbol})`,
      text: `${coin.name} is currently ${formatPrice(currentPrice)}.`,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Coin link copied");
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") toast.error("Could not share this coin");
    }
  };

  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const trendColor = isPositive ? "text-green-500" : "text-red-500";
  const cardClass = "rounded-none border-x-0 shadow-none sm:rounded-xl sm:border sm:shadow-sm";

  const Stat = ({ label, value, detail, detailClass }: { label: string; value: string; detail?: string; detailClass?: string }) => (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground sm:text-sm">{label}</dt>
      <dd className="mt-1 truncate text-base font-semibold sm:text-lg">{value}</dd>
      {detail && <p className={cn("mt-0.5 text-xs text-muted-foreground", detailClass)}>{detail}</p>}
    </div>
  );

  const links = coin.links || {};

  return (
    <div className="mx-auto w-full max-w-[1536px] space-y-5 overflow-x-hidden px-3 py-4 sm:px-4 sm:py-6">
      <section className="space-y-4">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <div className="relative mt-1 h-12 w-12 flex-shrink-0 sm:h-16 sm:w-16">
            <Image
              src={coin.image?.large || "/placeholder-coin.png"}
              alt={coin.name}
              fill
              className="rounded-full object-cover"
              priority
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h1 className="min-w-0 truncate text-2xl font-bold sm:text-3xl">{coin.name}</h1>
              <Badge variant="secondary" className="text-sm sm:text-base">{symbol}</Badge>
              {marketData?.market_cap_rank && (
                <Badge variant="outline" className="text-xs">Rank #{marketData.market_cap_rank}</Badge>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
              <span className="text-3xl font-bold tracking-tight sm:text-4xl">{formatPrice(currentPrice)}</span>
              <span className={cn("mb-1 inline-flex items-center gap-1 text-base font-semibold sm:text-lg", trendColor)}>
                <TrendIcon className="h-4 w-4" />
                {formatChange(priceChangePercentage24h)}
              </span>
            </div>
            <p className={cn("mt-1 text-sm", trendColor)}>
              {priceChange24h >= 0 ? "+" : ""}{formatPrice(priceChange24h).replace("$-", "-$")} (24h)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_44px_44px] gap-2 sm:flex">
          <Button
            onClick={handleWatchlistToggle}
            disabled={loading}
            variant={isWatchlisted ? "default" : "outline"}
            className="min-w-0 gap-2"
          >
            {loading ? <LoadingSpinner size="sm" /> : <Star className={cn("h-4 w-4", isWatchlisted && "fill-current")} />}
            <span className="truncate">{isWatchlisted ? "Watchlisted" : "Add to Watchlist"}</span>
          </Button>
          <Button variant="outline" size="icon" aria-label="Add coin to portfolio" onClick={() => router.push("/portfolio") }>
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Share coin" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <PriceChart
            coinId={coin.id}
            symbol={coin.symbol}
            currentPrice={currentPrice}
            priceChange24h={priceChange24h}
            priceChangePercentage24h={priceChangePercentage24h}
            priceHistory={marketData?.sparkline_7d?.price}
            height={270}
          />
        </div>

        <div className="space-y-5">
          <Card className={cardClass}>
            <CardHeader className="px-3 pb-3 sm:px-6">
              <CardTitle className="text-xl">Market Stats</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-5 sm:px-6">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
                <Stat label="Market Cap" value={formatLargeNumber(marketData?.market_cap?.usd)} />
                <Stat label="24h Volume" value={formatLargeNumber(marketData?.total_volume?.usd)} />
                <Stat label="24h High" value={formatPrice(marketData?.high_24h?.usd)} />
                <Stat label="24h Low" value={formatPrice(marketData?.low_24h?.usd)} />
                <Stat
                  label="All-Time High"
                  value={formatPrice(marketData?.ath?.usd)}
                  detail={`${formatChange(marketData?.ath_change_percentage?.usd)} · ${formatDate(marketData?.ath_date?.usd)}`}
                  detailClass={(marketData?.ath_change_percentage?.usd ?? 0) >= 0 ? "text-green-500" : "text-red-500"}
                />
                <Stat
                  label="All-Time Low"
                  value={formatPrice(marketData?.atl?.usd)}
                  detail={`${formatChange(marketData?.atl_change_percentage?.usd)} · ${formatDate(marketData?.atl_date?.usd)}`}
                  detailClass={(marketData?.atl_change_percentage?.usd ?? 0) >= 0 ? "text-green-500" : "text-red-500"}
                />
                <Stat label="Circulating Supply" value={`${formatSupply(marketData?.circulating_supply)} ${symbol}`} />
                <Stat label="Max Supply" value={`${formatSupply(marketData?.max_supply)}${marketData?.max_supply != null ? ` ${symbol}` : ""}`} />
              </dl>
            </CardContent>
          </Card>

          <Card className={cardClass}>
            <CardHeader className="px-3 pb-3 sm:px-6">
              <CardTitle className="text-xl">Links</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 px-3 pb-5 sm:px-6">
              <DetailLink href={links.homepage?.[0]} label="Website" icon={Globe} />
              <DetailLink href={links.whitepaper} label="Whitepaper" icon={BookOpen} />
              <DetailLink href={links.twitter_screen_name ? `https://twitter.com/${links.twitter_screen_name}` : undefined} label="Twitter" icon={Twitter} />
              <DetailLink href={links.repos_url?.github?.[0]} label="GitHub" icon={Github} />
              <DetailLink href={links.subreddit_url} label="Reddit" icon={MessageCircle} />
            </CardContent>
          </Card>
        </div>
      </div>

      {descriptionText && (
        <Card className={cardClass}>
          <CardHeader className="px-3 pb-3 sm:px-6">
            <CardTitle className="text-xl">About {coin.name}</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-5 sm:px-6">
            <p className={cn("whitespace-pre-line break-words text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7", !descriptionExpanded && "line-clamp-6")}>
              {descriptionText}
            </p>
            {descriptionText.length > 420 && (
              <Button variant="ghost" size="sm" className="mt-3 px-0 text-emerald-500 hover:text-emerald-400" onClick={() => setDescriptionExpanded((value) => !value)}>
                {descriptionExpanded ? "Show less" : "Read more"}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="rounded-xl border-amber-500/30 bg-amber-500/5 shadow-none">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
            <div>
              <h2 className="font-semibold text-amber-600 dark:text-amber-300">Investment Risk Warning</h2>
              <p className="mt-1 text-sm leading-6 text-amber-700 dark:text-amber-200/80">
                Cryptocurrency investments are subject to high market risk. Invest cautiously; CryptoLens is not responsible for investment losses.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
