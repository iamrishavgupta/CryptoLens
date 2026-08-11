"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BellOff,
  ChevronDown,
  CirclePlus,
  Eye,
  ListFilter,
  Plus,
  SlidersHorizontal,
  Star,
  Trash2,
  Wallet,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { withAuthRequired } from "@/components/common/withAuth";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

interface Holding {
  id: string;
  coinId: string;
  symbol: string;
  name: string;
  image: string;
  amount: number;
  buyPrice: number;
  currentPrice?: number;
  priceChangePercentage24h?: number;
}
interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  priceChangePercentage24h: number;
}

type PortfolioTab = "coins" | "analytics" | "insights";
type CurrencyMode = "USD" | "BTC";
type SortMode = "value" | "symbol";

const formatAmount = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: 6 });

function PortfolioPageClientComponent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [coins, setCoins] = useState<MarketCoin[]>([]);
  const [activeTab, setActiveTab] = useState<PortfolioTab>("coins");
  const [currencyMode, setCurrencyMode] = useState<CurrencyMode>("USD");
  const [sortMode, setSortMode] = useState<SortMode>("value");
  const [descending, setDescending] = useState(true);
  const [showGainersOnly, setShowGainersOnly] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<MarketCoin | null>(null);
  const [amount, setAmount] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    fetch("/api/market?per_page=100&page=1")
      .then((response) => response.json())
      .then((payload) => {
        if (payload.success && Array.isArray(payload.data)) {
          setCoins(payload.data);
        }
      })
      .catch(() => setCoins([]));
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    const holdingsQuery = query(
      collection(db, "holdings"),
      where("userId", "==", user.uid)
    );
    const unsubscribe = onSnapshot(
      holdingsQuery,
      async (snapshot) => {
        const data = snapshot.docs.map((snapshotDoc) => ({
          id: snapshotDoc.id,
          ...snapshotDoc.data(),
        })) as Holding[];

        if (data.length > 0) {
          try {
            const response = await fetch("/api/market?per_page=100&page=1");
            const payload = await response.json();
            if (payload.success && Array.isArray(payload.data)) {
              const marketMap = new Map<string, MarketCoin>(
                payload.data.map((coin: MarketCoin) => [coin.id, coin])
              );
              data.forEach((holding) => {
                const marketCoin = marketMap.get(holding.coinId);
                holding.currentPrice = marketCoin?.currentPrice || holding.buyPrice;
                holding.priceChangePercentage24h =
                  marketCoin?.priceChangePercentage24h || 0;
              });
            }
          } catch {
            data.forEach((holding) => {
              holding.currentPrice = holding.buyPrice;
              holding.priceChangePercentage24h = 0;
            });
          }
        }

        setHoldings(data);
        setIsLoading(false);
      },
      () => {
        setHoldings([]);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const handleAddHolding = async () => {
    if (!selectedCoin || !amount || !buyPrice || !user?.uid) return;
    setIsAdding(true);
    try {
      await addDoc(collection(db, "holdings"), {
        userId: user.uid,
        coinId: selectedCoin.id,
        symbol: selectedCoin.symbol,
        name: selectedCoin.name,
        image: selectedCoin.image,
        amount: Number(amount),
        buyPrice: Number(buyPrice),
        createdAt: new Date().toISOString(),
      });
      setSelectedCoin(null);
      setAmount("");
      setBuyPrice("");
      setSearch("");
      setShowForm(false);
    } catch (error) {
      console.error("Failed to add holding:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "holdings", id));
  };
  const totals = useMemo(() => {
    return holdings.reduce(
      (result, holding) => {
        const currentPrice = holding.currentPrice || holding.buyPrice;
        const value = holding.amount * currentPrice;
        const cost = holding.amount * holding.buyPrice;
        const changePct = holding.priceChangePercentage24h || 0;
        result.value += value;
        result.cost += cost;
        result.dayChange += value * (changePct / 100);
        return result;
      },
      { value: 0, cost: 0, dayChange: 0 }
    );
  }, [holdings]);

  const totalPnL = totals.value - totals.cost;
  const totalPnLPct = totals.cost > 0 ? (totalPnL / totals.cost) * 100 : 0;
  const dayChangePct = totals.value > 0 ? (totals.dayChange / totals.value) * 100 : 0;
  const btcPrice = coins.find((coin) => coin.id === "bitcoin")?.currentPrice || 1;

  const displayValue = (value: number, compact = false) => {
    if (currencyMode === "BTC") {
      return `₿${(value / btcPrice).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6,
      })}`;
    }
    if (compact && Math.abs(value) >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    }
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    }
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(8)}`;
  };

  const filteredCoins = coins
    .filter(
      (coin) =>
        coin.name.toLowerCase().includes(search.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 8);

  const visibleHoldings = useMemo(() => {
    const next = holdings.filter(
      (holding) =>
        !showGainersOnly || (holding.priceChangePercentage24h || 0) > 0
    );

    return next.sort((a, b) => {
      const comparison =
        sortMode === "symbol"
          ? a.symbol.localeCompare(b.symbol)
          : a.amount * (a.currentPrice || a.buyPrice) -
            b.amount * (b.currentPrice || b.buyPrice);
      return descending ? -comparison : comparison;
    });
  }, [holdings, showGainersOnly, sortMode, descending]);
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
          <main className="min-w-0 flex-1 overflow-x-hidden px-4 py-4 sm:p-5">
            <div className="mx-auto w-full max-w-5xl space-y-5">
              <section>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-800 sm:h-12 sm:w-12">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex min-w-0 items-center gap-1.5">
                      <h1 className="truncate text-lg font-semibold text-slate-300 sm:text-2xl">
                        My Portfolio
                      </h1>
                      <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full bg-red-500" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-300">
                    <button type="button" aria-label="Mute portfolio notifications">
                      <BellOff className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Add coins"
                      onClick={() => setShowForm(true)}
                    >
                      <CirclePlus className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <p className="text-4xl font-semibold tracking-tight sm:text-5xl">
                    {displayValue(totals.value)}
                  </p>
                  <Eye className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="mt-1.5 space-y-1 text-sm sm:text-base">
                  <p className={totals.dayChange >= 0 ? "text-green-500" : "text-red-500"}>
                    {totals.dayChange >= 0 ? "▲" : "▼"}
                    {displayValue(Math.abs(totals.dayChange))} ({dayChangePct.toFixed(2)}%)
                    <span className="ml-1 text-muted-foreground">24h change</span>
                  </p>
                  <p className={totalPnL >= 0 ? "text-green-500" : "text-red-500"}>
                    {totalPnL >= 0 ? "▲" : "▼"}
                    {displayValue(Math.abs(totalPnL))} ({totalPnLPct.toFixed(2)}%)
                    <span className="ml-1 text-muted-foreground">Total P&amp;L</span>
                  </p>
                </div>
              </section>

              <nav className="flex items-center gap-8" aria-label="Portfolio views">
                {(["coins", "analytics", "insights"] as PortfolioTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`text-lg capitalize transition-colors ${
                      activeTab === tab
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>

              {showForm && (
                <Card className="rounded-xl">
                  <CardHeader className="p-4 pb-2 sm:p-6 sm:pb-3">
                    <CardTitle className="text-lg">Add Coins</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Search Coin</label>
                      <Input
                        placeholder="Search by name or symbol..."
                        value={search}
                        onChange={(event) => {
                          setSearch(event.target.value);
                          setSelectedCoin(null);
                        }}
                      />
                      {search && !selectedCoin && filteredCoins.length > 0 && (
                        <div className="max-h-48 overflow-y-auto rounded-md border divide-y">
                          {filteredCoins.map((coin) => (
                            <button
                              key={coin.id}
                              type="button"
                              className="flex w-full min-w-0 items-center gap-2 px-3 py-2 text-left hover:bg-muted"
                              onClick={() => {
                                setSelectedCoin(coin);
                                setSearch(coin.name);
                                setBuyPrice(String(coin.currentPrice));
                              }}
                            >
                              <Image src={coin.image} alt={coin.name} width={24} height={24} className="flex-shrink-0 rounded-full" />
                              <span className="min-w-0 flex-1 truncate text-sm font-medium">{coin.name}</span>
                              <span className="text-xs uppercase text-muted-foreground">{coin.symbol}</span>
                              <span className="whitespace-nowrap text-xs">{formatPrice(coin.currentPrice)}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {selectedCoin && (
                        <div className="flex min-w-0 items-center gap-2 rounded-md bg-muted p-2">
                          <Image src={selectedCoin.image} alt={selectedCoin.name} width={24} height={24} className="flex-shrink-0 rounded-full" />
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">{selectedCoin.name}</span>
                          <Badge variant="outline">{selectedCoin.symbol.toUpperCase()}</Badge>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Amount</label>
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="e.g. 0.5"
                          value={amount}
                          onChange={(event) => setAmount(event.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Buy Price (USD)</label>
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          placeholder="e.g. 60000"
                          value={buyPrice}
                          onChange={(event) => setBuyPrice(event.target.value)}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        className="flex-1 bg-lime-500 text-slate-950 hover:bg-lime-400"
                        onClick={handleAddHolding}
                        disabled={!selectedCoin || !amount || !buyPrice || isAdding}
                      >
                        {isAdding ? "Adding..." : "Add Coin"}
                      </Button>
                      <Button variant="outline" onClick={() => setShowForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === "coins" && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrencyMode((mode) => mode === "USD" ? "BTC" : "USD")}
                      className="rounded-xl bg-slate-800 px-4 py-2.5 text-base font-medium"
                    >
                      <span className={currencyMode === "USD" ? "text-foreground" : "text-muted-foreground"}>USD</span>
                      <span className="mx-1 text-muted-foreground">/</span>
                      <span className={currencyMode === "BTC" ? "text-foreground" : "text-muted-foreground"}>BTC</span>
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        aria-label="Reverse sort order"
                        onClick={() => setDescending((value) => !value)}
                        className="rounded-xl bg-slate-800 p-3"
                      >
                        {descending ? <ArrowDown className="h-5 w-5" /> : <ArrowUp className="h-5 w-5" />}
                      </button>
                      <button
                        type="button"
                        aria-label="Show gaining coins only"
                        aria-pressed={showGainersOnly}
                        onClick={() => setShowGainersOnly((value) => !value)}
                        className={`rounded-xl p-3 ${showGainersOnly ? "bg-lime-500 text-slate-950" : "bg-slate-800"}`}
                      >
                        <ListFilter className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Change sorting field"
                        onClick={() => setSortMode((mode) => mode === "value" ? "symbol" : "value")}
                        className="rounded-xl bg-slate-800 p-3"
                      >
                        <SlidersHorizontal className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-[30%_35%_35%] px-1 text-xs text-muted-foreground sm:text-sm">
                    <span>Coin</span>
                    <span className="text-right">Price / 24H</span>
                    <span className="flex items-center justify-end gap-0.5 text-foreground">
                      Holdings <ChevronDown className="h-3 w-3" />
                    </span>
                  </div>

                  {isLoading ? (
                    <div className="py-16 text-center text-muted-foreground">
                      Loading portfolio...
                    </div>
                  ) : visibleHoldings.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
                      <Wallet className="h-10 w-10 opacity-30" />
                      <p className="text-sm">
                        {showGainersOnly
                          ? "No gaining coins in this portfolio."
                          : "No holdings yet. Add your first coin to get started."}
                      </p>
                    </div>
                  ) : (
                    <div>
                      {visibleHoldings.map((holding) => {
                        const currentPrice = holding.currentPrice || holding.buyPrice;
                        const change = holding.priceChangePercentage24h || 0;
                        const holdingValue = holding.amount * currentPrice;
                        const isPositive = change >= 0;

                        return (
                          <div
                            key={holding.id}
                            className="group grid grid-cols-[30%_35%_35%] items-center py-3.5 sm:py-4"
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              {holding.image ? (
                                <Image
                                  src={holding.image}
                                  alt={holding.name}
                                  width={32}
                                  height={32}
                                  className="h-8 w-8 flex-shrink-0 rounded-full"
                                />
                              ) : (
                                <div className="h-8 w-8 flex-shrink-0 rounded-full bg-muted" />
                              )}
                              <span className="truncate text-base font-medium uppercase">
                                {holding.symbol}
                              </span>
                              <button
                                type="button"
                                aria-label={`Remove ${holding.name}`}
                                onClick={() => handleDelete(holding.id)}
                                className="hidden text-red-500 opacity-0 transition-opacity group-hover:opacity-100 sm:block"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="min-w-0 text-right">
                              <p className="truncate text-base">{formatPrice(currentPrice)}</p>
                              <p className={`text-base ${isPositive ? "text-green-500" : "text-red-500"}`}>
                                {isPositive ? "▲" : "▼"} {Math.abs(change).toFixed(1)}%
                              </p>
                            </div>
                            <div className="min-w-0 text-right">
                              <p className="truncate text-base">{displayValue(holdingValue)}</p>
                              <p className="truncate text-base text-muted-foreground">
                                {formatAmount(holding.amount)} {holding.symbol.toUpperCase()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <Button
                    onClick={() => setShowForm(true)}
                    className="h-12 w-full bg-lime-500 text-base font-medium text-slate-950 shadow-[0_4px_0_rgba(34,197,94,0.35)] hover:bg-lime-400"
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Add Coins
                  </Button>
                </section>
              )}
              {activeTab === "analytics" && (
                <section className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">Invested</p>
                      <p className="mt-1 truncate text-lg font-semibold">{displayValue(totals.cost)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">Return</p>
                      <p className={`mt-1 text-lg font-semibold ${totalPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {totalPnLPct.toFixed(2)}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="col-span-2">
                    <CardContent className="space-y-3 p-4">
                      <p className="text-sm font-medium">Portfolio allocation</p>
                      {holdings.map((holding) => {
                        const value = holding.amount * (holding.currentPrice || holding.buyPrice);
                        const allocation = totals.value > 0 ? (value / totals.value) * 100 : 0;
                        return (
                          <div key={holding.id} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="uppercase">{holding.symbol}</span>
                              <span>{allocation.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-lime-500" style={{ width: `${allocation}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </section>
              )}

              {activeTab === "insights" && (
                <Card>
                  <CardContent className="space-y-2 p-5">
                    <p className="font-medium">Portfolio insight</p>
                    <p className="text-sm text-muted-foreground">
                      {holdings.length === 0
                        ? "Add coins to receive portfolio insights."
                        : totalPnL >= 0
                          ? `Your portfolio is up ${totalPnLPct.toFixed(2)}% overall.`
                          : `Your portfolio is down ${Math.abs(totalPnLPct).toFixed(2)}% overall.`}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ArrowUpDown className="h-4 w-4" />
                      {holdings.length} tracked {holdings.length === 1 ? "asset" : "assets"}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export const PortfolioPageClient = withAuthRequired(PortfolioPageClientComponent);
