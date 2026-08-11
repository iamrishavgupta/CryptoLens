"use client";

import { useEffect, useRef, useState } from "react";
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { type Address, isAddress, parseEther } from "viem";
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
import {
  ArrowUpRight,
  CheckCircle,
  ExternalLink,
  Loader2,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { WalletConnect } from "@/components/web3/WalletConnect";

interface TransactionButtonProps {
  type?: "send";
  tokenSymbol?: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

export function TransactionButton({
  type = "send",
  tokenSymbol,
  onSuccess,
  onError,
}: TransactionButtonProps) {
  const { address, isConnected, chain } = useAccount();
  const [amount, setAmount] = useState("");
  const [toAddress, setToAddress] = useState("");
  const completedHash = useRef<string | null>(null);

  const {
    data: hash,
    sendTransaction,
    isPending: isSending,
    error: sendError,
    reset,
  } = useSendTransaction({
    mutation: {
      onError: (error) => {
        onError?.(error);
        toast.error(
          error.message.toLowerCase().includes("rejected")
            ? "Transaction rejected"
            : "Could not submit transaction"
        );
      },
    },
  });

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (!isConfirmed || !hash || completedHash.current === hash) return;
    completedHash.current = hash;
    toast.success("Transaction confirmed");
    onSuccess?.(hash);
  }, [hash, isConfirmed, onSuccess]);

  useEffect(() => {
    if (receiptError) onError?.(receiptError);
  }, [onError, receiptError]);

  const symbol = chain?.nativeCurrency.symbol || tokenSymbol || "ETH";
  const explorerUrl = chain?.blockExplorers?.default.url;
  const recipientIsValid = isAddress(toAddress);
  const amountIsValid = Boolean(amount) && Number(amount) > 0;

  const handleSend = () => {
    if (!isConnected || !address) {
      toast.error("Connect your wallet first");
      return;
    }
    if (!recipientIsValid) {
      toast.error("Enter a valid recipient address");
      return;
    }
    if (!amountIsValid) {
      toast.error("Enter a valid amount");
      return;
    }

    try {
      sendTransaction({
        to: toAddress as Address,
        value: parseEther(amount),
      });
    } catch (error) {
      onError?.(error as Error);
      toast.error("Invalid transaction details");
    }
  };

  const startAnother = () => {
    reset();
    completedHash.current = null;
    setAmount("");
    setToAddress("");
  };

  if (!isConnected) {
    return (
      <Card className="rounded-xl">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ArrowUpRight className="h-5 w-5" /> Send native token
          </CardTitle>
          <CardDescription>Connect a wallet to create an on-chain transfer.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <WalletConnect className="w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl">
      <CardHeader className="p-5 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ArrowUpRight className="h-5 w-5" /> Send {symbol}
        </CardTitle>
        <CardDescription>
          Send the native token on {chain?.name || "the connected network"}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 p-5 pt-0">
        <div className="space-y-2">
          <Label htmlFor="native-send-recipient">Recipient address</Label>
          <Input
            id="native-send-recipient"
            placeholder="0x..."
            value={toAddress}
            onChange={(event) => setToAddress(event.target.value.trim())}
            aria-invalid={Boolean(toAddress) && !recipientIsValid}
          />
          {toAddress && !recipientIsValid && (
            <p className="text-xs text-red-500">Enter a valid EVM address.</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="native-send-amount">Amount ({symbol})</Label>
          <Input
            id="native-send-amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder="0.0"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </div>

        {(isSending || isConfirming) && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-600 dark:text-amber-400">
            <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
            {isSending ? "Confirm this transfer in your wallet..." : "Waiting for blockchain confirmation..."}
          </div>
        )}

        {isConfirmed && hash && (
          <div className="space-y-3 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" /> Transaction confirmed
            </div>
            <div className="flex gap-2">
              {explorerUrl && (
                <Button variant="outline" size="sm" asChild>
                  <a href={`${explorerUrl}/tx/${hash}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="mr-2 h-3.5 w-3.5" /> Explorer
                  </a>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={startAnother}>Send another</Button>
            </div>
          </div>
        )}

        {(sendError || receiptError) && (
          <div className="flex items-start gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
            <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span className="line-clamp-3">{(sendError || receiptError)?.message}</span>
          </div>
        )}

        <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>
            This sends real funds. Verify the network, address, amount, and wallet fee before confirming.
          </span>
        </div>

        <Button
          className="w-full bg-emerald-500 text-white hover:bg-emerald-400"
          onClick={handleSend}
          disabled={isSending || isConfirming || isConfirmed || !recipientIsValid || !amountIsValid}
        >
          {isSending || isConfirming ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ArrowUpRight className="mr-2 h-4 w-4" />
          )}
          {isSending ? "Confirm in wallet" : isConfirming ? "Confirming" : `Send ${amount || "0"} ${symbol}`}
        </Button>
      </CardContent>
    </Card>
  );
}
