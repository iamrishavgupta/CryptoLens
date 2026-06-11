"use client";

import { useState } from "react";
import { useAccount, useBalance } from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Wallet,
  Copy,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

export function WalletInfo() {
  const { address, isConnected, chain } = useAccount();
  const {
    data: balance,
    isLoading: balanceLoading,
    refetch,
  } = useBalance({
    address,
  });

  const [showBalance, setShowBalance] = useState(true);

  // Mock portfolio data for connected wallet
  const [portfolioData] = useState({
    totalValue: 15420.85,
    dayChange: 234.67,
    dayChangePercent: 1.54,
    tokens: [
      { symbol: "ETH", balance: "5.2341", value: 12834.5, change: 2.1 },
      { symbol: "USDC", balance: "2586.42", value: 2586.42, change: 0.0 },
    ],
  });

  const copyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address);

      toast.success("Address copied to clipboard");
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const formatBalance = (value: number) => {
    return showBalance
      ? `$${value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : "****";
  };

  if (!isConnected || !address) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Wallet className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Wallet Connected</h3>
          <p className="text-muted-foreground text-center mb-4">
            Connect your wallet to view portfolio and enable Web3 features
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Wallet Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-lg">Wallet Overview</CardTitle>
            <CardDescription>
              Connected to {chain?.name || "Unknown Network"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={balanceLoading}
            >
              <RefreshCw
                className={`w-4 h-4 ${balanceLoading ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Address */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Wallet Address</p>
              <code className="text-sm font-mono">
                {formatAddress(address)}
              </code>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-8 w-8 p-0"
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  window.open(
                    `https://etherscan.io/address/${address}`,
                    "_blank"
                  )
                }
                className="h-8 w-8 p-0"
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {/* Network Info */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Network:</span>
            <Badge variant="secondary" className="flex items-center gap-1">
              <div className="w-2 h-2 bg-coingecko-green-500 rounded-full" />
              {chain?.name || "Unknown"}
            </Badge>
          </div>

          {/* Native Balance */}
          {balance && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Native Balance:
              </span>
              <span className="font-mono">
                {showBalance
                  ? `${parseFloat(balance.formatted).toFixed(4)} ${
                      balance.symbol
                    }`
                  : "****"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portfolio Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Portfolio Summary</CardTitle>
          <CardDescription>Your token holdings and values</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total Value */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Total Portfolio Value
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBalance(!showBalance)}
                className="h-6 w-6 p-0"
              >
                {showBalance ? (
                  <Eye className="w-3 h-3" />
                ) : (
                  <EyeOff className="w-3 h-3" />
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {formatBalance(portfolioData.totalValue)}
              </span>
              <Badge
                variant={
                  portfolioData.dayChangePercent >= 0
                    ? "default"
                    : "destructive"
                }
                className="flex items-center gap-1"
              >
                {portfolioData.dayChangePercent >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(portfolioData.dayChangePercent)}%
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {portfolioData.dayChangePercent >= 0 ? "+" : ""}
              {formatBalance(portfolioData.dayChange)} today
            </p>
          </div>

          <Separator />

          {/* Token Holdings */}
          <div className="space-y-3">
            <h4 className="font-medium">Token Holdings</h4>
            {portfolioData.tokens.map((token, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold">{token.symbol}</span>
                  </div>
                  <div>
                    <p className="font-medium">{token.symbol}</p>
                    <p className="text-sm text-muted-foreground">
                      {showBalance ? token.balance : "****"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatBalance(token.value)}</p>
                  <p
                    className={`text-sm ${
                      token.change >= 0
                        ? "text-coingecko-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {token.change >= 0 ? "+" : ""}
                    {token.change}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
