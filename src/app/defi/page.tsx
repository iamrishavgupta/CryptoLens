"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DollarSign, Activity, ArrowUpRight, ArrowDownRight,
  Search, X, ExternalLink, Coins,
} from "lucide-react";
import Image from "next/image";

interface DeFiProtocol {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  category: string;
  tvl: number;
  tvlChange24h: number;
  chains: string[];
  description: string;
  website: string;
}

const categories = ["All", "Lending", "DEX", "Yield", "Bridge", "CDP", "Liquid Staking"];

export default function DeFiPage() {
  const [protocols, setProtocols] = useState<DeFiProtocol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("tvl");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/defi")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setProtocols(json.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
    return `$${amount.toLocaleString()}`;
  };

  const filtered = protocols
    .filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.symbol.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        selectedCategory === "All" ||
        p.category.toLowerCase().includes(selectedCategory.toLowerCase());
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === "tvl") return b.tvl - a.tvl;
      if (sortBy === "change") return b.tvlChange24h - a.tvlChange24h;
      return 0;
    });

  const totalTVL = protocols.reduce((sum, p) => sum + p.tvl, 0);
  const uniqueCategories = Array.from(
    new Set(protocols.map((protocol) => protocol.category))
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
          <main className="flex-1 p-5 space-y-6">

            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold">DeFi Protocols</h1>
              <p className="text-muted-foreground">
                Discover and analyze decentralized finance protocols
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total TVL</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? "..." : formatCurrency(totalTVL)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Active Protocols</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? "..." : protocols.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Coins className="h-6 w-6 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Categories</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? "..." : uniqueCategories.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search protocols..."
                  className="pl-10 pr-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-border rounded-md bg-background text-sm"
              >
                <option value="tvl">Sort by TVL</option>
                <option value="change">Sort by 24h Change</option>
              </select>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
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

            {/* Protocols Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground">
                Loading live DeFi data...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                No protocols found for &quot;{search}&quot;
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((protocol) => (
                  <Card key={protocol.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {protocol.logo ? (
                            <Image
                              src={protocol.logo}
                              alt={protocol.name}
                              width={32}
                              height={32}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <Coins className="h-4 w-4 text-white" />
                            </div>
                          )}
                          <div>
                            <CardTitle className="text-lg">{protocol.name}</CardTitle>
                            <CardDescription>{protocol.symbol}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary">{protocol.category}</Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {protocol.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {protocol.description}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">TVL</p>
                          <div className="flex items-center space-x-1">
                            <p className="font-semibold">{formatCurrency(protocol.tvl)}</p>
                            <div className={`flex items-center ${protocol.tvlChange24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                              {protocol.tvlChange24h >= 0
                                ? <ArrowUpRight className="h-3 w-3" />
                                : <ArrowDownRight className="h-3 w-3" />}
                              <span className="text-xs">
                                {Math.abs(protocol.tvlChange24h).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Chains</p>
                          <p className="font-semibold">{protocol.chains.length}</p>
                        </div>
                      </div>

                      {protocol.chains.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Supported Chains</p>
                          <div className="flex flex-wrap gap-1">
                            {protocol.chains.slice(0, 4).map((chain) => (
                              <Badge key={chain} variant="outline" className="text-xs">
                                {chain}
                              </Badge>
                            ))}
                            {protocol.chains.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{protocol.chains.length - 4}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => protocol.website && window.open(protocol.website, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Protocol
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}