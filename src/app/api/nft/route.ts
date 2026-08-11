import { NextResponse } from "next/server";

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";
const COINGECKO_API_KEY =
  process.env.COINGECKO_API_KEY ||
  process.env.NEXT_PUBLIC_COINGECKO_API_KEY ||
  "";

const requestHeaders = {
  Accept: "application/json",
  ...(COINGECKO_API_KEY
    ? { "x-cg-demo-api-key": COINGECKO_API_KEY }
    : {}),
};

export const revalidate = 300;

const asRecord = (value: unknown): Record<string, any> =>
  value && typeof value === "object" ? (value as Record<string, any>) : {};

export async function GET() {
  try {
    const listResponse = await fetch(
      `${COINGECKO_API_BASE}/nfts/list?order=h24_volume_native_desc&per_page=15&page=1`,
      {
        headers: requestHeaders,
        next: { revalidate: 300 },
      }
    );

    if (!listResponse.ok) {
      throw new Error(`CoinGecko NFT list error: ${listResponse.status}`);
    }

    const listPayload: unknown = await listResponse.json();
    if (!Array.isArray(listPayload)) {
      throw new Error("CoinGecko returned an invalid NFT list response");
    }

    const details = await Promise.allSettled(
      listPayload.map(async (item) => {
        const listItem = asRecord(item);
        const id = String(listItem.id || "");
        if (!id) throw new Error("NFT collection is missing an id");

        const response = await fetch(`${COINGECKO_API_BASE}/nfts/${id}`, {
          headers: requestHeaders,
          next: { revalidate: 300 },
        });
        if (!response.ok) {
          throw new Error(`NFT detail ${id} failed: ${response.status}`);
        }

        return asRecord(await response.json());
      })
    );

    const data = listPayload.map((item, index) => {
      const listItem = asRecord(item);
      const result = details[index];
      const detail =
        result.status === "fulfilled" ? result.value : listItem;
      const image = asRecord(detail.image);
      const floorPrice = asRecord(detail.floor_price);
      const marketCap = asRecord(detail.market_cap);
      const change = asRecord(detail.floor_price_24h_percentage_change);

      return {
        id: String(detail.id || listItem.id || `nft-${index}`),
        name: String(detail.name || listItem.name || "Unknown Collection"),
        symbol: String(detail.symbol || listItem.symbol || ""),
        assetPlatformId: String(
          detail.asset_platform_id || listItem.asset_platform_id || "unknown"
        ),
        contractAddress:
          detail.contract_address || listItem.contract_address || null,
        image: String(image.small || image.small_2x || image.large || ""),
        nativeCurrencySymbol: String(
          detail.native_currency_symbol || detail.native_currency || "Ξ"
        ),
        floorPrice: Number(floorPrice.native_currency) || 0,
        marketCap: Number(marketCap.native_currency) || 0,
        floorPriceChange24h: Number(change.native_currency) || 0,
        marketCapRank: Number(detail.market_cap_rank) || index + 1,
      };
    });

    return NextResponse.json({
      success: true,
      data,
      metadata: {
        source: "coingecko",
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("NFT API error:", error);
    return NextResponse.json(
      { success: false, data: [], error: "Failed to fetch NFT data" },
      { status: 502 }
    );
  }
}
