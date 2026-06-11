"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { withAuthRequired } from "@/components/common/withAuth";
import {
  Plus, Trash2, TrendingUp, TrendingDown, Wallet,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection, addDoc, deleteDoc, doc,
  onSnapshot, query, where,
} from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

interface Holding {
  id: string;
  coinId: string;
  symbol: string;
  name: string;
  image: string;
  amount: number;
  buyPrice: number;
  currentPrice?: number;
}

function PortfolioPageClientComponent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [coins, setCoins] = useState<any[]>([]);

  // Add form state
  const [search, setSearch] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { user } = useAuth();

  // Load coins for search
  useEffect(() => {
    fetch("/api/market?per_page=100&page=1")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setCoins(json.data);
      });
  }, []);

  // Load holdings from Firestore
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, "holdings"),
      where("userId", "==", user.uid)
    );

    const unsub = onSnapshot(q, async (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Holding[];

      // Fetch live prices for all holdings
      if (data.length > 0) {
        try {
          const res = await fetch("/api/market?per_page=100&page=1");
          const json = await res.json();
          if (json.success) {
            const priceMap: Record<string, number> = {};
            json.data.forEach((c: any) => {
              priceMap[c.id] = c.currentPrice;
            });
            data.forEach((h) => {
              h.currentPrice = priceMap[h.coinId] || h.buyPrice;
            });
          }
        } catch {}
      }

      setHoldings(data);
      setIsLoading(false);
    });

    return () => unsub();
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
        amount: parseFloat(amount),
        buyPrice: parseFloat(buyPrice),
        createdAt: new Date().toISOString(),
      });
      setSelectedCoin(null);
      setAmount("");
      setBuyPrice("");
      setSearch("");
      setShowForm(false);
    } catch (e) {
      console.error("Failed to add holding:", e);
    }
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "holdings", id));
  };

  const formatValue = (value: number) => {
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    if (price >= 1) return `$${price.toFixed(2)}`;
    return `$${price.toFixed(6)}`;
  };

  const totalValue = holdings.reduce(
    (sum, h) => sum + h.amount * (h.currentPrice || h.buyPrice), 0
  );
  const totalCost = holdings.reduce(
    (sum, h) => sum + h.amount * h.buyPrice, 0
  );
  const totalPnL = totalValue - totalCost;
  const totalPnLPct = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  const filteredCoins = coins.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8);

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
          <main className="flex-1 p-5 space-y-6 overflow-x-hidden max-w-full">

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">My Portfolio</h1>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-3xl font-bold">{formatValue(totalValue)}</span>
                  {totalCost > 0 && (
                    <div className={`flex items-center gap-1 ${totalPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {totalPnL >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      <span className="font-semibold">
                        {totalPnL >= 0 ? "+" : ""}{formatValue(totalPnL)} ({totalPnLPct.toFixed(2)}%)
                      </span>
                    </div>
                  )}
                </div>
                {totalCost > 0 && (
                  <p className="text-muted-foreground mt-1">
                    Total invested: {formatValue(totalCost)}
                  </p>
                )}
              </div>
              <Button onClick={() => setShowForm(!showForm)} className="w-full sm:w-auto">
  <Plus className="w-4 h-4 mr-2" />
  Add Holding
</Button>
            </div>

            {/* Add Holding Form */}
            {showForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Holding</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Coin Search */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Search Coin</label>
                    <Input
                      placeholder="Search by name or symbol..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setSelectedCoin(null);
                      }}
                    />
                    {search && !selectedCoin && filteredCoins.length > 0 && (
                      <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                        {filteredCoins.map((coin) => (
                          <button
                            key={coin.id}
                            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-muted text-left"
                            onClick={() => {
                              setSelectedCoin(coin);
                              setSearch(coin.name);
                              setBuyPrice(coin.currentPrice.toString());
                            }}
                          >
                            <Image src={coin.image} alt={coin.name} width={24} height={24} className="rounded-full" />
                            <span className="font-medium">{coin.name}</span>
                            <span className="text-muted-foreground text-sm uppercase">{coin.symbol}</span>
                            <span className="ml-auto text-sm">{formatPrice(coin.currentPrice)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {selectedCoin && (
                      <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                        <Image src={selectedCoin.image} alt={selectedCoin.name} width={24} height={24} className="rounded-full" />
                        <span className="font-medium">{selectedCoin.name}</span>
                        <Badge variant="outline">{selectedCoin.symbol.toUpperCase()}</Badge>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount</label>
                      <Input
                        type="number"
                        placeholder="e.g. 0.5"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Buy Price (USD)</label>
                      <Input
                        type="number"
                        placeholder="e.g. 60000"
                        value={buyPrice}
                        onChange={(e) => setBuyPrice(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddHolding}
                      disabled={!selectedCoin || !amount || !buyPrice || isAdding}
                    >
                      {isAdding ? "Adding..." : "Add Holding"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            {holdings.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">{formatValue(totalValue)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Total Invested</p>
                    <p className="text-2xl font-bold">{formatValue(totalCost)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Total P&L</p>
                    <p className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {totalPnL >= 0 ? "+" : ""}{formatValue(totalPnL)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Holdings Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Holdings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20 text-muted-foreground">
                    Loading portfolio...
                  </div>
                ) : holdings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
                    <Wallet className="h-12 w-12 opacity-30" />
                    <p>No holdings yet. Add your first holding to get started.</p>
                    <Button onClick={() => setShowForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Holding
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-xs text-muted-foreground">
                          <th className="text-left px-6 py-3">Coin</th>
                          <th className="text-right px-4 py-3">Amount</th>
                          <th className="text-right px-4 py-3">Buy Price</th>
                          <th className="text-right px-4 py-3">Current Price</th>
                          <th className="text-right px-4 py-3">Value</th>
                          <th className="text-right px-4 py-3">P&L</th>
                          <th className="text-right px-6 py-3">P&L %</th>
                          <th className="px-6 py-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {holdings.map((holding) => {
                          const currentPrice = holding.currentPrice || holding.buyPrice;
                          const value = holding.amount * currentPrice;
                          const cost = holding.amount * holding.buyPrice;
                          const pnl = value - cost;
                          const pnlPct = ((pnl / cost) * 100);
                          const isPos = pnl >= 0;
                          return (
                            <tr key={holding.id} className="border-b hover:bg-muted/50">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {holding.image && (
                                    <Image
                                      src={holding.image}
                                      alt={holding.name}
                                      width={32}
                                      height={32}
                                      className="rounded-full"
                                    />
                                  )}
                                  <div>
                                    <p className="font-medium">{holding.name}</p>
                                    <p className="text-xs text-muted-foreground uppercase">{holding.symbol}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-right text-sm">{holding.amount}</td>
                              <td className="px-4 py-4 text-right text-sm">{formatPrice(holding.buyPrice)}</td>
                              <td className="px-4 py-4 text-right text-sm">{formatPrice(currentPrice)}</td>
                              <td className="px-4 py-4 text-right text-sm font-medium">{formatValue(value)}</td>
                              <td className={`px-4 py-4 text-right text-sm font-medium ${isPos ? "text-green-500" : "text-red-500"}`}>
                                {isPos ? "+" : ""}{formatValue(pnl)}
                              </td>
                              <td className={`px-6 py-4 text-right text-sm ${isPos ? "text-green-500" : "text-red-500"}`}>
                                <Badge variant="outline" className={`${isPos ? "border-green-500 text-green-500" : "border-red-500 text-red-500"}`}>
                                  {isPos ? "+" : ""}{pnlPct.toFixed(2)}%
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(holding.id)}
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
                )}
              </CardContent>
            </Card>

          </main>
        </div>
      </div>
    </div>
  );
}

export const PortfolioPageClient = withAuthRequired(PortfolioPageClientComponent);