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

export async function GET() {
  try {
    const [exchangesResponse, priceResponse] = await Promise.all([
      fetch(`${COINGECKO_API_BASE}/exchanges?per_page=50&page=1`, {
        headers: requestHeaders,
        next: { revalidate: 300 },
      }),
      fetch(
        `${COINGECKO_API_BASE}/simple/price?ids=bitcoin&vs_currencies=usd`,
        {
          headers: requestHeaders,
          next: { revalidate: 60 },
        }
      ),
    ]);

    if (!exchangesResponse.ok) {
      throw new Error(`CoinGecko exchanges error: ${exchangesResponse.status}`);
    }

    const exchangesPayload: unknown = await exchangesResponse.json();
    if (!Array.isArray(exchangesPayload)) {
      throw new Error("CoinGecko returned an invalid exchanges response");
    }

    let btcPrice = 60000;
    if (priceResponse.ok) {
      const pricePayload = await priceResponse.json();
      const livePrice = Number(pricePayload?.bitcoin?.usd);
      if (Number.isFinite(livePrice) && livePrice > 0) btcPrice = livePrice;
    }
    const data = exchangesPayload
      .filter(
        (item): item is Record<string, unknown> =>
          !!item && typeof item === "object"
      )
      .map((item, index) => ({
        id: String(item.id || `exchange-${index}`),
        name: String(item.name || "Unknown Exchange"),
        image: String(item.image || ""),
        trust_score: Number(item.trust_score) || 0,
        trust_score_rank: Number(item.trust_score_rank) || index + 1,
        trade_volume_24h_btc: Number(item.trade_volume_24h_btc) || 0,
        country: item.country ? String(item.country) : null,
        year_established: Number(item.year_established) || null,
        url: String(item.url || ""),
        description: item.description ? String(item.description) : null,
      }));

    return NextResponse.json({
      success: true,
      data,
      btcPrice,
      metadata: {
        source: "coingecko",
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Exchanges API error:", error);
    return NextResponse.json(
      {
        success: false,
        data: [],
        error: "Failed to fetch exchange data",
      },
      { status: 502 }
    );
  }
}
