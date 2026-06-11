"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, ExternalLink, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: { id: string; name: string };
  category: string;
  readTime: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Bitcoin: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  Ethereum: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  DeFi: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  NFT: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  Regulation: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  Market: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  Technology: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
};

export const FeaturedNews: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/news?pageSize=4")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setArticles(json.data.slice(0, 4));
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const diffM = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
    if (diffM < 60) return `${diffM}m ago`;
    if (diffM < 1440) return `${Math.floor(diffM / 60)}h ago`;
    return `${Math.floor(diffM / 1440)}d ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>📰 Latest Crypto News</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-32 bg-muted rounded-lg animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (articles.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>📰 Latest Crypto News</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No news available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          📰 Latest Crypto News
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/news" className="text-green-500 hover:text-green-600">View All</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Featured */}
        <div className="space-y-3 cursor-pointer" onClick={() => window.open(featured.url, "_blank")}>
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            {featured.urlToImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featured.urlToImage}
                alt={featured.title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <div className="absolute top-2 left-2">
              <Badge className={CATEGORY_COLORS[featured.category] || CATEGORY_COLORS.Market}>
                {featured.category.toUpperCase()}
              </Badge>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-base leading-tight line-clamp-2 hover:text-primary transition-colors">
              {featured.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{featured.description}</p>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />{formatTimeAgo(featured.publishedAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />{featured.readTime} min read
                </span>
              </div>
              <span className="font-medium">{featured.source.name}</span>
            </div>
          </div>
        </div>

        {/* Rest */}
        <div className="space-y-3">
          {rest.map((article) => (
            <div
              key={article.id}
              className="flex gap-3 group cursor-pointer"
              onClick={() => window.open(article.url, "_blank")}
            >
              <div className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                {article.urlToImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : null}
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-start justify-between gap-1">
                  <Badge variant="outline" className={`text-xs ${CATEGORY_COLORS[article.category] || ""}`}>
                    {article.category.toUpperCase()}
                  </Badge>
                  <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h4 className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatTimeAgo(article.publishedAt)}</span>
                  <span>•</span>
                  <span>{article.readTime} min</span>
                  <span>•</span>
                  <span className="truncate">{article.source.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/news">View All News</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};