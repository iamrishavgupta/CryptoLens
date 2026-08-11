"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Search, X } from "lucide-react";
import { Header } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Exchange {
  id: string;
  name: string;
  image: string;
  trust_score: number;
  trust_score_rank: number;
  trade_volume_24h_btc: number;
  country: string | null;
  year_established: number | null;
  url: string;
  description: string | null;
}

interface ExchangesResponse {
  success: boolean;
  data: Exchange[];
  btcPrice: number;
  error?: string;
}

const formatUsd = (value: number) => {
  if (!Number.isFinite(value)) return "$0";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

export default function ExchangesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [btcPrice, setBtcPrice] = useState(60000);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadExchanges = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/exchanges");
      const payload: ExchangesResponse = await response.json();

      if (!response.ok || !payload.success || !Array.isArray(payload.data)) {
        throw new Error(payload.error || "Unable to load exchanges");
      }

      setExchanges(payload.data);
      setBtcPrice(Number(payload.btcPrice) || 60000);
    } catch (loadError) {
      setExchanges([]);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load exchanges"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExchanges();
  }, [loadExchanges]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return exchanges;
    return exchanges.filter(
      (exchange) =>
        exchange.name.toLowerCase().includes(query) ||
        (exchange.country || "").toLowerCase().includes(query)
    );
  }, [exchanges, search]);

  const totalVolume = useMemo(
    () =>
      exchanges.reduce(
        (sum, exchange) =>
          sum + exchange.trade_volume_24h_btc * btcPrice,
        0
      ),
    [exchanges, btcPrice]
  );

  const averageTrust = exchanges.length
    ? exchanges.reduce((sum, exchange) => sum + exchange.trust_score, 0) /
      exchanges.length
    : 0;

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
                  <h1 className="text-2xl font-bold sm:text-3xl">
                    Cryptocurrency Exchanges
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                    Compare leading exchanges by volume and trust score
                  </p>
                </div>
                <div className="relative w-full lg:w-96">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search exchanges..."
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

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Card>
                  <CardHeader className="p-3 pb-1 sm:p-6 sm:pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                      Total Exchanges
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
                    <p className="text-xl font-bold sm:text-2xl">
                      {isLoading ? "..." : exchanges.length}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-3 pb-1 sm:p-6 sm:pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                      Reported Volume
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
                    <p className="truncate text-xl font-bold sm:text-2xl">
                      {isLoading ? "..." : formatUsd(totalVolume)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="p-3 pb-1 sm:p-6 sm:pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                      Top Exchange
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
                    <p className="truncate text-xl font-bold sm:text-2xl">
                      {isLoading ? "..." : exchanges[0]?.name || "N/A"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-3 pb-1 sm:p-6 sm:pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                      Avg Trust Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-3 pb-3 sm:px-6 sm:pb-6">
                    <p className="text-xl font-bold sm:text-2xl">
                      {isLoading ? "..." : averageTrust.toFixed(1)}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <section>
                <h2 className="mb-4 hidden text-xl font-semibold sm:block">
                  Top Exchanges by Volume
                </h2>

                {isLoading ? (
                  <div className="py-20 text-center text-muted-foreground">
                    Loading live exchange data...
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <p className="text-sm text-red-500">{error}</p>
                    <Button variant="outline" size="sm" onClick={loadExchanges}>
                      Try again
                    </Button>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="py-20 text-center text-muted-foreground">
                    No exchanges found for &quot;{search}&quot;
                  </div>
                ) : (
                  <div className="w-full max-w-full overflow-hidden border-0">
                    <table className="w-full table-fixed">
                      <thead>
                        <tr className="text-[10px] text-muted-foreground sm:text-xs">
                          <th className="w-[10%] px-1 py-3 text-left sm:px-4">#</th>
                          <th className="w-[43%] px-1 py-3 text-left sm:px-4">Exchange</th>
                          <th className="w-[31%] px-1 py-3 text-right sm:px-4">Reported Volume</th>
                          <th className="w-[16%] px-1 py-3 text-right sm:px-4">Trust</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((exchange, index) => {
                          const volumeUsd =
                            exchange.trade_volume_24h_btc * btcPrice;
                          const rank = exchange.trust_score_rank || index + 1;

                          return (
                            <tr key={exchange.id}>
                              <td className="px-1 py-4 text-[11px] text-muted-foreground sm:px-4 sm:py-5 sm:text-sm">
                                {rank}
                              </td>
                              <td className="px-1 py-4 sm:px-4 sm:py-5">
                                <a
                                  href={exchange.url || undefined}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex min-w-0 items-center gap-2 sm:gap-3"
                                >
                                  <div className="relative h-8 w-8 flex-shrink-0 sm:h-10 sm:w-10">
                                    {exchange.image ? (
                                      <Image
                                        src={exchange.image}
                                        alt={exchange.name}
                                        fill
                                        sizes="40px"
                                        className="rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="h-full w-full rounded-full bg-muted" />
                                    )}
                                  </div>
                                  <span className="line-clamp-2 text-xs font-medium leading-tight sm:text-base">
                                    {exchange.name}
                                  </span>
                                </a>
                              </td>
                              <td className="overflow-hidden text-ellipsis whitespace-nowrap px-1 py-4 text-right text-[11px] sm:px-4 sm:py-5 sm:text-base">
                                {formatUsd(volumeUsd)}
                              </td>
                              <td className="px-1 py-4 text-right sm:px-4 sm:py-5">
                                <span className="inline-flex whitespace-nowrap rounded-md bg-emerald-950/80 px-1.5 py-1 text-[10px] font-medium text-emerald-500 sm:px-3 sm:text-sm">
                                  {exchange.trust_score}/10
                                </span>
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
