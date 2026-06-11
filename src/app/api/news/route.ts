import { NextResponse } from "next/server";

const RSS_FEEDS = [
  "https://feeds.feedburner.com/CoinDesk",
  "https://cointelegraph.com/rss",
  "https://decrypt.co/feed",
  "https://bitcoinmagazine.com/.rss/full/",
];

async function fetchRSS(url: string): Promise<any[]> {
  try {
    const response = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&count=10`,
      { next: { revalidate: 300 } }
    );
    if (!response.ok) return [];
    const data = await response.json();
    if (data.status !== "ok") return [];
    return data.items || [];
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const results = await Promise.allSettled(RSS_FEEDS.map(fetchRSS));

    const allItems: any[] = [];
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        allItems.push(...result.value);
      }
    });

    if (allItems.length === 0) {
      return NextResponse.json({ success: false, error: "No articles fetched" }, { status: 500 });
    }

    // Deduplicate by title
    const seen = new Set<string>();
    const unique = allItems.filter((item) => {
      if (seen.has(item.title)) return false;
      seen.add(item.title);
      return true;
    });

    // Sort by date newest first
    unique.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

    const articles = unique.map((item, index) => ({
      id: `${index}-${Date.now()}`,
      title: item.title || "",
      description: stripHtml(item.description || item.content || "").slice(0, 200),
      url: item.link || item.url || "",
      urlToImage: item.thumbnail || item.enclosure?.link || extractImage(item.content || "") || "",
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      source: { id: item.author || "", name: extractSource(item.link || "") },
      author: item.author || extractSource(item.link || ""),
      category: detectCategory(item.title + " " + (item.description || "")),
      tags: extractTags(item.title + " " + (item.description || "")),
      readTime: Math.max(2, Math.ceil(stripHtml(item.content || "").length / 1000)),
      sentiment: detectSentiment(item.title + " " + (item.description || "")),
    }));

    return NextResponse.json({ success: true, data: articles });
  } catch (error) {
    console.error("News RSS error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim();
}

function extractImage(content: string): string {
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : "";
}

function extractSource(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    if (hostname.includes("coindesk")) return "CoinDesk";
    if (hostname.includes("cointelegraph")) return "CoinTelegraph";
    if (hostname.includes("decrypt")) return "Decrypt";
    if (hostname.includes("bitcoinmagazine")) return "Bitcoin Magazine";
    return hostname;
  } catch {
    return "Crypto News";
  }
}

function detectCategory(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("bitcoin") || t.includes(" btc")) return "Bitcoin";
  if (t.includes("ethereum") || t.includes(" eth")) return "Ethereum";
  if (t.includes("defi") || t.includes("decentralized finance")) return "DeFi";
  if (t.includes("nft") || t.includes("non-fungible")) return "NFT";
  if (t.includes("regulation") || t.includes("sec ") || t.includes("ban")) return "Regulation";
  if (t.includes("blockchain") || t.includes("layer") || t.includes("protocol")) return "Technology";
  return "Market";
}

function extractTags(text: string): string[] {
  const keywords = ["Bitcoin", "Ethereum", "DeFi", "NFT", "Solana", "BNB",
    "XRP", "Cardano", "Polygon", "Avalanche", "Staking", "Mining",
    "Web3", "Layer2", "Regulation", "ETF", "Halving", "Altcoin"];
  return keywords.filter((k) => text.toLowerCase().includes(k.toLowerCase())).slice(0, 4);
}

function detectSentiment(text: string): "positive" | "negative" | "neutral" {
  const t = text.toLowerCase();
  const pos = ["surge", "soar", "rally", "gain", "rise", "high", "bull", "growth", "adoption", "record", "boost", "approval", "launch", "partnership"];
  const neg = ["crash", "fall", "drop", "plunge", "ban", "hack", "fraud", "scam", "fear", "loss", "warning", "collapse", "decline", "risk"];
  const p = pos.filter((w) => t.includes(w)).length;
  const n = neg.filter((w) => t.includes(w)).length;
  if (p > n) return "positive";
  if (n > p) return "negative";
  return "neutral";
}