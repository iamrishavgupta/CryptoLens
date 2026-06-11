"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  TrendingUp,
  Wallet,
  Coins,
  Image,
  Newspaper,
  BarChart3,
  Settings,
  Star,
  Bell,
  Receipt,
  X,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  {
    label: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    label: "Markets",
    href: "/market",
    icon: TrendingUp,
  },
  {
    label: "Portfolio",
    href: "/portfolio",
    icon: Wallet,
  },
  {
    label: "DeFi",
    href: "/defi",
    icon: Coins,
  },
  {
    label: "NFTs",
    href: "/nft",
    icon: Image,
  },
  {
    label: "News",
    href: "/news",
    icon: Newspaper,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Education",
    href: "/education",
    icon: BookOpen,
  },
  {
    label: "Watchlist",
    href: "/watchlist",
    icon: Star,
  },
  {
    label: "Alerts",
    href: "/alerts",
    icon: Bell,
    badge: 3,
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: Receipt,
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, className }) => {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-30 h-full w-64 transform bg-background border-r transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BarChart3 className="h-4 w-4" />
              </div>
              <span className="text-lg font-semibold">CoinLens</span>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    // Close sidebar on mobile when navigating
                    if (
                      typeof window !== "undefined" &&
                      window.innerWidth < 1024
                    ) {
                      onClose();
                    }
                  }}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive(item.href)
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>
          </ScrollArea>

          {/* Settings */}
          <div className="border-t p-3">
            <Link
              href="/settings"
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                isActive("/settings")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
