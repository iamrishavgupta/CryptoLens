import { NextRequest, NextResponse } from "next/server";

interface CoinGeckoResponse {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  fully_diluted_valuation: number | null;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap_change_24h: number;
  market_cap_change_percentage_24h: number;
  circulating_supply: number;
  total_supply: number | null;
  max_supply: number | null;
  ath: number;
  ath_change_percentage: number;
  ath_date: string;
  atl: number;
  atl_change_percentage: number;
  atl_date: string;
  roi: {
    times: number;
    currency: string;
    percentage: number;
  } | null;
  last_updated: string;
}

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";
const COINGECKO_API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY || "";

async function fetchMarketData(
  page = 1,
  perPage = 100,
  currency = "usd",
  order = "market_cap_desc",
  sparkline = false,
  priceChangePercentage = "24h"
): Promise<CoinGeckoResponse[]> {
  const params = new URLSearchParams({
    vs_currency: currency,
    order,
    per_page: perPage.toString(),
    page: page.toString(),
    sparkline: sparkline.toString(),
    price_change_percentage: priceChangePercentage,
  });

  const response = await fetch(
    `${COINGECKO_API_BASE}/coins/markets?${params}`,
    {
      headers: {
        Accept: "application/json",
        "x-cg-demo-api-key": COINGECKO_API_KEY,
      },
      next: { revalidate: 60 },
    }
  );

  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }

  const data = await response.json();
  return data;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const perPage = Math.min(
      parseInt(searchParams.get("per_page") || "100"),
      250
    );
    const currency = searchParams.get("currency") || "usd";
    const order = searchParams.get("order") || "market_cap_desc";
    const sparkline = searchParams.get("sparkline") === "true";
    const priceChangePercentage =
      searchParams.get("price_change_percentage") || "24h";

    if (page < 1 || perPage < 1) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const data = await fetchMarketData(
      page,
      perPage,
      currency,
      order,
      sparkline,
      priceChangePercentage
    );

    const transformedData = data.map((coin) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      currentPrice: coin.current_price,
      marketCap: coin.market_cap,
      marketCapRank: coin.market_cap_rank,
      totalVolume: coin.total_volume,
      priceChange24h: coin.price_change_24h,
      priceChangePercentage24h: coin.price_change_percentage_24h,
      circulatingSupply: coin.circulating_supply,
      maxSupply: coin.max_supply,
      high24h: coin.high_24h,
      low24h: coin.low_24h,
      ath: coin.ath,
      athChangePercentage: coin.ath_change_percentage,
      athDate: coin.ath_date,
      atl: coin.atl,
      atlChangePercentage: coin.atl_change_percentage,
      atlDate: coin.atl_date,
      lastUpdated: coin.last_updated,
    }));

    return NextResponse.json({
      success: true,
      data: transformedData,
      pagination: { page, perPage, total: transformedData.length },
      metadata: {
        currency,
        order,
        sparkline,
        priceChangePercentage,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Market API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch market data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}