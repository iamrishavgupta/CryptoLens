import { MarketPageClient } from "@/components/client/pages/MarketPageClient";

async function getGlobalData() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      `https://${process.env.VERCEL_URL}`;

    const res = await fetch(
      `${baseUrl}/api/market/global`,
      { next: { revalidate: 300 } }
    );

    const json = await res.json();

    if (json.success) {
      return {
        totalMarketCap: json.data.totalMarketCap,
        totalVolume: json.data.totalVolume,
        marketCapChange24h: json.data.marketCapChange24h,
        bitcoinDominance: json.data.bitcoinDominance,
        ethereumDominance: json.data.ethereumDominance,
        fearGreedIndex: {
          value: json.data.fearGreedIndex.value,
          classification: json.data.fearGreedIndex.classification,
        },
      };
    }
  } catch (e) {
    console.error("Failed to fetch global data:", e);
  }

  // Fallback
  return {
    totalMarketCap: 0,
    totalVolume: 0,
    marketCapChange24h: 0,
    bitcoinDominance: 0,
    ethereumDominance: 0,
    fearGreedIndex: {
      value: 0,
      classification: "N/A",
    },
  };
}

export default async function MarketPage() {
  const globalData = await getGlobalData();
  return <MarketPageClient globalData={globalData} />;
}