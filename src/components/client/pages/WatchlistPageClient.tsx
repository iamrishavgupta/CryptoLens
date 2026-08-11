"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus, Star, Trash2, TrendingUp, TrendingDown,
  Bell, BellOff, Search, X,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection, addDoc, deleteDoc, doc,
  onSnapshot, query, where, updateDoc,
} from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

interface WatchlistItem {
  id: string;
  userId: string;
  watchlistId: string;
  coinId: string;
  symbol: string;
  name: string;
  image: string;
  alertsEnabled: boolean;
  addedAt: string;
  // live data
  currentPrice?: number;
  priceChange24h?: number;
  marketCap?: number;
  totalVolume?: number;
  marketCapRank?: number;
}

interface Watchlist {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export default function WatchlistPageClient() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string | null>(null);
  const [coins, setCoins] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [coinSearch, setCoinSearch] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAddCoin, setShowAddCoin] = useState(false);
  const [newName, setNewName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Load live coin prices
  useEffect(() => {
    fetch("/api/market?per_page=100&page=1")
      .then((r) => r.json())
      .then((json) => { if (json.success) setCoins(json.data); });
  }, []);

  // Load watchlists from Firestore
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, "watchlists"), where("userId", "==", user.uid));
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Watchlist[];
      setWatchlists(data);
      if (data.length > 0 && !selectedWatchlistId) {
        setSelectedWatchlistId(data[0].id);
      }
      setIsLoading(false);
    });
  }, [user?.uid]);

  // Load watchlist items from Firestore
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, "watchlistItems"), where("userId", "==", user.uid));
    return onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as WatchlistItem[];
      // Inject live prices
      const priceMap: Record<string, any> = {};
      coins.forEach((c) => { priceMap[c.id] = c; });
      data.forEach((item) => {
        const live = priceMap[item.coinId];
        if (live) {
          item.currentPrice = live.currentPrice;
          item.priceChange24h = live.priceChangePercentage24h;
          item.marketCap = live.marketCap;
          item.totalVolume = live.totalVolume;
          item.marketCapRank = live.marketCapRank;
        }
      });
      setItems(data);
    });
  }, [user?.uid, coins]);

  const createWatchlist = async () => {
    if (!newName.trim() || !user?.uid) return;
    await addDoc(collection(db, "watchlists"), {
      userId: user.uid,
      name: newName,
      createdAt: new Date().toISOString(),
    });
    setNewName("");
    setShowCreateDialog(false);
  };

  const deleteWatchlist = async (id: string) => {
    await deleteDoc(doc(db, "watchlists", id));
    // Delete all items in this watchlist
    const toDelete = items.filter((i) => i.watchlistId === id);
    await Promise.all(toDelete.map((i) => deleteDoc(doc(db, "watchlistItems", i.id))));
    if (selectedWatchlistId === id) setSelectedWatchlistId(watchlists.find((w) => w.id !== id)?.id || null);
  };

  const addCoinToWatchlist = async (coin: any) => {
    if (!selectedWatchlistId || !user?.uid) return;
    const already = items.find((i) => i.coinId === coin.id && i.watchlistId === selectedWatchlistId);
    if (already) return;
    await addDoc(collection(db, "watchlistItems"), {
      userId: user.uid,
      watchlistId: selectedWatchlistId,
      coinId: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      alertsEnabled: false,
      addedAt: new Date().toISOString(),
    });
    setCoinSearch("");
    setShowAddCoin(false);
  };

  const removeItem = async (id: string) => {
    await deleteDoc(doc(db, "watchlistItems", id));
  };

  const toggleAlert = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "watchlistItems", id), { alertsEnabled: !current });
  };

  const formatPrice = (price?: number) => {
    if (price == null) return "N/A";
    if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(6)}`;
  };

  const formatLarge = (n?: number) => {
    if (n == null) return "N/A";
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toLocaleString()}`;
  };

  const selectedWatchlist = watchlists.find((w) => w.id === selectedWatchlistId);
  const selectedItems = items.filter((i) => i.watchlistId === selectedWatchlistId);

  const filteredItems = selectedItems.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const avgChange = selectedItems.length
    ? selectedItems.reduce((s, i) => s + (i.priceChange24h || 0), 0) / selectedItems.length
    : 0;

  const filteredCoinSearch = coins
    .filter((c) =>
      c.name.toLowerCase().includes(coinSearch.toLowerCase()) ||
      c.symbol.toLowerCase().includes(coinSearch.toLowerCase())
    )
    .slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      <Header
        variant="simplified"
        isMobileMenuOpen={sidebarOpen}
        setIsMobileMenuOpen={setSidebarOpen}
      />
      <div className="mx-auto flex w-full max-w-[1536px] px-3 sm:px-4">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="min-w-0 flex-1 space-y-5 overflow-x-hidden py-4 sm:p-5 sm:space-y-6">

          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
                <Star className="h-7 w-7 flex-shrink-0 text-yellow-500" />
                Watchlists
              </h1>
              <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                Track your favorite cryptocurrencies
              </p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="flex-shrink-0 bg-emerald-500 px-3 text-white hover:bg-emerald-400 sm:px-4">
                  <Plus className="mr-1.5 h-4 w-4" />
                  <span className="hidden min-[360px]:inline">Create Watchlist</span>
                  <span className="min-[360px]:hidden">Create</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Watchlist</DialogTitle>
                  <DialogDescription>Give your watchlist a name</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Watchlist Name</Label>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. DeFi Tokens"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={createWatchlist} className="flex-1">Create</Button>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">Cancel</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Watchlist Tabs */}
          {isLoading ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              Loading watchlists...
            </div>
          ) : watchlists.length === 0 ? (
            <Card className="rounded-none border-0 shadow-none sm:rounded-lg sm:border sm:shadow-sm">
              <CardContent className="px-4 py-12 text-center sm:p-12">
                <Star className="mx-auto mb-4 h-12 w-12 text-muted-foreground sm:h-16 sm:w-16" />
                <h3 className="mb-2 text-lg font-semibold">No watchlists yet</h3>
                <p className="mb-4 text-sm text-muted-foreground sm:text-base">
                  Create your first watchlist to start tracking coins
                </p>
                <Button
                  className="bg-emerald-500 text-white hover:bg-emerald-400"
                  onClick={() => setShowCreateDialog(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />Create Watchlist
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex max-w-full gap-2 overflow-x-auto pb-1">
                {watchlists.map((watchlist) => {
                  const isSelected = selectedWatchlistId === watchlist.id;
                  const itemCount = items.filter((item) => item.watchlistId === watchlist.id).length;
                  return (
                    <div key={watchlist.id} className="flex flex-shrink-0 items-center gap-1">
                      <Button
                        variant="outline"
                        className={isSelected
                          ? "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-400"
                          : "bg-background"}
                        onClick={() => setSelectedWatchlistId(watchlist.id)}
                      >
                        <span className="max-w-36 truncate">{watchlist.name}</span>
                        <Badge className="ml-2 rounded-full border-0 bg-slate-800 text-white hover:bg-slate-800">
                          {itemCount}
                        </Badge>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${watchlist.name}`}
                        className="h-8 w-8 flex-shrink-0 text-red-500"
                        onClick={() => deleteWatchlist(watchlist.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>

              {selectedWatchlist && (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Card>
                      <CardContent className="flex items-center gap-3 p-5 sm:p-6">
                        <Star className="h-6 w-6 flex-shrink-0 text-yellow-500" />
                        <div className="min-w-0">
                          <p className="text-sm text-muted-foreground">Total Coins</p>
                          <p className="text-2xl font-bold">{selectedItems.length}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="flex items-center gap-3 p-5 sm:p-6">
                        <TrendingUp className="h-6 w-6 flex-shrink-0 text-green-500" />
                        <div className="min-w-0">
                          <p className="text-sm text-muted-foreground">Combined Value</p>
                          <p className="truncate text-2xl font-bold">
                            {formatLarge(selectedItems.reduce((sum, item) => sum + (item.currentPrice || 0), 0))}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="flex items-center gap-3 p-5 sm:p-6">
                        {avgChange >= 0
                          ? <TrendingUp className="h-6 w-6 flex-shrink-0 text-green-500" />
                          : <TrendingDown className="h-6 w-6 flex-shrink-0 text-red-500" />}
                        <div className="min-w-0">
                          <p className="text-sm text-muted-foreground">Avg 24h Change</p>
                          <p className={`truncate text-2xl font-bold ${avgChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {avgChange >= 0 ? "+" : ""}{avgChange.toFixed(2)}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Search + Add */}
                  <div className="flex min-w-0 gap-2">
                    <div className="relative min-w-0 flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search watchlist..."
                        className="pl-9 pr-8"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                      />
                      {search && (
                        <button
                          type="button"
                          aria-label="Clear watchlist search"
                          onClick={() => setSearch("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                    <Button
                      className="flex-shrink-0 bg-emerald-500 px-3 text-white hover:bg-emerald-400 sm:px-4"
                      onClick={() => setShowAddCoin((visible) => !visible)}
                    >
                      <Plus className="mr-1.5 h-4 w-4" />
                      <span className="whitespace-nowrap">Add Coin</span>
                    </Button>
                  </div>

                  {/* Add Coin Search */}
                  {showAddCoin && (
                    <Card className="rounded-xl">
                      <CardContent className="space-y-3 p-4 sm:p-5">
                        <p className="truncate font-medium">Add coin to {selectedWatchlist.name}</p>
                        <Input
                          placeholder="Search by name or symbol..."
                          value={coinSearch}
                          onChange={(event) => setCoinSearch(event.target.value)}
                          autoFocus
                        />
                        {coinSearch && (
                          <div className="max-h-52 overflow-y-auto rounded-md border divide-y">
                            {filteredCoinSearch.length === 0 ? (
                              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                                No coins found
                              </p>
                            ) : filteredCoinSearch.map((coin) => {
                              const already = items.some(
                                (item) => item.coinId === coin.id && item.watchlistId === selectedWatchlistId
                              );
                              return (
                                <button
                                  key={coin.id}
                                  type="button"
                                  className="flex w-full min-w-0 items-center gap-2 px-3 py-2 text-left hover:bg-muted disabled:opacity-50"
                                  onClick={() => addCoinToWatchlist(coin)}
                                  disabled={already}
                                >
                                  <Image
                                    src={coin.image}
                                    alt={coin.name}
                                    width={24}
                                    height={24}
                                    className="h-6 w-6 flex-shrink-0 rounded-full"
                                  />
                                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{coin.name}</span>
                                  <span className="flex-shrink-0 text-xs uppercase text-muted-foreground">{coin.symbol}</span>
                                  <span className="flex-shrink-0 whitespace-nowrap text-xs sm:text-sm">
                                    {formatPrice(coin.currentPrice)}
                                  </span>
                                  {already && <Badge variant="secondary" className="hidden text-xs sm:inline-flex">Added</Badge>}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        <Button variant="outline" size="sm" onClick={() => setShowAddCoin(false)}>
                          Cancel
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Table */}
                  {selectedItems.length === 0 ? (
                    <Card className="rounded-none border-0 shadow-none sm:rounded-lg sm:border sm:shadow-sm">
                      <CardContent className="px-4 py-12 text-center sm:p-12">
                        <Star className="mx-auto mb-4 h-12 w-12 text-muted-foreground sm:h-16 sm:w-16" />
                        <h3 className="mb-2 text-lg font-semibold">No coins yet</h3>
                        <p className="mb-4 text-sm text-muted-foreground sm:text-base">Add coins to start tracking</p>
                        <Button
                          className="bg-emerald-500 text-white hover:bg-emerald-400"
                          onClick={() => setShowAddCoin(true)}
                        >
                          <Plus className="mr-2 h-4 w-4" />Add Coin
                        </Button>
                      </CardContent>
                    </Card>
                  ) : filteredItems.length === 0 ? (
                    <div className="py-16 text-center text-sm text-muted-foreground">
                      No coins found for &quot;{search}&quot;
                    </div>
                  ) : (
                    <Card className="w-full max-w-full overflow-hidden rounded-none border-0 shadow-none sm:rounded-lg sm:border sm:shadow-sm">
                      <CardContent className="p-0">
                        <div className="overflow-hidden">
                          <table className="w-full table-fixed sm:table-auto">
                            <thead>
                              <tr className="border-b-0 text-[10px] text-muted-foreground sm:border-b sm:text-xs">
                                <th className="w-[7%] px-1 py-3 text-left sm:w-auto sm:px-4">#</th>
                                <th className="w-[27%] px-1 py-3 text-left sm:w-auto sm:px-4">Coin</th>
                                <th className="w-[24%] px-1 py-3 text-right sm:w-auto sm:px-4">Price</th>
                                <th className="w-[18%] px-1 py-3 text-right sm:w-auto sm:px-4">24H</th>
                                <th className="w-[24%] px-1 py-3 text-right sm:w-auto sm:px-4">Market Cap</th>
                                <th className="hidden px-4 py-3 text-right lg:table-cell">Volume</th>
                                <th className="hidden px-4 py-3 text-center sm:table-cell">Alerts</th>
                                <th className="hidden px-4 py-3 text-center sm:table-cell">Remove</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredItems.map((item) => {
                                const isPositive = (item.priceChange24h || 0) >= 0;
                                return (
                                  <tr key={item.id} className="border-b-0 transition-colors hover:bg-muted/50 sm:border-b">
                                    <td className="px-1 py-4 text-[11px] text-muted-foreground sm:px-4 sm:text-sm">
                                      {item.marketCapRank || "—"}
                                    </td>
                                    <td className="px-1 py-4 sm:px-4">
                                      <div className="flex min-w-0 items-center gap-1.5 sm:gap-3">
                                        <Image
                                          src={item.image}
                                          alt={item.name}
                                          width={32}
                                          height={32}
                                          className="h-6 w-6 flex-shrink-0 rounded-full sm:h-8 sm:w-8"
                                        />
                                        <div className="min-w-0">
                                          <p className="truncate text-xs font-medium uppercase sm:text-sm sm:normal-case">
                                            <span className="sm:hidden">{item.symbol}</span>
                                            <span className="hidden sm:inline">{item.name}</span>
                                          </p>
                                          <p className="hidden text-xs uppercase text-muted-foreground sm:block">{item.symbol}</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="overflow-hidden text-ellipsis whitespace-nowrap px-1 py-4 text-right text-[11px] font-medium sm:px-4 sm:text-sm">
                                      {formatPrice(item.currentPrice)}
                                    </td>
                                    <td className="px-1 py-4 text-right sm:px-4">
                                      <span className={`inline-flex items-center justify-end gap-0.5 whitespace-nowrap text-[11px] font-medium sm:text-sm ${isPositive ? "text-green-500" : "text-red-500"}`}>
                                        {isPositive
                                          ? <TrendingUp className="h-3 w-3 flex-shrink-0 sm:h-3.5 sm:w-3.5" />
                                          : <TrendingDown className="h-3 w-3 flex-shrink-0 sm:h-3.5 sm:w-3.5" />}
                                        {Math.abs(item.priceChange24h || 0).toFixed(1)}%
                                      </span>
                                    </td>
                                    <td className="overflow-hidden text-ellipsis whitespace-nowrap px-1 py-4 text-right text-[11px] text-muted-foreground sm:px-4 sm:text-sm">
                                      {formatLarge(item.marketCap)}
                                    </td>
                                    <td className="hidden px-4 py-4 text-right text-sm text-muted-foreground lg:table-cell">
                                      {formatLarge(item.totalVolume)}
                                    </td>
                                    <td className="hidden px-4 py-4 text-center sm:table-cell">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`${item.alertsEnabled ? "Disable" : "Enable"} alerts for ${item.name}`}
                                        onClick={() => toggleAlert(item.id, item.alertsEnabled)}
                                      >
                                        {item.alertsEnabled
                                          ? <Bell className="h-4 w-4 text-blue-500" />
                                          : <BellOff className="h-4 w-4 text-muted-foreground" />}
                                      </Button>
                                    </td>
                                    <td className="hidden px-4 py-4 text-center sm:table-cell">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Remove ${item.name}`}
                                        onClick={() => removeItem(item.id)}
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </>
          )}

        </main>
      </div>
    </div>
  );
}