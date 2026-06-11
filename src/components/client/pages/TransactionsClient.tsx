"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Download,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

// Mock transaction data
const mockTransactions = [
  {
    id: "tx-1",
    type: "buy",
    coinId: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    amount: 0.5,
    price: 40000,
    total: 20000,
    fee: 25,
    exchange: "Coinbase",
    timestamp: "2024-01-15T10:30:00Z",
    notes: "Initial Bitcoin purchase",
  },
  {
    id: "tx-2",
    type: "buy",
    coinId: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    amount: 5,
    price: 2200,
    total: 11000,
    fee: 15,
    exchange: "Binance",
    timestamp: "2024-01-20T14:15:00Z",
    notes: "DCA purchase",
  },
  {
    id: "tx-3",
    type: "sell",
    coinId: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    amount: 1,
    price: 2400,
    total: 2400,
    fee: 8,
    exchange: "Binance",
    timestamp: "2024-01-25T09:45:00Z",
    notes: "Partial profit taking",
  },
];

export default function TransactionsPageClient() {
  const [transactions] = useState(mockTransactions);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // New transaction form state
  const [newTransaction, setNewTransaction] = useState({
    type: "buy",
    symbol: "",
    amount: "",
    price: "",
    fee: "",
    exchange: "",
    notes: "",
    date: "",
  });

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.exchange?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "buy":
        return <TrendingUp className="w-4 h-4 text-coingecko-green-600" />;
      case "sell":
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case "transfer_in":
        return <ArrowDownLeft className="w-4 h-4 text-blue-600" />;
      case "transfer_out":
        return <ArrowUpRight className="w-4 h-4 text-orange-600" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "buy":
        return "text-coingecko-green-600 bg-coingecko-green-50 dark:bg-coingecko-green-950";
      case "sell":
        return "text-red-600 bg-red-50 dark:bg-red-950";
      case "transfer_in":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950";
      case "transfer_out":
        return "text-orange-600 bg-orange-50 dark:bg-orange-950";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-950";
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleAddTransaction = () => {
    // In a real app, this would make an API call
    console.log("Adding transaction:", newTransaction);
    setIsAddDialogOpen(false);
    setNewTransaction({
      type: "buy",
      symbol: "",
      amount: "",
      price: "",
      fee: "",
      exchange: "",
      notes: "",
      date: "",
    });
  };

  // Calculate summary statistics
  const summary = {
    totalTransactions: transactions.length,
    totalBuys: transactions.filter((tx) => tx.type === "buy").length,
    totalSells: transactions.filter((tx) => tx.type === "sell").length,
    totalVolume: transactions.reduce((sum, tx) => sum + tx.total, 0),
    totalFees: transactions.reduce((sum, tx) => sum + tx.fee, 0),
  };

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
          <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Transaction History</h1>
                <p className="text-muted-foreground">
                  Track and manage your portfolio transactions
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Dialog
                  open={isAddDialogOpen}
                  onOpenChange={setIsAddDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Transaction
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add New Transaction</DialogTitle>
                      <DialogDescription>
                        Record a new transaction for your portfolio
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="type">Type</Label>
                          <Select
                            value={newTransaction.type}
                            onValueChange={(value) =>
                              setNewTransaction((prev) => ({
                                ...prev,
                                type: value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="buy">Buy</SelectItem>
                              <SelectItem value="sell">Sell</SelectItem>
                              <SelectItem value="transfer_in">
                                Transfer In
                              </SelectItem>
                              <SelectItem value="transfer_out">
                                Transfer Out
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="symbol">Symbol</Label>
                          <Input
                            id="symbol"
                            placeholder="BTC, ETH, etc."
                            value={newTransaction.symbol}
                            onChange={(e) =>
                              setNewTransaction((prev) => ({
                                ...prev,
                                symbol: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="amount">Amount</Label>
                          <Input
                            id="amount"
                            type="number"
                            placeholder="0.0"
                            value={newTransaction.amount}
                            onChange={(e) =>
                              setNewTransaction((prev) => ({
                                ...prev,
                                amount: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="price">Price (USD)</Label>
                          <Input
                            id="price"
                            type="number"
                            placeholder="0.00"
                            value={newTransaction.price}
                            onChange={(e) =>
                              setNewTransaction((prev) => ({
                                ...prev,
                                price: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fee">Fee (USD)</Label>
                          <Input
                            id="fee"
                            type="number"
                            placeholder="0.00"
                            value={newTransaction.fee}
                            onChange={(e) =>
                              setNewTransaction((prev) => ({
                                ...prev,
                                fee: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="exchange">Exchange</Label>
                          <Input
                            id="exchange"
                            placeholder="Coinbase, Binance, etc."
                            value={newTransaction.exchange}
                            onChange={(e) =>
                              setNewTransaction((prev) => ({
                                ...prev,
                                exchange: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="datetime-local"
                          value={newTransaction.date}
                          onChange={(e) =>
                            setNewTransaction((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Input
                          id="notes"
                          placeholder="Additional notes..."
                          value={newTransaction.notes}
                          onChange={(e) =>
                            setNewTransaction((prev) => ({
                              ...prev,
                              notes: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <Button onClick={handleAddTransaction} className="w-full">
                        Add Transaction
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Total Transactions
                    </p>
                    <p className="text-2xl font-bold">
                      {summary.totalTransactions}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Buys</p>
                    <p className="text-2xl font-bold text-coingecko-green-600">
                      {summary.totalBuys}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Sells</p>
                    <p className="text-2xl font-bold text-red-600">
                      {summary.totalSells}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      Total Volume
                    </p>
                    <p className="text-2xl font-bold">
                      ${summary.totalVolume.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Total Fees</p>
                    <p className="text-2xl font-bold">
                      ${summary.totalFees.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Search */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                      <SelectItem value="transfer_in">Transfer In</SelectItem>
                      <SelectItem value="transfer_out">Transfer Out</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Transaction List */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Transactions ({filteredTransactions.length})
                </CardTitle>
                <CardDescription>
                  Your transaction history and trade records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`p-2 rounded-full ${getTransactionColor(
                            tx.type
                          )}`}
                        >
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{tx.symbol}</span>
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {tx.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {tx.amount} {tx.symbol} @ $
                            {tx.price.toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(tx.timestamp)} • {tx.exchange}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${tx.total.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Fee: ${tx.fee}
                        </p>
                      </div>
                    </div>
                  ))}

                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-12">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        No transactions found
                      </h3>
                      <p className="text-muted-foreground">
                        {searchQuery || filterType !== "all"
                          ? "Try adjusting your search or filters"
                          : "Start by adding your first transaction"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
