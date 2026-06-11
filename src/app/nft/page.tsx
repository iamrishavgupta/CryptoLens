"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Image as ImageIcon, Users, Star, Search, X } from "lucide-react";
import { Header } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

interface NFTCollection {
  id: string;
  name: string;
  symbol: string;
  asset_platform_id: string;
  contract_address: string | null;
}

const PLATFORM_COLORS: Record<string, string> = {
  ethereum: "bg-blue-100 text-blue-800",
  solana: "bg-purple-100 text-purple-800",
  ronin: "bg-green-100 text-green-800",
  polygon: "bg-indigo-100 text-indigo-800",
  stargaze: "bg-pink-100 text-pink-800",
};

export default function NFTPage() {
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/nft")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCollections(json.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const filtered = collections.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase()) ||
      c.asset_platform_id.toLowerCase().includes(search.toLowerCase())
  );

  const platforms = [...new Set(collections.map((c) => c.asset_platform_id))];

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
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">NFT Collections</h1>
                <p className="text-muted-foreground">
                  Explore and analyze the top NFT collections
                </p>
              </div>
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, symbol, or chain..."
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

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Collections</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? "..." : collections.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Users className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Blockchains</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? "..." : platforms.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Star className="h-6 w-6 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Showing Results</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? "..." : filtered.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Collections Table */}
            <Card>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20 text-muted-foreground">
                    Loading NFT collections...
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    No collections found for &quot;{search}&quot;
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-xs text-muted-foreground">
                          <th className="text-left px-6 py-3">#</th>
                          <th className="text-left px-4 py-3">Collection</th>
                          <th className="text-left px-4 py-3">Symbol</th>
                          <th className="text-left px-4 py-3">Blockchain</th>
                          <th className="text-left px-4 py-3 hidden md:table-cell">Contract</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((col, index) => (
                          <tr
                            key={col.id}
                            className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() =>
                              window.open(
                                `https://www.coingecko.com/en/nft/${col.id}`,
                                "_blank"
                              )
                            }
                          >
                            <td className="px-6 py-4 text-sm text-muted-foreground">
                              {index + 1}
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-sm font-medium">{col.name}</p>
                            </td>
                            <td className="px-4 py-4 text-sm text-muted-foreground uppercase">
                              {col.symbol}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  PLATFORM_COLORS[col.asset_platform_id] ||
                                  "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {col.asset_platform_id}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-muted-foreground hidden md:table-cell font-mono">
                              {col.contract_address
                                ? `${col.contract_address.slice(0, 6)}...${col.contract_address.slice(-4)}`
                                : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

          </main>
        </div>
      </div>
    </div>
  );
}