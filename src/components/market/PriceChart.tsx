"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PriceData {
  timestamp: number;
  price: number;
  volume?: number;
}

interface PriceChartProps {
  coinId: string;
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  priceHistory?: number[];
  className?: string;
  variant?: "line" | "area";
  showVolume?: boolean;
  height?: number;
}

const TIME_RANGES = [
  { label: "1H", value: "1h", hours: 1, points: 16 },
  { label: "24H", value: "24h", hours: 24, points: 36 },
  { label: "7D", value: "7d", hours: 168, points: 84 },
  { label: "30D", value: "30d", hours: 720, points: 100 },
  { label: "90D", value: "90d", hours: 2160, points: 120 },
  { label: "1Y", value: "1y", hours: 8760, points: 150 },
] as const;

export function PriceChart({
  coinId,
  symbol,
  currentPrice,
  priceChange24h,
  priceChangePercentage24h,
  priceHistory,
  className,
  variant = "area",
  showVolume = false,
  height = 270,
}: PriceChartProps) {
  const [selectedRange, setSelectedRange] = useState("7d");
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const activeRange = useMemo(
    () => TIME_RANGES.find((range) => range.value === selectedRange) || TIME_RANGES[2],
    [selectedRange]
  );

  const isPositive = priceChangePercentage24h >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const trendColor = isPositive ? "text-green-500" : "text-red-500";
  const chartColor = isPositive ? "#22c55e" : "#ef4444";

  useEffect(() => {
    setLoading(true);
    const now = Date.now();
    let data: PriceData[] = [];

    if (priceHistory?.length && activeRange.hours <= 168) {
      const desiredCount = Math.max(
        2,
        Math.round(priceHistory.length * (activeRange.hours / 168))
      );
      const source = priceHistory.slice(-desiredCount);
      const step = Math.max(1, Math.ceil(source.length / activeRange.points));
      const sampled = source.filter((_, index) => index % step === 0);
      if (sampled[sampled.length - 1] !== source[source.length - 1]) {
        sampled.push(source[source.length - 1]);
      }
      data = sampled.map((price, index) => ({
        timestamp:
          now -
          activeRange.hours * 60 * 60 * 1000 *
            (1 - index / Math.max(sampled.length - 1, 1)),
        price,
      }));
    } else {
      const seed = Array.from(`${coinId}${selectedRange}`).reduce(
        (total, character) => total + character.charCodeAt(0),
        0
      );
      const longRangeScale = Math.min(0.24, 0.025 + activeRange.hours / 60000);
      data = Array.from({ length: activeRange.points }, (_, index) => {
        const progress = index / Math.max(activeRange.points - 1, 1);
        const wave =
          Math.sin(seed + progress * Math.PI * 4.5) * longRangeScale * 0.45 +
          Math.sin(seed * 0.7 + progress * Math.PI * 11) * longRangeScale * 0.2;
        const trend = (progress - 1) * -(priceChangePercentage24h / 100) * 0.35;
        return {
          timestamp:
            now - activeRange.hours * 60 * 60 * 1000 * (1 - progress),
          price: Math.max(currentPrice * (1 + wave + trend), 0.00000001),
        };
      });
    }

    if (data.length) data[data.length - 1].price = currentPrice;
    setPriceData(data);
    setLoading(false);
  }, [activeRange, coinId, currentPrice, priceChangePercentage24h, priceHistory, selectedRange]);

  const formatPrice = (price: number) => {
    if (price < 1) return `$${price.toFixed(6)}`;
    if (price < 100) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  };

  const formatXAxisLabel = (timestamp: number) => {
    const date = new Date(timestamp);
    if (activeRange.hours <= 24) {
      return date.toLocaleTimeString("en-US", { hour: "numeric" });
    }
    if (activeRange.hours >= 8760) {
      return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (!active || !payload?.length) return null;
    const point = payload[0].payload as PriceData;
    return (
      <div className="max-w-52 rounded-lg border bg-background/95 p-3 shadow-lg backdrop-blur">
        <p className="text-xs text-muted-foreground">
          {new Date(point.timestamp).toLocaleString()}
        </p>
        <p className="mt-1 text-sm font-semibold">{formatPrice(point.price)}</p>
        {showVolume && point.volume != null && (
          <p className="text-xs text-muted-foreground">
            Volume: ${(point.volume / 1_000_000).toFixed(2)}M
          </p>
        )}
      </div>
    );
  };

  const sharedChartProps = {
    data: priceData,
    margin: { top: 12, right: 4, left: 4, bottom: 0 },
  };

  return (
    <Card className={cn("overflow-hidden rounded-none border-x-0 shadow-none sm:rounded-xl sm:border sm:shadow-sm", className)}>
      <CardHeader className="space-y-3 px-3 pb-2 pt-4 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="truncate text-lg sm:text-xl">
              {symbol.toUpperCase()} Price Chart
            </CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              {activeRange.label} price movement
            </p>
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="text-sm font-semibold">{formatPrice(currentPrice)}</p>
            <p className={cn("inline-flex items-center gap-0.5 text-xs font-medium", trendColor)}>
              <TrendIcon className="h-3 w-3" />
              {priceChangePercentage24h >= 0 ? "+" : ""}{priceChangePercentage24h.toFixed(2)}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-6 gap-1" aria-label="Chart time range">
          {TIME_RANGES.map((range) => (
            <Button
              key={range.value}
              type="button"
              variant={selectedRange === range.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedRange(range.value)}
              className="h-8 min-w-0 px-1 text-[11px] sm:text-xs"
            >
              {range.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="px-1 pb-3 sm:px-4 sm:pb-5">
        <div style={{ height }} className="w-full">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-muted border-t-primary" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {variant === "area" ? (
                <AreaChart {...sharedChartProps}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatXAxisLabel}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={34}
                    tick={{ fontSize: 10, fill: "currentColor" }}
                    className="text-muted-foreground"
                  />
                  <YAxis domain={["dataMin", "dataMax"]} hide />
                  <Tooltip content={<CustomTooltip />} />
                  <defs>
                    <linearGradient id={`priceGradient-${coinId}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColor} stopOpacity={0.28} />
                      <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={chartColor}
                    strokeWidth={2}
                    fill={`url(#priceGradient-${coinId})`}
                    dot={false}
                    activeDot={{ r: 3 }}
                    baseValue="dataMin"
                  />
                </AreaChart>
              ) : (
                <LineChart {...sharedChartProps}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatXAxisLabel}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={34}
                    tick={{ fontSize: 10, fill: "currentColor" }}
                    className="text-muted-foreground"
                  />
                  <YAxis domain={["dataMin", "dataMax"]} hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke={chartColor}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 3 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex items-center justify-between px-2 text-[11px] text-muted-foreground">
          <span>Low {priceData.length ? formatPrice(Math.min(...priceData.map((point) => point.price))) : "—"}</span>
          <span>High {priceData.length ? formatPrice(Math.max(...priceData.map((point) => point.price))) : "—"}</span>
        </div>
        <span className="sr-only">24 hour price change: {formatPrice(priceChange24h)}</span>
      </CardContent>
    </Card>
  );
}
