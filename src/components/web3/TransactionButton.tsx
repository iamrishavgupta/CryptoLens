"use client";

import { useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface TransactionButtonProps {
  type: "send" | "swap" | "stake" | "unstake";
  tokenSymbol?: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

export function TransactionButton({
  type,
  tokenSymbol = "ETH",

  onError,
}: TransactionButtonProps) {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [toAddress, setToAddress] = useState("");

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const handleTransaction = async () => {
    if (!isConnected || !address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (type === "send" && !toAddress) {
      toast.error("Please enter a recipient address");
      return;
    }

    try {
      // For demonstration - in a real app, you'd use specific contract calls
      if (type === "send") {
        // Simple ETH transfer
        writeContract({
          address: toAddress as `0x${string}`,
          abi: [],
          functionName: "transfer",
          args: [],
          value: parseEther(amount),
        });
      } else {
        // For other transaction types, you'd call specific contract methods
        toast.info(`${type} transaction would be executed here`);
      }
    } catch (error) {
      console.error("Transaction error:", error);
      if (onError) {
        onError(error as Error);
      }
      toast.error("Transaction failed");
    }
  };

  const getButtonIcon = () => {
    switch (type) {
      case "send":
        return <ArrowUpRight className="w-4 h-4" />;
      case "swap":
        return <ArrowDownLeft className="w-4 h-4" />;
      case "stake":
        return <ArrowUpRight className="w-4 h-4" />;
      case "unstake":
        return <ArrowDownLeft className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getButtonText = () => {
    switch (type) {
      case "send":
        return "Send";
      case "swap":
        return "Swap";
      case "stake":
        return "Stake";
      case "unstake":
        return "Unstake";
      default:
        return "Transaction";
    }
  };

  const renderTransactionStatus = () => {
    if (isWritePending) {
      return (
        <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span className="text-sm">Waiting for wallet confirmation...</span>
        </div>
      );
    }

    if (hash && isConfirming) {
      return (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin text-yellow-600" />
          <span className="text-sm">Transaction confirming...</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              window.open(`https://etherscan.io/tx/${hash}`, "_blank")
            }
            className="h-6 w-6 p-0"
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      );
    }

    if (isConfirmed) {
      return (
        <div className="flex items-center gap-2 p-3 bg-coingecko-green-50 dark:bg-coingecko-green-950 rounded-lg">
          <CheckCircle className="w-4 h-4 text-coingecko-green-600" />
          <span className="text-sm">Transaction confirmed!</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              window.open(`https://etherscan.io/tx/${hash}`, "_blank")
            }
            className="h-6 w-6 p-0"
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      );
    }

    if (writeError || confirmError) {
      return (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
          <XCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm">Transaction failed</span>
        </div>
      );
    }

    return null;
  };

  if (!isConnected) {
    return (
      <Button disabled className="w-full">
        Connect Wallet to {getButtonText()}
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getButtonIcon()}
          {getButtonText()} {tokenSymbol}
        </CardTitle>
        <CardDescription>
          Execute {type} transaction on the blockchain
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount ({tokenSymbol})</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.0001"
              min="0"
            />
          </div>

          {type === "send" && (
            <div>
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                placeholder="0x..."
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
              />
            </div>
          )}

          {renderTransactionStatus()}

          <Separator />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Network Fee:</span>
              <span>~$2.50</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estimated Time:</span>
              <span>~15 seconds</span>
            </div>
          </div>

          {/* Warning for high gas fees */}
          <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                High network activity detected
              </p>
              <p className="text-yellow-700 dark:text-yellow-300">
                Gas fees may be higher than usual. Consider waiting for lower
                fees.
              </p>
            </div>
          </div>

          <Button
            onClick={handleTransaction}
            disabled={
              isWritePending ||
              isConfirming ||
              !amount ||
              parseFloat(amount) <= 0 ||
              (type === "send" && !toAddress)
            }
            className="w-full"
          >
            {isWritePending || isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isWritePending ? "Confirm in Wallet" : "Confirming..."}
              </>
            ) : (
              <>
                {getButtonIcon()}
                {getButtonText()} {amount ? amount : "0"} {tokenSymbol}
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
