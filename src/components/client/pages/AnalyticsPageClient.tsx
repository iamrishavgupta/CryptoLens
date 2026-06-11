"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Eye,
  Download,
} from "lucide-react";

// Mock data for analytics
const technicalIndicators = [
  { name: "RSI (14)", value: 67.8, status: "overbought", change: "+2.3" },
  { name: "MACD", value: 245.67, status: "bullish", change: "+15.2" },
  { name: "SMA (20)", value: 42150, status: "above", change: "+1.8" },
  {
    name: "Bollinger Bands",
    value: "Upper",
    status: "resistance",
    change: "-0.5",
  },
];

const onChainMetrics = [
  {
    name: "Exchange Inflow",
    value: "2,347 BTC",
    change: "-12.5%",
    trend: "down",
  },
  { name: "Whale Transactions", value: "156", change: "+8.2%", trend: "up" },
  { name: "Active Addresses", value: "847K", change: "+3.1%", trend: "up" },
  { name: "Hash Rate", value: "425 EH/s", change: "+1.2%", trend: "up" },
];

const sentimentData = [
  {
    source: "Fear & Greed Index",
    value: 73,
    label: "Greed",
    color: "bg-coingecko-green-500",
  },
  {
    source: "Social Sentiment",
    value: 68,
    label: "Positive",
    color: "bg-blue-500",
  },
  {
    source: "News Sentiment",
    value: 45,
    label: "Neutral",
    color: "bg-yellow-500",
  },
  {
    source: "Reddit Activity",
    value: 82,
    label: "High",
    color: "bg-purple-500",
  },
];

const correlationMatrix = [
  { asset1: "BTC", asset2: "ETH", correlation: 0.87 },
  { asset1: "BTC", asset2: "SOL", correlation: 0.72 },
  { asset1: "BTC", asset2: "ADA", correlation: 0.68 },
  { asset1: "ETH", asset2: "SOL", correlation: 0.79 },
  { asset1: "ETH", asset2: "ADA", correlation: 0.74 },
  { asset1: "SOL", asset2: "ADA", correlation: 0.65 },
];

export default function AnalyticsPageClient() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("24h");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          <main className="flex-1 p-5">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold">Advanced Analytics</h1>
                  <p className="text-muted-foreground">
                    Technical analysis, on-chain metrics, and market sentiment
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </div>

              <Tabs
                value={selectedTimeframe}
                onValueChange={setSelectedTimeframe}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="24h">24H</TabsTrigger>
                  <TabsTrigger value="7d">7D</TabsTrigger>
                  <TabsTrigger value="30d">30D</TabsTrigger>
                  <TabsTrigger value="90d">90D</TabsTrigger>
                </TabsList>

                <TabsContent value={selectedTimeframe} className="space-y-6">
                  {/* Technical Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Technical Indicators
                      </CardTitle>
                      <CardDescription>
                        Key technical analysis indicators for Bitcoin
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {technicalIndicators.map((indicator) => (
                          <div
                            key={indicator.name}
                            className="p-4 border rounded-lg"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-sm">
                                {indicator.name}
                              </h4>
                              <Badge
                                variant={
                                  indicator.status === "bullish" ||
                                  indicator.status === "above"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {indicator.status}
                              </Badge>
                            </div>
                            <p className="text-2xl font-bold">
                              {indicator.value}
                            </p>
                            <p className="text-sm text-coingecko-green-600">
                              {indicator.change}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* On-Chain Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        On-Chain Metrics
                      </CardTitle>
                      <CardDescription>
                        Blockchain activity and whale movement analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {onChainMetrics.map((metric) => (
                          <div
                            key={metric.name}
                            className="p-4 border rounded-lg"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-sm">
                                {metric.name}
                              </h4>
                              {metric.trend === "up" ? (
                                <TrendingUp className="w-4 h-4 text-coingecko-green-500" />
                              ) : (
                                <TrendingDown className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            <p className="text-2xl font-bold">{metric.value}</p>
                            <p
                              className={`text-sm ${
                                metric.trend === "up"
                                  ? "text-coingecko-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {metric.change}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sentiment Analysis */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Eye className="w-5 h-5" />
                          Market Sentiment
                        </CardTitle>
                        <CardDescription>
                          Aggregated sentiment from multiple sources
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {sentimentData.map((sentiment) => (
                          <div key={sentiment.source} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">
                                {sentiment.source}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {sentiment.label}
                              </span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${sentiment.color}`}
                                style={{ width: `${sentiment.value}%` }}
                              />
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              {sentiment.value}/100
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Correlation Matrix */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PieChart className="w-5 h-5" />
                          Asset Correlation
                        </CardTitle>
                        <CardDescription>
                          Price correlation between major cryptocurrencies
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {correlationMatrix.map((corr, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {corr.asset1}
                                </span>
                                <span className="text-muted-foreground">
                                  vs
                                </span>
                                <span className="font-medium">
                                  {corr.asset2}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    corr.correlation > 0.8
                                      ? "bg-coingecko-green-500"
                                      : corr.correlation > 0.6
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                                  }`}
                                />
                                <span className="font-mono text-sm">
                                  {corr.correlation.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Risk Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <LineChart className="w-5 h-5" />
                        Risk Analysis
                      </CardTitle>
                      <CardDescription>
                        Value at Risk (VaR) and volatility measurements
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">1-Day VaR</h4>
                          <p className="text-2xl font-bold text-red-600">
                            -8.2%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            95% confidence
                          </p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">
                            30-Day Volatility
                          </h4>
                          <p className="text-2xl font-bold">62.4%</p>
                          <p className="text-sm text-muted-foreground">
                            Annualized
                          </p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">
                            Beta (vs S&P 500)
                          </h4>
                          <p className="text-2xl font-bold">1.87</p>
                          <p className="text-sm text-muted-foreground">
                            90-day
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
