import { TrendingPageClient } from "@/components/client/pages/TrendingPageClient";
import { Metadata } from "next";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trending Cryptocurrencies | CryptoTracker",
  description:
    "Discover the most trending cryptocurrencies based on search volume, price movement, and market activity",
};

async function getTrendingStats() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      `https://${process.env.VERCEL_URL}`;

    const res = await fetch(
      `${baseUrl}/api/market?per_page=100&page=1`,
      {
        next: { revalidate: 60 },
      }
    );

    const json = await res.json();

    if (json.success && json.data.length > 0) {
      const coins = json.data;

      // Calculate real stats from live data
      const validChanges = coins
        .map((c: any) => c.priceChangePercentage24h)
        .filter((v: any) => v != null);

      const avgPriceChange =
        validChanges.reduce((a: number, b: number) => a + b, 0) /
        validChanges.length;

      const topGainer = coins.reduce((best: any, coin: any) => {
        if (coin.priceChangePercentage24h == null) return best;
        if (
          !best ||
          coin.priceChangePercentage24h >
            best.priceChangePercentage24h
        )
          return coin;
        return best;
      }, null);

      const totalVolume = coins.reduce(
        (sum: number, c: any) => sum + (c.totalVolume || 0),
        0
      );

      return {
        totalTrending: coins.length,
        avgPriceChange: parseFloat(avgPriceChange.toFixed(2)),
        topGainer: {
          name: topGainer?.name || "N/A",
          symbol: topGainer?.symbol?.toUpperCase() || "N/A",
          change: parseFloat(
            (topGainer?.priceChangePercentage24h || 0).toFixed(2)
          ),
        },
        totalSearchVolume: totalVolume,
        updatedAt: new Date().toISOString(),
      };
    }
  } catch (e) {
    console.error("Failed to fetch trending stats:", e);
  }

  // Fallback
  return {
    totalTrending: 0,
    avgPriceChange: 0,
    topGainer: {
      name: "N/A",
      symbol: "N/A",
      change: 0,
    },
    totalSearchVolume: 0,
    updatedAt: new Date().toISOString(),
  };
}

export default async function TrendingPage() {
  const trendingStats = await getTrendingStats();
  return <TrendingPageClient trendingStats={trendingStats} />;
}