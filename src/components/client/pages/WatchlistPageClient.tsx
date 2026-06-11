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
      <div className="flex container mx-auto px-4">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0 p-5 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Star className="h-7 w-7 text-yellow-500" />
                Watchlists
              </h1>
              <p className="text-muted-foreground">
                Track your favorite cryptocurrencies
              </p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" />Create Watchlist</Button>
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
            <p className="text-muted-foreground">Loading...</p>
          ) : watchlists.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Star className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No watchlists yet</h3>
                <p className="text-muted-foreground mb-4">Create your first watchlist to start tracking coins</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />Create Watchlist
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {watchlists.map((w) => (
                  <div key={w.id} className="flex items-center gap-1">
                    <Button
                      variant={selectedWatchlistId === w.id ? "default" : "outline"}
                      onClick={() => setSelectedWatchlistId(w.id)}
                    >
                      {w.name}
                      <Badge variant="secondary" className="ml-2">
                        {items.filter((i) => i.watchlistId === w.id).length}
                      </Badge>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500"
                      onClick={() => deleteWatchlist(w.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              {selectedWatchlist && (
                <>
                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-6 flex items-center gap-2">
                        <Star className="h-6 w-6 text-yellow-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Total Coins</p>
                          <p className="text-2xl font-bold">{selectedItems.length}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6 flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-green-500" />
                        <div>
                          <p className="text-sm text-muted-foreground">Combined Value</p>
                          <p className="text-2xl font-bold">
                            {formatLarge(selectedItems.reduce((s, i) => s + (i.currentPrice || 0), 0))}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6 flex items-center gap-2">
                        {avgChange >= 0
                          ? <TrendingUp className="h-6 w-6 text-green-500" />
                          : <TrendingDown className="h-6 w-6 text-red-500" />}
                        <div>
                          <p className="text-sm text-muted-foreground">Avg 24h Change</p>
                          <p className={`text-2xl font-bold ${avgChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {avgChange >= 0 ? "+" : ""}{avgChange.toFixed(2)}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Search + Add */}
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search in watchlist..."
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
                    <Button onClick={() => setShowAddCoin(!showAddCoin)}>
                      <Plus className="mr-2 h-4 w-4" />Add Coin
                    </Button>
                  </div>

                  {/* Add Coin Search */}
                  {showAddCoin && (
                    <Card>
                      <CardContent className="p-4 space-y-3">
                        <p className="font-medium">Add coin to {selectedWatchlist.name}</p>
                        <Input
                          placeholder="Search by name or symbol..."
                          value={coinSearch}
                          onChange={(e) => setCoinSearch(e.target.value)}
                          autoFocus
                        />
                        {coinSearch && (
                          <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                            {filteredCoinSearch.map((coin) => {
                              const already = items.find((i) => i.coinId === coin.id && i.watchlistId === selectedWatchlistId);
                              return (
                                <button
                                  key={coin.id}
                                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted text-left disabled:opacity-50"
                                  onClick={() => addCoinToWatchlist(coin)}
                                  disabled={!!already}
                                >
                                  <Image src={coin.image} alt={coin.name} width={24} height={24} className="rounded-full" />
                                  <span className="font-medium">{coin.name}</span>
                                  <span className="text-muted-foreground text-sm uppercase">{coin.symbol}</span>
                                  <span className="ml-auto text-sm">{formatPrice(coin.currentPrice)}</span>
                                  {already && <Badge variant="secondary" className="text-xs">Added</Badge>}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        <Button variant="outline" size="sm" onClick={() => setShowAddCoin(false)}>Cancel</Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Table */}
                  {selectedItems.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Star className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No coins yet</h3>
                        <p className="text-muted-foreground mb-4">Add coins to start tracking</p>
                        <Button onClick={() => setShowAddCoin(true)}>
                          <Plus className="mr-2 h-4 w-4" />Add Coin
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="rounded-md border overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b bg-muted/50 text-xs text-muted-foreground">
                            <th className="text-left px-4 py-3">#</th>
                            <th className="text-left px-4 py-3">Name</th>
                            <th className="text-right px-4 py-3">Price</th>
                            <th className="text-right px-4 py-3">24h</th>
                            <th className="text-right px-4 py-3 hidden md:table-cell">Market Cap</th>
                            <th className="text-right px-4 py-3 hidden lg:table-cell">Volume</th>
                            <th className="text-center px-4 py-3">Alerts</th>
                            <th className="text-center px-4 py-3">Remove</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredItems.map((item) => {
                            const isPos = (item.priceChange24h || 0) >= 0;
                            return (
                              <tr key={item.id} className="border-b hover:bg-muted/50">
                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                  {item.marketCapRank || "—"}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <Image src={item.image} alt={item.name} width={28} height={28} className="rounded-full" />
                                    <div>
                                      <p className="font-medium text-sm">{item.name}</p>
                                      <p className="text-xs text-muted-foreground uppercase">{item.symbol}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-right text-sm font-medium">
                                  {formatPrice(item.currentPrice)}
                                </td>
                                <td className="px-4 py-3 text-right">
                                  <span className={`text-sm font-medium ${isPos ? "text-green-500" : "text-red-500"}`}>
                                    {isPos ? "+" : ""}{(item.priceChange24h || 0).toFixed(2)}%
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-right text-sm text-muted-foreground hidden md:table-cell">
                                  {formatLarge(item.marketCap)}
                                </td>
                                <td className="px-4 py-3 text-right text-sm text-muted-foreground hidden lg:table-cell">
                                  {formatLarge(item.totalVolume)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <Button variant="ghost" size="icon" onClick={() => toggleAlert(item.id, item.alertsEnabled)}>
                                    {item.alertsEnabled
                                      ? <Bell className="h-4 w-4 text-blue-500" />
                                      : <BellOff className="h-4 w-4 text-muted-foreground" />}
                                  </Button>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
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