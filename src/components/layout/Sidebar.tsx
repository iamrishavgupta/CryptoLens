"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  TrendingUp,
  Wallet,
  Coins,
  Image,
  Newspaper,
  BarChart3,
  Settings,
  Star,
  BookOpen,
  X,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WalletConnect } from "../web3/WalletConnect";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const navigationItems: NavigationItem[] = [
  { label: "Cryptocurrencies", href: "/market", icon: TrendingUp },
  { label: "Exchanges", href: "/exchanges", icon: BarChart3 },
  { label: "DeFi", href: "/defi", icon: Coins },
  { label: "NFT", href: "/nft", icon: Image },
  { label: "Learn", href: "/education", icon: BookOpen },
  { label: "Wallet Center", href: "/web3", icon: Wallet },
  { label: "Portfolio", href: "/portfolio", icon: Wallet },
  { label: "Watchlist", href: "/watchlist", icon: Star },
];

function SidebarMarketStats() {
  const [stats, setStats] = React.useState<{
    marketCap: string;
    volume: string;
    btcDom: string;
  } | null>(null);

  React.useEffect(() => {
    fetch("/api/market/global")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const d = json.data;
          const fmt = (n: number) => {
            if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
            if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
            return `$${n.toLocaleString()}`;
          };
          setStats({
            marketCap: fmt(d.totalMarketCap),
            volume: fmt(d.totalVolume),
            btcDom: `${d.bitcoinDominance.toFixed(1)}%`,
          });
        }
      })
      .catch(() => { });
  }, []);

  return (
    <div className="px-3 py-2 text-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="text-muted-foreground">Market Cap</span>
        <span className="font-medium text-green-500">
          {stats?.marketCap || "..."}
        </span>
      </div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-muted-foreground">24h Volume</span>
        <span className="font-medium">{stats?.volume || "..."}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">BTC Dom</span>
        <span className="font-medium">{stats?.btcDom || "..."}</span>
      </div>
    </div>
  );
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, className }) => {
  const pathname = usePathname();
  const { user } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = React.useState(0);

  React.useEffect(() => {
    if (!user?.uid) {
      setUnreadNotifications(0);
      return;
    }
    const q = query(
      collection(db, "alerts"),
      where("userId", "==", user.uid),
      where("isTriggered", "==", true)
    );
    const unsub = onSnapshot(q, (snap) => {
      const count = snap.docs.filter((d) => !d.data().notificationRead).length;
      setUnreadNotifications(count);
    });
    return () => unsub();
  }, [user?.uid]);

  return (
    <div>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 transform bg-background border-r transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b lg:hidden">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-4">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-coingecko-green-500 text-white"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="ml-auto h-5 px-1.5 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}

              <div className="">
                <WalletConnect />
              </div>

              {/* Quick Actions */}
              <div className="mt-6 space-y-2">
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Quick Actions
                </div>
                <Link
                  href="/notifications"
                  onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {unreadNotifications > 0 ? (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadNotifications}
                    </span>
                  ) : (
                    <Bell className="h-4 w-4" />
                  )}
                  <span>Notifications</span>
                </Link>
                <Link
                  href="/alerts"
                  onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <span className="h-4 w-4 text-yellow-500">🔔</span>
                  <span>Price Alerts</span>
                </Link>

              </div>

              {/* Market Stats */}
              <div className="mt-6 space-y-2">
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Market Overview
                </div>
                <SidebarMarketStats />
              </div>

              {/* Support */}


            </nav>
          </ScrollArea>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;