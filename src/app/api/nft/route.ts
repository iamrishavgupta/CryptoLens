import { NextResponse } from "next/server";

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";
const COINGECKO_API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY || "";

export async function GET() {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/nfts/list?order=h24_volume_native_desc&per_page=50&page=1`,
      {
        headers: {
          Accept: "application/json",
          "x-cg-demo-api-key": COINGECKO_API_KEY,
        },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko NFT API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch NFT data" },
      { status: 500 }
    );
  }
}