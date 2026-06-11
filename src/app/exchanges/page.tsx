"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search, TrendingUp, TrendingDown,
  Star, ExternalLink, Shield, Globe, Volume2, X,
} from "lucide-react";
import Image from "next/image";

interface Exchange {
  id: string;
  name: string;
  image: string;
  trust_score: number;
  trade_volume_24h_btc: number;
  country: string | null;
  year_established: number | null;
  url: string;
  description: string | null;
  has_trading_incentive: boolean;
}

export default function ExchangesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [btcPrice, setBtcPrice] = useState(0);

  useEffect(() => {
    // Fetch BTC price to convert volume
    fetch("/api/market?per_page=1&page=1")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setBtcPrice(json.data[0]?.currentPrice || 60000);
      })
      .catch(() => setBtcPrice(60000));

    // Fetch exchanges from CoinGecko
    fetch(
      "https://api.coingecko.com/api/v3/exchanges?per_page=50&page=1",
      {
        headers: {
          Accept: "application/json",
          "x-cg-demo-api-key": process.env.NEXT_PUBLIC_COINGECKO_API_KEY || "",
        },
      }
    )
      .then((r) => r.json())
      .then((data) => {
        setExchanges(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const formatVolume = (btcVolume: number) => {
    const usd = btcVolume * btcPrice;
    if (usd >= 1e9) return `$${(usd / 1e9).toFixed(2)}B`;
    if (usd >= 1e6) return `$${(usd / 1e6).toFixed(2)}M`;
    return `$${usd.toLocaleString()}`;
  };

  const getTrustScoreBadge = (score: number) => {
    if (score >= 8) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (score >= 5) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  const totalVolume = exchanges.reduce((sum, e) => sum + e.trade_volume_24h_btc * btcPrice, 0);

  const filtered = exchanges.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    (e.country || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header
        variant="simplified"
        isMobileMenuOpen={sidebarOpen}
        setIsMobileMenuOpen={setSidebarOpen}
      />
      <div className="container mx-auto px-4">
        <div className="w-full max-w-[1536px] mx-auto flex">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 p-5">
            <div className="space-y-6">

              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold">Cryptocurrency Exchanges</h1>
                  <p className="text-muted-foreground mt-2">
                    Compare and discover the best cryptocurrency exchanges worldwide
                  </p>
                </div>
                <div className="relative max-w-md w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search exchanges..."
                    className="pl-10 pr-9"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Exchanges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{isLoading ? "..." : `${exchanges.length}+`}</div>
                    <p className="text-xs text-muted-foreground">Tracked globally</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">24h Volume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoading ? "..." : totalVolume >= 1e9 ? `$${(totalVolume / 1e9).toFixed(1)}B` : "..."}
                    </div>
                    <p className="text-xs text-muted-foreground">Combined volume</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Top Exchange</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{isLoading ? "..." : exchanges[0]?.name || "N/A"}</div>
                    <p className="text-xs text-muted-foreground">By trading volume</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Avg Trust Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {isLoading ? "..." : (exchanges.reduce((s, e) => s + (e.trust_score || 0), 0) / exchanges.length).toFixed(1)}
                    </div>
                    <p className="text-xs text-muted-foreground">Out of 10</p>
                  </CardContent>
                </Card>
              </div>

              {/* Exchanges List */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  Top Exchanges by Volume
                  {search && <span className="text-base font-normal text-muted-foreground ml-2">— "{search}"</span>}
                </h2>

                {isLoading ? (
                  <div className="flex items-center justify-center py-20 text-muted-foreground">
                    Loading live exchange data...
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    No exchanges found for &quot;{search}&quot;
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filtered.map((exchange, index) => (
                      <Card key={exchange.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                            <div className="flex items-center space-x-4 flex-1">
                              <div className="flex items-center space-x-3">
                                <span className="text-muted-foreground font-mono text-sm w-6">
                                  #{index + 1}
                                </span>
                                <div className="relative w-10 h-10">
                                  <Image
                                    src={exchange.image}
                                    alt={exchange.name}
                                    fill
                                    className="rounded-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/placeholder.png";
                                    }}
                                  />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg">{exchange.name}</h3>
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {exchange.description || "Cryptocurrency exchange"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-6 lg:gap-8">
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground mb-1">Trust Score</div>
                                <Badge className={getTrustScoreBadge(exchange.trust_score)}>
                                  {exchange.trust_score}/10
                                </Badge>
                              </div>

                              <div className="text-center">
                                <div className="text-xs text-muted-foreground mb-1">24h Volume</div>
                                <div className="font-semibold">{formatVolume(exchange.trade_volume_24h_btc)}</div>
                              </div>

                              <div className="text-center">
                                <div className="text-xs text-muted-foreground mb-1">Country</div>
                                <div className="font-semibold text-sm">{exchange.country || "N/A"}</div>
                              </div>

                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(exchange.url, "_blank")}
                                >
                                  <ExternalLink className="w-4 h-4 mr-1" />
                                  Visit
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-muted flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {exchange.year_established && (
                              <div className="flex items-center">
                                <Globe className="w-4 h-4 mr-1" />
                                Established {exchange.year_established}
                              </div>
                            )}
                            <div className="flex items-center">
                              <Shield className="w-4 h-4 mr-1" />
                              API Available
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}