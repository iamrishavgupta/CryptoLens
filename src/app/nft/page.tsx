"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { Header } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NFTCollection {
  id: string;
  name: string;
  symbol: string;
  assetPlatformId: string;
  contractAddress: string | null;
  image: string;
  nativeCurrencySymbol: string;
  floorPrice: number;
  marketCap: number;
  floorPriceChange24h: number;
  marketCapRank: number;
}

interface NFTResponse {
  success: boolean;
  data: NFTCollection[];
  error?: string;
}

const formatNativeValue = (value: number) => {
  if (!Number.isFinite(value)) return "0";
  if (value >= 1000) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }
  if (value >= 10) return value.toFixed(2);
  if (value >= 1) return value.toFixed(2);
  if (value >= 0.1) return value.toFixed(3);
  return value.toFixed(4);
};

export default function NFTPage() {
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const loadCollections = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/nft");
      const payload: NFTResponse = await response.json();

      if (!response.ok || !payload.success || !Array.isArray(payload.data)) {
        throw new Error(payload.error || "Unable to load NFT collections");
      }

      setCollections(payload.data);
    } catch (loadError) {
      setCollections([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load NFT collections"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return collections;
    return collections.filter(
      (collection) =>
        collection.name.toLowerCase().includes(query) ||
        collection.symbol.toLowerCase().includes(query) ||
        collection.assetPlatformId.toLowerCase().includes(query)
    );
  }, [collections, search]);

  const platformCount = useMemo(
    () =>
      new Set(collections.map((collection) => collection.assetPlatformId)).size,
    [collections]
  );

  return (
    <div className="min-h-screen bg-background">
      <Header
        variant="simplified"
        isMobileMenuOpen={sidebarOpen}
        setIsMobileMenuOpen={setSidebarOpen}
      />
      <div className="w-full px-0 sm:px-4">
        <div className="mx-auto flex w-full max-w-[1536px]">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="min-w-0 flex-1 overflow-x-hidden px-3 py-3 sm:p-5">
            <div className="space-y-5 sm:space-y-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h1 className="text-2xl font-bold sm:text-3xl">NFT Collections</h1>
                  <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                    Explore NFT floor prices and market capitalization
                  </p>
                </div>
                <div className="relative w-full lg:w-96">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search NFT collections..."
                    className="pl-9 pr-9"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  {search && (
                    <button
                      type="button"
                      aria-label="Clear search"
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Card>
                  <CardHeader className="p-3 pb-1 sm:p-6 sm:pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                      Collections
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
                    <p className="text-xl font-bold sm:text-2xl">
                      {isLoading ? "..." : collections.length}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-3 pb-1 sm:p-6 sm:pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                      Blockchains
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
                    <p className="text-xl font-bold sm:text-2xl">
                      {isLoading ? "..." : platformCount}
                    </p>
                  </CardContent>
                </Card>

                <Card className="col-span-2 sm:col-span-1">
                  <CardHeader className="p-3 pb-1 sm:p-6 sm:pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                      Showing Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
                    <p className="text-xl font-bold sm:text-2xl">
                      {isLoading ? "..." : filtered.length}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <section>
                {isLoading ? (
                  <div className="py-20 text-center text-muted-foreground">
                    Loading NFT collections...
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <p className="text-sm text-red-500">{error}</p>
                    <Button variant="outline" size="sm" onClick={loadCollections}>
                      Try again
                    </Button>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="py-20 text-center text-muted-foreground">
                    No collections found for &quot;{search}&quot;
                  </div>
                ) : (
                  <div className="w-full max-w-full overflow-hidden border-0">
                    <table className="w-full table-fixed">
                      <thead>
                        <tr className="text-[10px] text-muted-foreground sm:text-xs">
                          <th className="w-[55%] px-1 py-3 text-left sm:px-4">NFT</th>
                          <th className="w-[25%] px-1 py-3 text-left sm:px-4">Floor Price</th>
                          <th className="w-[20%] px-1 py-3 text-right sm:px-4">Market Cap</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((collection) => {
                          const isPositive = collection.floorPriceChange24h >= 0;
                          const symbol = collection.nativeCurrencySymbol || "Ξ";

                          return (
                            <tr key={collection.id}>
                              <td className="px-1 py-3 sm:px-4 sm:py-4">
                                <a
                                  href={`https://www.coingecko.com/en/nft/${collection.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex min-w-0 items-center gap-2 sm:gap-3"
                                >
                                  <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg bg-muted sm:h-11 sm:w-11">
                                    {collection.image ? (
                                      <Image
                                        src={collection.image}
                                        alt={collection.name}
                                        fill
                                        sizes="44px"
                                        className="object-cover"
                                      />
                                    ) : null}
                                  </div>
                                  <span className="truncate text-xs font-medium sm:text-base">
                                    {collection.name}
                                  </span>
                                </a>
                              </td>
                              <td className="px-1 py-3 sm:px-4 sm:py-4">
                                <p className="whitespace-nowrap text-xs sm:text-base">
                                  {symbol}{formatNativeValue(collection.floorPrice)}
                                </p>
                                {Math.abs(collection.floorPriceChange24h) >= 0.05 && (
                                  <p className={`whitespace-nowrap text-[10px] font-medium sm:text-sm ${
                                    isPositive ? "text-green-500" : "text-red-500"
                                  }`}>
                                    {isPositive ? "▲" : "▼"} {Math.abs(collection.floorPriceChange24h).toFixed(1)}%
                                  </p>
                                )}
                              </td>
                              <td className="overflow-hidden text-ellipsis whitespace-nowrap px-1 py-3 text-right text-xs sm:px-4 sm:py-4 sm:text-base">
                                {symbol}{formatNativeValue(collection.marketCap)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
