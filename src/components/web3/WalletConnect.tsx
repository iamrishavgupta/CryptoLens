"use client";

import React from "react";
import Link from "next/link";
import {
  CircleUserRound,
  Copy,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Network,
  Wallet,
} from "lucide-react";
import { useAccount, useDisconnect } from "wagmi";
import { useModal } from "connectkit";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WalletConnectProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
  compact?: boolean;
  className?: string;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  onConnect,
  onDisconnect,
  compact = false,
  className,
}) => {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { setOpen, openProfile, openSwitchNetworks } = useModal({
    onConnect: ({ address: connectedAddress }) => {
      if (connectedAddress) {
        onConnect?.(connectedAddress);
        toast.success("Wallet connected");
      }
    },
    onDisconnect: () => {
      onDisconnect?.();
    },
  });

  const copyAddress = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      toast.success("Wallet address copied");
    } catch {
      toast.error("Could not copy wallet address");
    }
  };

  const explorerUrl = chain?.blockExplorers?.default.url;
  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  if (!isConnected || !address) {
    return (
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          compact ? "relative h-9 w-9 p-0" : "gap-2",
          className
        )}
        aria-label="Connect wallet"
      >
        <Wallet className="h-4 w-4" />
        {!compact && <span>Connect Wallet</span>}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            compact ? "relative h-9 w-9 p-0" : "max-w-full gap-2",
            className
          )}
          aria-label={`Wallet connected: ${shortAddress}`}
        >
          <Wallet className="h-4 w-4 flex-shrink-0" />
          {!compact && (
            <>
              <span className="truncate">{shortAddress}</span>
              {chain && (
                <Badge variant="secondary" className="hidden max-w-28 truncate xl:inline-flex">
                  {chain.name}
                </Badge>
              )}
            </>
          )}
          {compact && (
            <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full border border-background bg-emerald-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <span className="block text-xs font-normal text-muted-foreground">Connected wallet</span>
          <span className="font-mono text-sm">{shortAddress}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={openProfile} className="gap-2">
          <CircleUserRound className="h-4 w-4" />
          Account details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openSwitchNetworks} className="gap-2">
          <Network className="h-4 w-4" />
          Switch network
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/web3" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Wallet Center
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyAddress} className="gap-2">
          <Copy className="h-4 w-4" />
          Copy address
        </DropdownMenuItem>
        {explorerUrl && (
          <DropdownMenuItem asChild>
            <a
              href={`${explorerUrl}/address/${address}`}
              target="_blank"
              rel="noreferrer"
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View on explorer
            </a>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => disconnect()}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
