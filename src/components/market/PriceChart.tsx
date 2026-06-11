"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  TooltipProps,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";
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
  className?: string;
  variant?: "line" | "area";
  showVolume?: boolean;
  height?: number;
}

const TIME_RANGES = [
  { label: "1H", value: "1h", days: null },
  { label: "24H", value: "24h", days: 1 },
  { label: "7D", value: "7d", days: 7 },
  { label: "30D", value: "30d", days: 30 },
  { label: "90D", value: "90d", days: 90 },
  { label: "1Y", value: "1y", days: 365 },
] as const;

export function PriceChart({
  symbol,
  currentPrice,
  priceChange24h,
  priceChangePercentage24h,
  className,
  variant = "area",
  showVolume = false,
  height = 300,
}: PriceChartProps) {
  const [selectedRange, setSelectedRange] = useState("7d");
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  const isPositive = priceChangePercentage24h >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const trendColor = isPositive ? "text-coingecko-green-600" : "text-red-600";
  const chartColor = isPositive ? "#22c55e" : "#ef4444";

  // Mock data generation for demonstration
  useEffect(() => {
    const generateMockData = () => {
      setLoading(true);

      const range = TIME_RANGES.find((r) => r.value === selectedRange);
      const days = range?.days || 1;
      const points = Math.min(days * 24, 168); // Max 168 points for performance

      const data: PriceData[] = [];
      const basePrice = currentPrice;
      let price = basePrice;

      // Generate historical data working backwards
      for (let i = points; i >= 0; i--) {
        const hoursBack = i;
        const timestamp = Date.now() - hoursBack * 60 * 60 * 1000;

        // Add some realistic price movement
        const volatility = 0.02; // 2% volatility
        const change = (Math.random() - 0.5) * volatility * price;
        price = Math.max(price + change, 0.001);

        data.push({
          timestamp,
          price: parseFloat(price.toFixed(6)),
          volume: Math.random() * 1000000,
        });
      }

      // Ensure the last data point matches current price
      if (data.length > 0) {
        data[data.length - 1].price = currentPrice;
      }

      setPriceData(data.reverse());
      setLoading(false);
    };

    generateMockData();
  }, [selectedRange, currentPrice]);

  const formatPrice = (price: number) => {
    if (price < 1) return `$${price.toFixed(6)}`;
    if (price < 100) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  };

  const formatXAxisLabel = (timestamp: number) => {
    const date = new Date(timestamp);

    if (selectedRange === "1h" || selectedRange === "24h") {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground">
            {new Date(data.timestamp).toLocaleString()}
          </p>
          <p className="font-semibold">Price: {formatPrice(data.price)}</p>
          {showVolume && data.volume && (
            <p className="text-sm text-muted-foreground">
              Volume: ${(data.volume / 1000000).toFixed(2)}M
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Failed to load chart data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {symbol.toUpperCase()} Price Chart
            </CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-2xl font-bold">
                {formatPrice(currentPrice)}
              </span>
              <div className={cn("flex items-center space-x-1", trendColor)}>
                <TrendIcon className="w-4 h-4" />
                <span className="font-medium">
                  {isPositive ? "+" : ""}
                  {priceChangePercentage24h.toFixed(2)}%
                </span>
              </div>
            </div>
            <p className={cn("text-sm", trendColor)}>
              {isPositive ? "+" : ""}${priceChange24h.toFixed(2)} (24h)
            </p>
          </div>

          <div className="flex space-x-1">
            {TIME_RANGES.map((range) => (
              <Button
                key={range.value}
                variant={selectedRange === range.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRange(range.value)}
                className="text-xs"
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div style={{ height }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {variant === "area" ? (
                <AreaChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatXAxisLabel}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={["dataMin", "dataMax"]}
                    tickFormatter={formatPrice}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <defs>
                    <linearGradient
                      id="priceGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={chartColor}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={chartColor}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={chartColor}
                    strokeWidth={2}
                    fill="url(#priceGradient)"
                    dot={false}
                  />
                </AreaChart>
              ) : (
                <LineChart data={priceData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatXAxisLabel}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    domain={["dataMin", "dataMax"]}
                    tickFormatter={formatPrice}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke={chartColor}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
