"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Input } from "@/components/ui/input";
import {
  Clock, TrendingUp, Share, BookOpen, ExternalLink,
  Search, X, Bookmark, BookmarkCheck,
} from "lucide-react";

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: { id: string; name: string };
  author: string;
  category: string;
  tags: string[];
  readTime: number;
  sentiment: "positive" | "negative" | "neutral";
}

const categories = ["All", "Bitcoin", "Ethereum", "DeFi", "NFT", "Regulation", "Technology", "Market"];

const SEARCH_QUERIES: Record<string, string> = {
  All: "cryptocurrency OR bitcoin OR ethereum OR crypto",
  Bitcoin: "bitcoin OR BTC",
  Ethereum: "ethereum OR ETH",
  DeFi: "DeFi OR decentralized finance",
  NFT: "NFT OR non-fungible token",
  Regulation: "crypto regulation OR SEC cryptocurrency OR crypto law",
  Technology: "blockchain technology OR web3 OR layer2",
  Market: "crypto market OR altcoin OR trading",
};

export default function NewsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("publishedAt");
  const [fearGreed, setFearGreed] = useState<{ value: number; classification: string } | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      try { return new Set(JSON.parse(localStorage.getItem("newsBookmarks") || "[]")); }
      catch { return new Set(); }
    }
    return new Set();
  });

  // Fetch Fear & Greed
  useEffect(() => {
    fetch("/api/market/global")
      .then((r) => r.json())
      .then((json) => { if (json.success) setFearGreed(json.data.fearGreedIndex); })
      .catch(() => { });
  }, []);

  // Fetch news
  useEffect(() => {
    setIsLoading(true);
    const q = SEARCH_QUERIES[selectedCategory] || SEARCH_QUERIES.All;
    fetch(`/api/news?q=${encodeURIComponent(q)}&pageSize=20`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setArticles(json.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [selectedCategory]);

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      if (typeof window !== "undefined") {
        localStorage.setItem("newsBookmarks", JSON.stringify(Array.from(next)));
      }
      return next;
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffH = Math.floor((now.getTime() - date.getTime()) / 3600000);
    if (diffH < 1) return "Just now";
    if (diffH < 24) return `${diffH}h ago`;
    if (diffH < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === "positive") return "bg-green-100 text-green-800";
    if (sentiment === "negative") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const getFearGreedColor = (v: number) => {
    if (v <= 25) return "text-red-500";
    if (v <= 45) return "text-orange-500";
    if (v <= 55) return "text-yellow-500";
    if (v <= 75) return "text-green-500";
    return "text-green-600";
  };

  const filtered = articles
    .filter((a) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      if (sortBy === "publishedAt") return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      return 0;
    });

  const bookmarkedArticles = articles.filter((a) => bookmarks.has(a.id));

  const ArticleCard = ({ article }: { article: NewsArticle }) => (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden flex flex-col">
      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center overflow-hidden">
        {article.urlToImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.urlToImage}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <BookOpen className="h-16 w-16 text-slate-400" />
        )}
        <Badge className={`absolute top-2 right-2 ${getSentimentColor(article.sentiment)}`}>
          {article.sentiment}
        </Badge>
        <Badge className="absolute top-2 left-2 bg-black/60 text-white text-xs">
          {article.category}
        </Badge>
      </div>

      <div className="p-4 flex flex-col flex-1 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 flex-1">
            {article.title}
          </h3>
          <button
            onClick={(e) => { e.stopPropagation(); toggleBookmark(article.id); }}
            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            {bookmarks.has(article.id)
              ? <BookmarkCheck className="h-4 w-4 text-blue-500" />
              : <Bookmark className="h-4 w-4" />}
          </button>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2">{article.description}</p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {article.readTime} min read
          </div>
          <span>{formatDate(article.publishedAt)}</span>
        </div>

        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {article.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-1 mt-auto">
          <span className="text-xs text-muted-foreground truncate max-w-[120px]">{article.source.name}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-7 text-xs px-2"
              onClick={() => navigator.share?.({ title: article.title, url: article.url }).catch(() => { })}>
              <Share className="h-3 w-3 mr-1" />Share
            </Button>
            <Button size="sm" className="h-7 text-xs px-2"
              onClick={() => window.open(article.url, "_blank")}>
              <ExternalLink className="h-3 w-3 mr-1" />Read
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header variant="simplified" isMobileMenuOpen={sidebarOpen} setIsMobileMenuOpen={setSidebarOpen} />
      <div className="container mx-auto px-4">
        <div className="w-full max-w-[1536px] mx-auto flex">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 p-5 space-y-6 overflow-x-hidden">

            {/* Header */}
            <div>
              <h1 className="text-4xl font-bold">Crypto News</h1>
              <p className="text-muted-foreground">Stay updated with the latest cryptocurrency news and market insights</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6 flex items-center gap-2">
                  <TrendingUp className="h-6 w-6 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fear & Greed Index</p>
                    {fearGreed ? (
                      <div className="flex items-center gap-2">
                        <p className={`text-2xl font-bold ${getFearGreedColor(fearGreed.value)}`}>
                          {fearGreed.value}
                        </p>
                        <Badge variant="outline" className={getFearGreedColor(fearGreed.value)}>
                          {fearGreed.classification}
                        </Badge>
                      </div>
                    ) : <p className="text-2xl font-bold">...</p>}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Articles</p>
                    <p className="text-2xl font-bold">{isLoading ? "..." : articles.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex items-center gap-2">
                  <Clock className="h-6 w-6 text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="text-2xl font-bold">
                      {articles.length > 0 ? formatDate(articles[0].publishedAt) : "..."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <Tabs defaultValue="latest" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="latest">Latest</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="bookmarks">
                  Bookmarks {bookmarks.size > 0 && `(${bookmarks.size})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="latest" className="space-y-4">
                {/* Search + Sort */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search news, articles, topics..."
                      className="pl-9 pr-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-border rounded-md bg-background text-sm"
                  >
                    <option value="publishedAt">Latest</option>
                  </select>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    No articles found{searchQuery ? ` for "${searchQuery}"` : ""}.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filtered.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="trending" className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...articles]
                      .sort((a, b) => (b.tags.length - a.tags.length))
                      .slice(0, 10)
                      .map((article) => (
                        <ArticleCard key={article.id} article={article} />
                      ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="bookmarks">
                {bookmarkedArticles.length === 0 ? (
                  <div className="text-center py-20">
                    <Bookmark className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Bookmarks</h3>
                    <p className="text-muted-foreground">Click the bookmark icon on any article to save it here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {bookmarkedArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

          </main>
        </div>
      </div>
    </div>
  );
}