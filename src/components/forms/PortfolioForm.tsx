"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, X, TrendingUp, TrendingDown } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const portfolioHoldingSchema = z.object({
  coinId: z.string().min(1, "Please select a coin"),
  symbol: z.string().min(1, "Symbol is required"),
  amount: z.number().min(0.000001, "Amount must be greater than 0"),
  averagePrice: z.number().min(0.000001, "Price must be greater than 0"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
});

type PortfolioHoldingForm = z.infer<typeof portfolioHoldingSchema>;

interface CoinOption {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  priceChangePercentage24h: number;
}

interface PortfolioFormProps {
  onSubmit: (data: PortfolioHoldingForm) => void;
  loading?: boolean;
  trigger?: React.ReactNode;
  defaultValues?: Partial<PortfolioHoldingForm>;
  mode?: "add" | "edit";
}

// Mock coin data for demonstration
const MOCK_COINS: CoinOption[] = [
  {
    id: "bitcoin",
    symbol: "btc",
    name: "Bitcoin",
    image: "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png",
    currentPrice: 43250.45,
    priceChangePercentage24h: 2.45,
  },
  {
    id: "ethereum",
    symbol: "eth",
    name: "Ethereum",
    image:
      "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png",
    currentPrice: 2385.67,
    priceChangePercentage24h: -1.23,
  },
  {
    id: "binancecoin",
    symbol: "bnb",
    name: "BNB",
    image:
      "https://coin-images.coingecko.com/coins/images/825/large/bnb-icon2_2x.png",
    currentPrice: 315.82,
    priceChangePercentage24h: 0.89,
  },
  {
    id: "solana",
    symbol: "sol",
    name: "Solana",
    image:
      "https://coin-images.coingecko.com/coins/images/4128/large/solana.png",
    currentPrice: 98.45,
    priceChangePercentage24h: 5.67,
  },
  {
    id: "cardano",
    symbol: "ada",
    name: "Cardano",
    image:
      "https://coin-images.coingecko.com/coins/images/975/large/cardano.png",
    currentPrice: 0.485,
    priceChangePercentage24h: -2.14,
  },
];

export function PortfolioForm({
  onSubmit,
  loading = false,
  trigger,
  defaultValues,
  mode = "add",
}: PortfolioFormProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<CoinOption | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PortfolioHoldingForm>({
    resolver: zodResolver(portfolioHoldingSchema),
    defaultValues: {
      ...defaultValues,
      purchaseDate:
        defaultValues?.purchaseDate || new Date().toISOString().split("T")[0],
    },
  });

  const amount = watch("amount");
  const averagePrice = watch("averagePrice");

  const filteredCoins = MOCK_COINS.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCoinSelect = (coin: CoinOption) => {
    setSelectedCoin(coin);
    setValue("coinId", coin.id);
    setValue("symbol", coin.symbol);
    setValue("averagePrice", coin.currentPrice);
    setSearchQuery("");
  };

  const clearSelectedCoin = () => {
    setSelectedCoin(null);
    setValue("coinId", "");
    setValue("symbol", "");
    setValue("averagePrice", 0);
  };

  const handleFormSubmit = (data: PortfolioHoldingForm) => {
    onSubmit(data);
    setOpen(false);
    reset();
    setSelectedCoin(null);
  };

  const calculateValue = () => {
    if (amount && averagePrice) {
      return amount * averagePrice;
    }
    return 0;
  };

  const formatPrice = (price: number) => {
    if (price < 1) return `$${price.toFixed(6)}`;
    if (price < 100) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Holding
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Holding" : "Add New Holding"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Update your cryptocurrency holding details"
              : "Add a new cryptocurrency to your portfolio"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Coin Selection */}
          <div className="space-y-2">
            <Label>Cryptocurrency</Label>
            {selectedCoin ? (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="relative w-8 h-8">
                    <Image
                      src={selectedCoin.image}
                      alt={selectedCoin.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold">{selectedCoin.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCoin.symbol.toUpperCase()} •{" "}
                      {formatPrice(selectedCoin.currentPrice)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSelectedCoin}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search cryptocurrencies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {searchQuery && (
                  <div className="max-h-40 overflow-y-auto border rounded-lg">
                    {filteredCoins.map((coin) => {
                      const isPositive = coin.priceChangePercentage24h >= 0;
                      const TrendIcon = isPositive ? TrendingUp : TrendingDown;

                      return (
                        <button
                          key={coin.id}
                          type="button"
                          onClick={() => handleCoinSelect(coin)}
                          className="w-full flex items-center justify-between p-3 hover:bg-muted transition-colors text-left"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative w-6 h-6">
                              <Image
                                src={coin.image}
                                alt={coin.name}
                                fill
                                className="rounded-full object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{coin.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {coin.symbol.toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {formatPrice(coin.currentPrice)}
                            </p>
                            <div
                              className={cn(
                                "flex items-center text-xs",
                                isPositive
                                  ? "text-coingecko-green-600"
                                  : "text-red-600"
                              )}
                            >
                              <TrendIcon className="w-3 h-3 mr-1" />
                              {Math.abs(coin.priceChangePercentage24h).toFixed(
                                2
                              )}
                              %
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            {errors.coinId && (
              <p className="text-sm text-red-600">{errors.coinId.message}</p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="any"
              placeholder="0.00"
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-red-600">{errors.amount.message}</p>
            )}
          </div>

          {/* Average Price */}
          <div className="space-y-2">
            <Label htmlFor="averagePrice">Average Price (USD)</Label>
            <Input
              id="averagePrice"
              type="number"
              step="any"
              placeholder="0.00"
              {...register("averagePrice", { valueAsNumber: true })}
            />
            {errors.averagePrice && (
              <p className="text-sm text-red-600">
                {errors.averagePrice.message}
              </p>
            )}
          </div>

          {/* Purchase Date */}
          <div className="space-y-2">
            <Label htmlFor="purchaseDate">Purchase Date</Label>
            <Input
              id="purchaseDate"
              type="date"
              {...register("purchaseDate")}
            />
            {errors.purchaseDate && (
              <p className="text-sm text-red-600">
                {errors.purchaseDate.message}
              </p>
            )}
          </div>

          {/* Calculated Value */}
          {amount && averagePrice && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Value:
                </span>
                <span className="font-semibold">
                  $
                  {calculateValue().toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          )}

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                reset();
                setSelectedCoin(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading
                ? "Saving..."
                : mode === "edit"
                ? "Update"
                : "Add Holding"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
