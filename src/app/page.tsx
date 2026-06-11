import React from "react";
export const dynamic = "force-dynamic";
import HomeLayout from "@/components/layout/HomeLayout";
import { HomePageClient } from "@/components/client/pages/HomePageClient";

async function getTrendingCoins() {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      `https://${process.env.VERCEL_URL}`;

    const res = await fetch(
      `${baseUrl}/api/market?per_page=10&page=1`,
      { next: { revalidate: 60 } }
    );

    const json = await res.json();

    if (json.success) {
      return json.data.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        image: coin.image,
        currentPrice: coin.currentPrice,
        priceChange24h: coin.priceChange24h,
        priceChangePercentage24h: coin.priceChangePercentage24h,
        marketCap: coin.marketCap,
        volume24h: coin.totalVolume,
        sparkline: [],
        rank: coin.marketCapRank,
      }));
    }
  } catch (e) {
    console.error("Failed to fetch trending coins:", e);
  }

  return [];
}

const mockNewsArticles = [
  {
    id: "1",
    title: "Bitcoin Reaches New All-Time High Amid Institutional Adoption",
    summary:
      "Leading cryptocurrency Bitcoin has surged to unprecedented levels as major institutions continue to adopt digital assets.",
    content: "",
    author: "John Doe",
    publishedAt: "2025-01-10T10:00:00Z",
    imageUrl:
      "https://images.unsplash.com/photo-1605792657660-596af9009e82?w=400&h=200&fit=crop",
    sourceUrl: "https://example.com/news/1",
    source: "CryptoNews",
    category: "bitcoin" as const,
    readTime: 3,
    tags: ["bitcoin", "institutional", "adoption"],
  },
  {
    id: "2",
    title: "Ethereum 2.0 Staking Rewards Hit Record Numbers",
    summary:
      "Ethereum validators are seeing increased rewards as the network continues to grow and mature.",
    content: "",
    author: "Jane Smith",
    publishedAt: "2025-01-10T08:30:00Z",
    imageUrl:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop",
    sourceUrl: "https://example.com/news/2",
    source: "DeFi Today",
    category: "ethereum" as const,
    readTime: 4,
    tags: ["ethereum", "staking", "rewards"],
  },
  {
    id: "3",
    title: "DeFi TVL Surpasses $200 Billion Milestone",
    summary:
      "Decentralized Finance protocols have reached a new milestone with Total Value Locked exceeding $200 billion.",
    content: "",
    author: "Mike Johnson",
    publishedAt: "2025-01-10T06:15:00Z",
    imageUrl:
      "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=200&fit=crop",
    sourceUrl: "https://example.com/news/3",
    source: "DeFi Pulse",
    category: "defi" as const,
    readTime: 5,
    tags: ["defi", "tvl", "milestone"],
  },
];

const mockPortfolio = {
  id: "default-portfolio",
  name: "My Portfolio",
  totalValue: 0,
  totalCost: 0,
  totalPnL: 0,
  totalPnLPercentage: 0,
  dayChange: 0,
  dayChangePercentage: 0,
  holdings: [],
};

export default async function HomePage() {
  const trendingCoins = await getTrendingCoins();

  return (
    <HomeLayout>
      <HomePageClient
        trendingCoins={trendingCoins}
        newsArticles={mockNewsArticles}
        portfolio={mockPortfolio}
      />
    </HomeLayout>
  );
}