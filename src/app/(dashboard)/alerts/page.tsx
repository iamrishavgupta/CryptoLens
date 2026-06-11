"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import {
  Plus, Bell, BellOff, Trash2, AlertTriangle, CheckCircle,
  Target, Clock, MoreHorizontal, Search, X,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Header } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { db } from "@/lib/firebase";
import {
  collection, addDoc, deleteDoc, doc, onSnapshot, query, where, updateDoc,
} from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { withAuthRequired } from "@/components/common/withAuth";
import Image from "next/image";

interface PriceAlert {
  id: string;
  userId: string;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  coinImage: string;
  condition: "above" | "below";
  targetPrice: number;
  isActive: boolean;
  isTriggered: boolean;
  createdAt: string;
  triggeredAt?: string;
  // live
  currentPrice?: number;
}

function AlertsPageComponent() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [coins, setCoins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Create form state
  const [coinSearch, setCoinSearch] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<any>(null);
  const [condition, setCondition] = useState<"above" | "below">("above");
  const [targetPrice, setTargetPrice] = useState("");

  // Load live coins
  useEffect(() => {
    const fetchCoins = () => {
      fetch("/api/market?per_page=100&page=1")
        .then((r) => r.json())
        .then((json) => { if (json.success) setCoins(json.data); });
    };
    fetchCoins();
    const interval = setInterval(fetchCoins, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, []);

  // Load alerts from Firestore
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(collection(db, "alerts"), where("userId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as PriceAlert[];
      setAlerts(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  // Inject live prices + auto-check triggers
  useEffect(() => {
    if (coins.length === 0 || alerts.length === 0) return;
    const priceMap: Record<string, number> = {};
    coins.forEach((c) => { priceMap[c.id] = c.currentPrice; });

    alerts.forEach((alert) => {
      const live = priceMap[alert.coinId];
      if (live == null) return;
      alert.currentPrice = live;

      // Check trigger condition
      if (alert.isActive && !alert.isTriggered) {
        const shouldTrigger =
          (alert.condition === "above" && live >= alert.targetPrice) ||
          (alert.condition === "below" && live <= alert.targetPrice);

        if (shouldTrigger) {
          updateDoc(doc(db, "alerts", alert.id), {
            isTriggered: true,
            isActive: false,
            triggeredAt: new Date().toISOString(),
          }).catch(() => {});
        }
      }
    });

    // Force re-render with updated currentPrice
    setAlerts([...alerts]);
  }, [coins]); // eslint-disable-line react-hooks/exhaustive-deps

  const createAlert = async () => {
    if (!selectedCoin || !targetPrice || !user?.uid) return;
    await addDoc(collection(db, "alerts"), {
      userId: user.uid,
      coinId: selectedCoin.id,
      coinSymbol: selectedCoin.symbol,
      coinName: selectedCoin.name,
      coinImage: selectedCoin.image,
      condition,
      targetPrice: parseFloat(targetPrice),
      isActive: true,
      isTriggered: false,
      createdAt: new Date().toISOString(),
    });
    setSelectedCoin(null);
    setCoinSearch("");
    setTargetPrice("");
    setCondition("above");
    setShowCreateDialog(false);
  };

  const toggleAlert = async (alert: PriceAlert) => {
    await updateDoc(doc(db, "alerts", alert.id), { isActive: !alert.isActive });
  };

  const deleteAlert = async (id: string) => {
    await deleteDoc(doc(db, "alerts", id));
  };

  const dismissAlert = async (id: string) => {
    await updateDoc(doc(db, "alerts", id), { isTriggered: false, isActive: false });
  };

  const formatPrice = (price?: number) => {
    if (price == null) return "N/A";
    if (price < 1) return `$${price.toFixed(6)}`;
    if (price < 10) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getStatusBadge = (alert: PriceAlert) => {
    if (alert.isTriggered) return <Badge className="bg-green-100 text-green-800">Triggered</Badge>;
    if (alert.isActive) return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
    return <Badge variant="secondary">Disabled</Badge>;
  };

  const stats = {
    total: alerts.length,
    active: alerts.filter((a) => a.isActive && !a.isTriggered).length,
    triggered: alerts.filter((a) => a.isTriggered).length,
    disabled: alerts.filter((a) => !a.isActive && !a.isTriggered).length,
  };

  let filteredAlerts = alerts.filter((alert) => {
    if (filterStatus === "active") return alert.isActive && !alert.isTriggered;
    if (filterStatus === "triggered") return alert.isTriggered;
    if (filterStatus === "disabled") return !alert.isActive && !alert.isTriggered;
    return true;
  });

  if (searchQuery) {
    filteredAlerts = filteredAlerts.filter(
      (alert) =>
        alert.coinName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.coinSymbol.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  filteredAlerts = [...filteredAlerts].sort((a, b) => {
    if (sortBy === "createdAt") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "targetPrice") return b.targetPrice - a.targetPrice;
    if (sortBy === "coinName") return a.coinName.localeCompare(b.coinName);
    return 0;
  });

  const filteredCoinSearch = coins
    .filter((c) =>
      c.name.toLowerCase().includes(coinSearch.toLowerCase()) ||
      c.symbol.toLowerCase().includes(coinSearch.toLowerCase())
    )
    .slice(0, 8);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header variant="simplified" isMobileMenuOpen={sidebarOpen} setIsMobileMenuOpen={setSidebarOpen} />
        <div className="container mx-auto px-4">
          <div className="w-full max-w-[1536px] mx-auto flex">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="flex-1 p-5">
              <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header variant="simplified" isMobileMenuOpen={sidebarOpen} setIsMobileMenuOpen={setSidebarOpen} />
      <div className="container mx-auto px-4">
        <div className="w-full max-w-[1536px] mx-auto flex">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="container mx-auto p-5 space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold">Price Alerts</h1>
                <p className="text-muted-foreground">
                  Get notified when your cryptocurrencies reach target prices
                </p>
              </div>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Alert
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Price Alert</DialogTitle>
                    <DialogDescription>
                      Set up a price alert to get notified when a cryptocurrency reaches your target price
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Coin Search */}
                    <div className="space-y-2">
                      <Label>Cryptocurrency</Label>
                      {selectedCoin ? (
                        <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                          <div className="flex items-center space-x-3">
                            <Image src={selectedCoin.image} alt={selectedCoin.name} width={32} height={32} className="rounded-full" />
                            <div>
                              <p className="font-medium">{selectedCoin.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedCoin.symbol.toUpperCase()} • {formatPrice(selectedCoin.currentPrice)}
                              </p>
                            </div>
                          </div>
                          <Button type="button" variant="outline" size="sm" onClick={() => { setSelectedCoin(null); setCoinSearch(""); }}>
                            <Search className="h-4 w-4 mr-1" />
                            Change
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Search for cryptocurrency..."
                              className="pl-9 pr-9"
                              value={coinSearch}
                              onChange={(e) => setCoinSearch(e.target.value)}
                              autoFocus
                            />
                            {coinSearch && (
                              <button onClick={() => setCoinSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                                <X className="h-4 w-4 text-muted-foreground" />
                              </button>
                            )}
                          </div>
                          {coinSearch && (
                            <div className="max-h-48 overflow-y-auto border rounded-md divide-y">
                              {filteredCoinSearch.length > 0 ? (
                                filteredCoinSearch.map((coin) => (
                                  <button
                                    key={coin.id}
                                    type="button"
                                    onClick={() => { setSelectedCoin(coin); setTargetPrice(coin.currentPrice.toString()); }}
                                    className="w-full flex items-center space-x-3 p-3 hover:bg-muted/50 transition-colors text-left"
                                  >
                                    <Image src={coin.image} alt={coin.name} width={28} height={28} className="rounded-full" />
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">{coin.name}</p>
                                      <p className="text-xs text-muted-foreground uppercase">{coin.symbol}</p>
                                    </div>
                                    <span className="text-sm">{formatPrice(coin.currentPrice)}</span>
                                  </button>
                                ))
                              ) : (
                                <div className="p-6 text-center text-muted-foreground text-sm">
                                  No cryptocurrencies found
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Condition */}
                    <div className="space-y-2">
                      <Label>Alert Condition</Label>
                      <Select value={condition} onValueChange={(v: "above" | "below") => setCondition(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="above">Price goes above</SelectItem>
                          <SelectItem value="below">Price goes below</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Target Price */}
                    <div className="space-y-2">
                      <Label>Target Price (USD)</Label>
                      <Input
                        type="number"
                        step="0.000001"
                        placeholder="Enter target price"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                      />
                      {selectedCoin && targetPrice && (
                        <p className="text-sm text-muted-foreground">
                          Current price: {formatPrice(selectedCoin.currentPrice)} •{" "}
                          {parseFloat(targetPrice) > selectedCoin.currentPrice
                            ? `${((parseFloat(targetPrice) / selectedCoin.currentPrice - 1) * 100).toFixed(2)}% above`
                            : `${((1 - parseFloat(targetPrice) / selectedCoin.currentPrice) * 100).toFixed(2)}% below`}{" "}
                          current price
                        </p>
                      )}
                    </div>

                    {/* Summary */}
                    {selectedCoin && targetPrice && (
                      <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200 flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium">Alert Summary</p>
                          <p>You&apos;ll be notified when {selectedCoin.name} goes {condition} {formatPrice(parseFloat(targetPrice))}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button onClick={createAlert} className="flex-1" disabled={!selectedCoin || !targetPrice}>
                        Create Alert
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-6 w-6 text-blue-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Total Alerts</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <Target className="h-6 w-6 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Active</p>
                      <p className="text-2xl font-bold">{stats.active}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-6 w-6 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Triggered</p>
                      <p className="text-2xl font-bold">{stats.triggered}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <BellOff className="h-6 w-6 text-orange-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Disabled</p>
                      <p className="text-2xl font-bold">{stats.disabled}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  className="pl-9 pr-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="triggered">Triggered</option>
                  <option value="disabled">Disabled</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="createdAt">Newest First</option>
                  <option value="targetPrice">Target Price</option>
                  <option value="coinName">Coin Name</option>
                </select>
              </div>
            </div>

            {/* Alerts List */}
            {filteredAlerts.length > 0 ? (
              <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                  <Card key={alert.id} className={`transition-shadow hover:shadow-md ${alert.isTriggered ? "border-green-200 " : ""}`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center space-x-4">
                          <Image src={alert.coinImage} alt={alert.coinName} width={40} height={40} className="rounded-full" />
                          <div>
                            <div className="flex items-center space-x-2 flex-wrap">
                              <h3 className="font-semibold">{alert.coinName}</h3>
                              <span className="text-muted-foreground">({alert.coinSymbol.toUpperCase()})</span>
                              {getStatusBadge(alert)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Alert when price goes {alert.condition} {formatPrice(alert.targetPrice)}
                            </p>
                            {alert.isTriggered && (
                              <p className="text-sm text-green-600 mt-1">
                                {alert.coinName} reached your target price of {formatPrice(alert.targetPrice)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-semibold">Target: {formatPrice(alert.targetPrice)}</p>
                            <p className="text-sm text-muted-foreground">Current: {formatPrice(alert.currentPrice)}</p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={alert.isActive}
                              onCheckedChange={() => toggleAlert(alert)}
                              disabled={alert.isTriggered}
                            />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {alert.isTriggered && (
                                  <DropdownMenuItem onClick={() => dismissAlert(alert.id)}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Dismiss
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => deleteAlert(alert.id)} className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground flex-wrap gap-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3" />
                          <span>Created: {formatDate(alert.createdAt)}</span>
                        </div>
                        {alert.triggeredAt && (
                          <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-3 w-3 text-green-500" />
                            <span>Triggered: {formatDate(alert.triggeredAt)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No alerts found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || filterStatus !== "all"
                      ? "No alerts match your current filters"
                      : "Create your first price alert to get started"}
                  </p>
                  {!searchQuery && filterStatus === "all" && (
                    <Button onClick={() => setShowCreateDialog(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Alert
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuthRequired(AlertsPageComponent);