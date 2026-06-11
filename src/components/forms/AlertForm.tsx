"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { SearchBar } from "@/components/common/SearchBar";
import { Bell, Mail, Smartphone, AlertTriangle, Search } from "lucide-react";

const alertSchema = z.object({
  coinId: z.string().min(1, "Please select a cryptocurrency"),
  coinSymbol: z.string().min(1, "Symbol is required"),
  coinName: z.string().min(1, "Name is required"),
  condition: z.enum(["above", "below"], {
    required_error: "Please select a condition",
  }),
  targetPrice: z.number().min(0.000001, "Target price must be greater than 0"),
  notifyEmail: z.boolean().default(true),
  notifyPush: z.boolean().default(true),
  notes: z.string().optional(),
});

type AlertForm = z.infer<typeof alertSchema>;

interface CoinOption {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
}

interface AlertFormProps {
  onSubmit: (data: AlertForm) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<AlertForm>;
  className?: string;
}

// Mock coin data for autocomplete
const mockCoins: CoinOption[] = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    image: "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png",
    currentPrice: 43250.45,
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    image:
      "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png",
    currentPrice: 2580.75,
  },
  {
    id: "cardano",
    symbol: "ADA",
    name: "Cardano",
    image:
      "https://coin-images.coingecko.com/coins/images/975/large/cardano.png",
    currentPrice: 0.48,
  },
];

export function AlertForm({
  onSubmit,
  onCancel,
  initialData,
  className,
}: AlertFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCoin, setSelectedCoin] = useState<CoinOption | null>(
    initialData?.coinId
      ? mockCoins.find((coin) => coin.id === initialData.coinId) || null
      : null
  );
  const [showCoinSearch, setShowCoinSearch] = useState(!selectedCoin);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<AlertForm>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      condition: "above",
      notifyEmail: true,
      notifyPush: true,
      ...initialData,
    },
  });

  const watchedFields = watch();

  const filteredCoins = mockCoins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCoinSelect = (coin: CoinOption) => {
    setSelectedCoin(coin);
    setValue("coinId", coin.id);
    setValue("coinSymbol", coin.symbol);
    setValue("coinName", coin.name);
    setShowCoinSearch(false);
    setSearchQuery("");
  };

  const handleFormSubmit = async (data: AlertForm) => {
    if (!selectedCoin) return;

    setIsLoading(true);
    try {
      await onSubmit(data);
      reset();
      setSelectedCoin(null);
      setShowCoinSearch(true);
    } catch (error) {
      console.error("Failed to create alert:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price < 1) return `$${price.toFixed(6)}`;
    if (price < 10) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Create Price Alert</span>
        </CardTitle>
        <CardDescription>
          Get notified when a cryptocurrency reaches your target price
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Coin Selection */}
          <div className="space-y-2">
            <Label>Cryptocurrency</Label>
            {selectedCoin && !showCoinSearch ? (
              <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {selectedCoin.symbol.slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{selectedCoin.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCoin.symbol} •{" "}
                      {formatPrice(selectedCoin.currentPrice)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCoinSearch(true)}
                >
                  <Search className="h-4 w-4 mr-1" />
                  Change
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <SearchBar
                  placeholder="Search for cryptocurrency..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
                {searchQuery && (
                  <div className="max-h-48 overflow-y-auto border rounded-md">
                    {filteredCoins.length > 0 ? (
                      filteredCoins.map((coin) => (
                        <button
                          key={coin.id}
                          type="button"
                          onClick={() => handleCoinSelect(coin)}
                          className="w-full flex items-center space-x-3 p-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                              {coin.symbol.slice(0, 2)}
                            </span>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium">{coin.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {coin.symbol} • {formatPrice(coin.currentPrice)}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        No cryptocurrencies found
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {errors.coinId && (
              <p className="text-sm text-red-500">{errors.coinId.message}</p>
            )}
          </div>

          {/* Alert Condition */}
          <div className="space-y-2">
            <Label htmlFor="condition">Alert Condition</Label>
            <Select
              value={watchedFields.condition}
              onValueChange={(value: "above" | "below") =>
                setValue("condition", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="above">Price goes above</SelectItem>
                <SelectItem value="below">Price goes below</SelectItem>
              </SelectContent>
            </Select>
            {errors.condition && (
              <p className="text-sm text-red-500">{errors.condition.message}</p>
            )}
          </div>

          {/* Target Price */}
          <div className="space-y-2">
            <Label htmlFor="targetPrice">Target Price (USD)</Label>
            <Input
              id="targetPrice"
              type="number"
              step="0.000001"
              placeholder="Enter target price"
              {...register("targetPrice", { valueAsNumber: true })}
              className={errors.targetPrice ? "border-red-500" : ""}
              disabled={isLoading}
            />
            {errors.targetPrice && (
              <p className="text-sm text-red-500">
                {errors.targetPrice.message}
              </p>
            )}
            {selectedCoin && watchedFields.targetPrice && (
              <p className="text-sm text-muted-foreground">
                Current price: {formatPrice(selectedCoin.currentPrice)} •
                {watchedFields.condition === "above"
                  ? " Target is "
                  : " Target is "}
                {watchedFields.targetPrice > selectedCoin.currentPrice
                  ? `${(
                      (watchedFields.targetPrice / selectedCoin.currentPrice -
                        1) *
                      100
                    ).toFixed(2)}% above`
                  : `${(
                      (1 -
                        watchedFields.targetPrice / selectedCoin.currentPrice) *
                      100
                    ).toFixed(2)}% below`}{" "}
                current price
              </p>
            )}
          </div>

          {/* Notification Methods */}
          <div className="space-y-4">
            <Label>Notification Methods</Label>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts via email
                    </p>
                  </div>
                </div>
                <Switch
                  checked={watchedFields.notifyEmail}
                  onCheckedChange={(checked: boolean) =>
                    setValue("notifyEmail", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-coingecko-green-500" />
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts in your browser
                    </p>
                  </div>
                </div>
                <Switch
                  checked={watchedFields.notifyPush}
                  onCheckedChange={(checked: boolean) =>
                    setValue("notifyPush", checked)
                  }
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              placeholder="Add a note for this alert..."
              {...register("notes")}
              disabled={isLoading}
            />
          </div>

          {/* Warning */}
          {selectedCoin && watchedFields.targetPrice && (
            <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200 flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Alert Summary</p>
                <p>
                  You&apos;ll be notified when {selectedCoin.name} goes{" "}
                  {watchedFields.condition}{" "}
                  {formatPrice(watchedFields.targetPrice)}
                </p>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1"
              disabled={
                isLoading || !selectedCoin || !watchedFields.targetPrice
              }
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Creating Alert...</span>
                </>
              ) : (
                "Create Alert"
              )}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
