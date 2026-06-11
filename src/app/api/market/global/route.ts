import { NextRequest, NextResponse } from "next/server";

interface CoinGeckoGlobalResponse {
  data: {
    active_cryptocurrencies: number;
    upcoming_icos: number;
    ongoing_icos: number;
    ended_icos: number;
    markets: number;
    total_market_cap: Record<string, number>;
    total_volume: Record<string, number>;
    market_cap_percentage: Record<string, number>;
    market_cap_change_percentage_24h_usd: number;
    updated_at: number;
  };
}

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";
const COINGECKO_API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY || "";

async function fetchGlobalData(): Promise<CoinGeckoGlobalResponse["data"]> {
  const response = await fetch(`${COINGECKO_API_BASE}/global`, {
    headers: {
      Accept: "application/json",
      "x-cg-demo-api-key": COINGECKO_API_KEY,
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  const data: CoinGeckoGlobalResponse = await response.json();
  return data.data;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get("currency") || "usd";

    const globalData = await fetchGlobalData();

    // Fetch real Fear & Greed index
let fearGreedValue = 50;
let fearGreedClassification = "Neutral";
try {
  const fgRes = await fetch("https://api.alternative.me/fng/?limit=1&format=json", {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });
  const fgJson = await fgRes.json();
  fearGreedValue = parseInt(fgJson?.data?.[0]?.value || "50");
  fearGreedClassification = fgJson?.data?.[0]?.value_classification || "Neutral";
} catch (e) {
  console.error("Failed to fetch fear & greed index:", e);
}

    const totalMarketCap =
      globalData.total_market_cap[currency] || globalData.total_market_cap.usd;
    const totalVolume =
      globalData.total_volume[currency] || globalData.total_volume.usd;

    const bitcoinDominance = globalData.market_cap_percentage.btc || 0;
    const ethereumDominance = globalData.market_cap_percentage.eth || 0;

    const transformedData = {
      totalMarketCap,
      totalVolume,
      marketCapChange24h: globalData.market_cap_change_percentage_24h_usd,
      activeCryptocurrencies: globalData.active_cryptocurrencies,
      markets: globalData.markets,
      bitcoinDominance,
      ethereumDominance,
      altcoinDominance: 100 - bitcoinDominance - ethereumDominance,
      volumeToMarketCapRatio: (totalVolume / totalMarketCap) * 100,
      fearGreedIndex: {
        value: fearGreedValue,
        classification: fearGreedClassification,
        timestamp: new Date().toISOString(),
      },
      marketCapPercentage: globalData.market_cap_percentage,
      upcomingIcos: globalData.upcoming_icos,
      ongoingIcos: globalData.ongoing_icos,
      endedIcos: globalData.ended_icos,
      lastUpdated: new Date(globalData.updated_at * 1000).toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: transformedData,
      metadata: {
        currency,
        source: "coingecko",
        cacheTime: 300,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Global market API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch global market data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}