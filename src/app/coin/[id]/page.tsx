import { Metadata } from "next";
import { notFound } from "next/navigation";
import { CoinDetailClient } from "./CoinDetailClient";

// Mock function to fetch coin data - replace with real API call
async function getCoinData(id: string) {
  try {
    // In a real app, this would fetch from your API or directly from CoinGecko
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=true`,
      {
        next: { revalidate: 60 }, // Cache for 1 minute
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch coin data");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching coin data:", error);

    // Return mock data as fallback
    return {
      id,
      symbol: "btc",
      name: "Bitcoin",
      description: {
        en: "Bitcoin is the first successful internet money based on peer-to-peer technology; whereby no central bank or authority is involved in the transaction and production of the Bitcoin currency.",
      },
      image: {
        large:
          "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png",
      },
      market_data: {
        current_price: { usd: 43250.45 },
        market_cap: { usd: 846542734829 },
        market_cap_rank: 1,
        total_volume: { usd: 23456789012 },
        price_change_24h: 1034.56,
        price_change_percentage_24h: 2.45,
        circulating_supply: 19567890,
        total_supply: 21000000,
        max_supply: 21000000,
        ath: { usd: 69045.22 },
        ath_change_percentage: { usd: -37.34 },
        ath_date: { usd: "2021-11-10T14:24:11.849Z" },
        atl: { usd: 67.81 },
        atl_change_percentage: { usd: 63665.89 },
        atl_date: { usd: "2013-07-06T00:00:00.000Z" },
        high_24h: { usd: 44123.67 },
        low_24h: { usd: 42890.34 },
        sparkline_7d: {
          price: Array.from(
            { length: 168 },
            (_, i) => 43000 + Math.sin(i / 10) * 2000 + Math.random() * 1000
          ),
        },
      },
      links: {
        homepage: ["https://bitcoin.org"],
        whitepaper: "https://bitcoin.org/bitcoin.pdf",
        blockchain_site: ["https://blockchair.com/bitcoin"],
        official_forum_url: ["https://bitcointalk.org"],
        chat_url: [],
        announcement_url: [],
        twitter_screen_name: "bitcoin",
        facebook_username: "",
        bitcointalk_thread_identifier: null,
        telegram_channel_identifier: "",
        subreddit_url: "https://www.reddit.com/r/Bitcoin/",
        repos_url: {
          github: ["https://github.com/bitcoin/bitcoin"],
          bitbucket: [],
        },
      },
    };
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const coin = await getCoinData(id);

  if (!coin) {
    return {
      title: "Coin Not Found",
    };
  }

  return {
    title: `${
      coin.name
    } (${coin.symbol.toUpperCase()}) Price, Chart & Market Cap`,
    description: coin.description?.en
      ? coin.description.en.substring(0, 160) + "..."
      : `View ${coin.name} price, market cap, trading volume, and more cryptocurrency data.`,
    openGraph: {
      title: `${coin.name} Price & Chart`,
      description: `Current ${coin.name} price: $${
        coin.market_data?.current_price?.usd?.toLocaleString() || "N/A"
      }`,
      images: [coin.image?.large || ""],
    },
  };
}

export default async function CoinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const coin = await getCoinData(id);

  if (!coin) {
    notFound();
  }

  return <CoinDetailClient coin={coin} />;
}
