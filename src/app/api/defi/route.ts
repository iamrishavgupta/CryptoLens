import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.llama.fi/protocols",
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) throw new Error(`DefiLlama API error: ${response.status}`);

    const data = await response.json();

    // Return top 50 by TVL
    const top50 = data
      .filter((p: any) => p.tvl > 0)
      .sort((a: any, b: any) => b.tvl - a.tvl)
      .slice(0, 50)
      .map((p: any) => ({
        id: p.slug,
        name: p.name,
        symbol: p.symbol || "",
        logo: p.logo,
        category: p.category || "DeFi",
        tvl: p.tvl,
        tvlChange24h: p.change_1d || 0,
        chains: p.chains || [],
        description: p.description || "",
        website: p.url || "",
      }));

    return NextResponse.json({ success: true, data: top50 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch DeFi data" },
      { status: 500 }
    );
  }
}