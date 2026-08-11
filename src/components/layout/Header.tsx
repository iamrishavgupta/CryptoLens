"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  LogOut,
  Menu,
  Settings,
  Star,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { WalletConnect } from "@/components/web3/WalletConnect";
import Logo from "@/components/common/Logo";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/lib/firebase";

interface HeaderProps {
  variant?: "full" | "simplified";
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}
export const Header: React.FC<HeaderProps> = ({
  variant = "full",
  isMobileMenuOpen = false,
  setIsMobileMenuOpen,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (!user?.uid) {
      setUnreadNotifications(0);
      return;
    }
    const alertsQuery = query(
      collection(db, "alerts"),
      where("userId", "==", user.uid),
      where("isTriggered", "==", true)
    );
    return onSnapshot(alertsQuery, (snapshot) => {
      setUnreadNotifications(
        snapshot.docs.filter((item) => !item.data().notificationRead).length
      );
    });
  }, [user?.uid]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to sign out");
    }
  };

  const navigationItems = [
    { label: "Cryptocurrencies", href: "/market", icon: TrendingUp },
    { label: "Exchanges", href: "/exchanges", icon: BarChart3 },
    { label: "DeFi", href: "/defi", icon: TrendingUp },
    { label: "NFT", href: "/nft", icon: TrendingUp },
    { label: "Learn", href: "/education", icon: TrendingUp },
    { label: "Web3", href: "/web3", icon: Wallet },
  ];

  const walletControl = (desktopBreakpoint: "md" | "xl") => (
    <>
      <div className={desktopBreakpoint === "md" ? "md:hidden" : "xl:hidden"}>
        <WalletConnect compact />
      </div>
      <div className={desktopBreakpoint === "md" ? "hidden md:block" : "hidden xl:block"}>
        <WalletConnect />
      </div>
    </>
  );

  const userMenu = (mobile = false) => {
    if (!user) return null;
    return (
      <div className={mobile ? "md:hidden" : "hidden md:block"}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL || user.avatar} alt={user.displayName} />
                <AvatarFallback>
                  {user.displayName?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.displayName}</p>
                <p className="truncate text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/portfolio" className="flex items-center">
                <Wallet className="mr-2 h-4 w-4" /> Portfolio
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/web3" className="flex items-center">
                <Wallet className="mr-2 h-4 w-4" /> Wallet Center
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  const authButtons = (mobile = false) => {
    if (user) return null;
    return (
      <div className={`items-center gap-1 ${mobile ? "flex md:hidden" : "hidden md:flex"}`}>
        <Button variant="ghost" size="sm" asChild className="px-2 text-xs sm:px-3 sm:text-sm">
          <Link href="/login">Sign In</Link>
        </Button>
        <Button size="sm" asChild className="hidden whitespace-nowrap px-2 text-xs min-[390px]:inline-flex sm:px-3 sm:text-sm">
          <Link href="/register">Sign Up</Link>
        </Button>
      </div>
    );
  };

  const notificationButton = (mobileOnly = false) => {
    if (!user) return null;
    return (
      <Link href="/notifications" className={`relative ${mobileOnly ? "md:hidden" : ""}`}>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-4 w-4" />
          {unreadNotifications > 0 && (
            <Badge variant="destructive" className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full p-0 text-[10px]">
              {unreadNotifications}
            </Badge>
          )}
        </Button>
      </Link>
    );
  };

  if (variant === "simplified") {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto w-full max-w-[1536px] px-3 sm:px-4">
          <div className="flex h-14 items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 xl:hidden"
                aria-label="Toggle navigation"
                onClick={() => setIsMobileMenuOpen?.(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <Logo />
            </div>

            <div className="flex flex-shrink-0 items-center gap-1 sm:gap-2">
              {user && (
                <Button variant="ghost" size="sm" asChild className="hidden lg:flex">
                  <Link href="/portfolio" className="flex items-center gap-1">
                    <Wallet className="h-4 w-4" /> Portfolio
                  </Link>
                </Button>
              )}
              {walletControl("md")}
              <ThemeToggle />
              {notificationButton(true)}
              {userMenu(false)}
              {userMenu(true)}
              {authButtons(false)}
              {authButtons(true)}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-3 sm:px-4">
        <div className="flex h-14 items-center justify-between gap-2">
          <div className="flex min-w-0 items-center">
            {setIsMobileMenuOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 md:hidden"
                aria-label="Toggle navigation"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
            <Logo />
          </div>

          <nav className="hidden items-center space-x-5 lg:flex">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === item.href ? "text-primary" : "text-muted-foreground"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-shrink-0 items-center gap-1">
            {user && (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                  <Link href="/portfolio" className="flex items-center gap-1">
                    <Wallet className="h-4 w-4" />
                    <span className="hidden xl:inline">Portfolio</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
                  <Link href="/watchlist" className="flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    <span className="hidden xl:inline">Watchlist</span>
                  </Link>
                </Button>
              </>
            )}
            {walletControl("xl")}
            <ThemeToggle />
            <div className="hidden sm:block">{notificationButton()}</div>
            {userMenu(false)}
            {userMenu(true)}
            {authButtons(false)}
            {authButtons(true)}
          </div>
        </div>
      </div>
    </header>
  );
};
