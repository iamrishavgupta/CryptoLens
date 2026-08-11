"use client";

import { useState } from "react";
import {
  useAccount,
  useBalance,
  useSignMessage,
  useSwitchChain,
} from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  FileSignature,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { WalletConnect } from "@/components/web3/WalletConnect";

export function WalletInfo() {
  const { address, isConnected, chain } = useAccount();
  const [showBalance, setShowBalance] = useState(true);
  const [signature, setSignature] = useState<string | null>(null);
  const {
    data: balance,
    isLoading: balanceLoading,
    error: balanceError,
    refetch,
  } = useBalance({
    address,
    query: { enabled: Boolean(address) },
  });
  const { chains, switchChain, isPending: isSwitching, error: switchError } =
    useSwitchChain();
  const { signMessageAsync, isPending: isSigning, error: signError } =
    useSignMessage();

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      toast.success("Wallet address copied");
    } catch {
      toast.error("Could not copy wallet address");
    }
  };

  const signProof = async () => {
    if (!address) return;
    try {
      const message = [
        "CryptoLens wallet verification",
        `Address: ${address}`,
        `Network: ${chain?.name || "Unknown"}`,
        `Issued at: ${new Date().toISOString()}`,
        "This request is free and does not authorize a transaction.",
      ].join("\n");
      const result = await signMessageAsync({ message });
      setSignature(result);
      toast.success("Message signed successfully");
    } catch (error) {
      if ((error as Error).message.toLowerCase().includes("rejected")) {
        toast.error("Signature request rejected");
      }
    }
  };

  if (!isConnected || !address) {
    return (
      <Card className="rounded-xl">
        <CardContent className="flex flex-col items-center justify-center px-5 py-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
            <Wallet className="h-7 w-7 text-emerald-500" />
          </div>
          <h2 className="text-lg font-semibold">Connect your wallet</h2>
          <p className="mb-5 mt-2 max-w-sm text-sm text-muted-foreground">
            View your live balance, switch networks, sign a proof message, and send native tokens.
          </p>
          <WalletConnect />
        </CardContent>
      </Card>
    );
  }

  const explorerUrl = chain?.blockExplorers?.default.url;
  const isSupported = chains.some((supportedChain) => supportedChain.id === chain?.id);

  return (
    <div className="space-y-4">
      <Card className="rounded-xl">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 p-5 pb-3">
          <div className="min-w-0">
            <CardTitle className="text-lg">Wallet Overview</CardTitle>
            <CardDescription className="truncate">
              {chain?.name || "Unknown network"}
            </CardDescription>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label={showBalance ? "Hide balance" : "Show balance"}
              onClick={() => setShowBalance((visible) => !visible)}
            >
              {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Refresh balance"
              onClick={() => refetch()}
              disabled={balanceLoading}
            >
              <RefreshCw className={`h-4 w-4 ${balanceLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-5 pt-0">
          <div className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-muted p-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Wallet address</p>
              <code className="block truncate text-sm">
                {address.slice(0, 8)}...{address.slice(-6)}
              </code>
            </div>
            <div className="flex flex-shrink-0 gap-1">
              <Button variant="ghost" size="icon" aria-label="Copy address" onClick={copyAddress}>
                <Copy className="h-4 w-4" />
              </Button>
              {explorerUrl && (
                <Button variant="ghost" size="icon" asChild>
                  <a
                    href={`${explorerUrl}/address/${address}`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="View address on block explorer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Native balance</span>
            <span className="truncate font-mono font-medium">
              {balanceLoading
                ? "Loading..."
                : balanceError
                  ? "Unavailable"
                  : showBalance && balance
                    ? `${Number(balance.formatted).toLocaleString(undefined, { maximumFractionDigits: 6 })} ${balance.symbol}`
                    : "••••••"}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge className={isSupported ? "bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/15" : "bg-red-500/15 text-red-500 hover:bg-red-500/15"}>
              {isSupported ? "Supported" : "Unsupported network"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-lg">Network</CardTitle>
          <CardDescription>Choose the chain used for balances and transactions.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 p-5 pt-0 sm:grid-cols-3">
          {chains.map((availableChain) => (
            <Button
              key={availableChain.id}
              variant={chain?.id === availableChain.id ? "default" : "outline"}
              className="min-w-0 justify-start"
              disabled={isSwitching || chain?.id === availableChain.id}
              onClick={() => switchChain({ chainId: availableChain.id })}
            >
              <span className="truncate">{availableChain.name}</span>
            </Button>
          ))}
          {switchError && (
            <p className="col-span-full text-xs text-red-500">{switchError.message}</p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileSignature className="h-5 w-5" /> Proof of wallet
          </CardTitle>
          <CardDescription>
            Sign a free message to prove wallet ownership. This never moves funds.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-5 pt-0">
          <Button className="w-full" variant="outline" onClick={signProof} disabled={isSigning}>
            {isSigning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
            {isSigning ? "Check your wallet..." : "Sign verification message"}
          </Button>
          {signature && (
            <div className="rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
              <p className="font-medium">Signature created</p>
              <code className="mt-1 block truncate">{signature}</code>
            </div>
          )}
          {signError && !signature && (
            <p className="text-xs text-red-500">{signError.message}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
