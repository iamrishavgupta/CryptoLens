"use client";

import { useState } from "react";
import { Blocks, ShieldCheck } from "lucide-react";
import { Header } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { WalletConnect } from "@/components/web3/WalletConnect";
import { WalletInfo } from "@/components/web3/WalletInfo";
import { TransactionButton } from "@/components/web3/TransactionButton";

export default function Web3Page() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header
        variant="simplified"
        isMobileMenuOpen={sidebarOpen}
        setIsMobileMenuOpen={setSidebarOpen}
      />
      <div className="mx-auto flex w-full max-w-[1536px] px-3 sm:px-4">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="min-w-0 flex-1 overflow-x-hidden py-4 sm:p-5">
          <div className="mx-auto w-full max-w-5xl space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
                  <Blocks className="h-7 w-7 flex-shrink-0 text-emerald-500" />
                  Wallet Center
                </h1>
                <p className="mt-1 text-sm text-muted-foreground sm:text-base">
                  Connect, inspect, verify, and transact with your EVM wallet.
                </p>
              </div>
              <div className="hidden flex-shrink-0 sm:block">
                <WalletConnect />
              </div>
            </div>
            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
              <WalletInfo />
              <div className="space-y-4">
                <TransactionButton type="send" />
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                    <div>
                      <h2 className="text-sm font-semibold">Self-custody safety</h2>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        CryptoLens never receives your private key or seed phrase. Wallet prompts show exactly what you are signing or sending. Verify every request before approval.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
