"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Menu,
  X,
  TrendingUp,
  Wallet,
  Settings,
  LogOut,
  Star,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import Logo from "../common/Logo";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

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

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully!");
      router.push("/");
    } catch (error) {
      toast.error("Failed to sign out");
      console.error("Logout error:", error);
    }
  };

  const navigationItems = [
    { label: "Cryptocurrencies", href: "/market", icon: TrendingUp },
    { label: "Exchanges", href: "/exchanges", icon: BarChart3 },
    { label: "DeFi", href: "/defi", icon: TrendingUp },
    { label: "NFT", href: "/nft", icon: TrendingUp },
    { label: "Learn", href: "/education", icon: TrendingUp },
    
  ];
  if (variant === "simplified") {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto">
          <div className="flex h-14 items-center justify-between">
            {/* Left Side */}
            <div className="flex items-center space-x-3">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden"
                onClick={() => setIsMobileMenuOpen?.(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>

              {/* Logo */}
              <Logo />
            </div>

            {/* Right Side - Mobile optimized */}
            <div className="flex items-center gap-2">
              {/* Desktop: Show portfolio button */}
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="hidden md:flex"
                >
                  <Link
                    href="/portfolio"
                    className="flex items-center space-x-1"
                  >
                    <Wallet className="h-4 w-4" />
                    <span>Portfolio</span>
                  </Link>
                </Button>
              )}

              {/* Always show theme toggle */}
              <ThemeToggle />

              {/* Notifications - only on mobile for logged in users */}
              {user && (
                <Link href="/notifications" className="relative md:hidden">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    {unreadNotifications > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                </Link>
              )}

              {/* Desktop: Show wallet connect and user menu */}
              <div className="hidden md:flex items-center gap-2">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.photoURL || user.avatar}
                            alt={user.displayName}
                          />
                          <AvatarFallback>
                            {user.displayName?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.displayName}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/portfolio" className="flex items-center">
                          <Wallet className="mr-2 h-4 w-4" />
                          <span>Portfolio</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                 <div className="flex items-center gap-1">
  <Button variant="ghost" size="sm" asChild className="px-2 text-xs sm:text-sm sm:px-3">
    <Link href="/login">Sign In</Link>
  </Button>
  <Button size="sm" asChild className="px-2 text-xs sm:text-sm sm:px-3 whitespace-nowrap">
    <Link href="/register">Sign Up</Link>
  </Button>
</div>
                )}
              </div>

              {/* Mobile: Show profile dropdown */}
              {user && (
                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.photoURL || user.avatar}
                            alt={user.displayName}
                          />
                          <AvatarFallback>
                            {user.displayName?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user.displayName}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/portfolio" className="flex items-center">
                          <Wallet className="mr-2 h-4 w-4" />
                          <span>Portfolio</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {/* Mobile menu toggle for non-logged in users */}


            {!user && (
  <div className="flex items-center gap-1 md:hidden">
    <Button variant="ghost" size="sm" asChild className="px-2 text-xs">
      <Link href="/login">Sign In</Link>
    </Button>
    <Button size="sm" asChild className="px-2 text-xs">
      <Link href="/register">Sign Up</Link>
    </Button>
  </div>
)}

            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <div className="w-full px-3 sm:px-4">
    <div className="flex h-14 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center">
            {setIsMobileMenuOpen && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            )}

            <Logo />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Portfolio and Watchlist for logged in users */}
            {user && (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    href="/portfolio"
                    className="flex items-center space-x-1"
                  >
                    <Wallet className="h-4 w-4" />
                    <span className="hidden sm:inline">Portfolio</span>
                  </Link>
                </Button>




                <Button variant="ghost" size="sm" asChild>
      <Link href="/watchlist" className="flex items-center space-x-1">
        <Star className="h-4 w-4" />
        <span className="hidden sm:inline">Watchlist</span>
      </Link>
    </Button>




              </>
            )}

            <ThemeToggle />

            {/* Notifications */}
            {user && (
              <Link href="/notifications" className="relative">
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-3 -right-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unreadNotifications}
                  </Badge>
                )}
              </Link>
            )}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.photoURL || user.avatar}
                        alt={user.displayName}
                      />
                      <AvatarFallback>
                        {user.displayName?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.displayName}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/portfolio" className="flex items-center">
                      <Wallet className="mr-2 h-4 w-4" />
                      <span>Portfolio</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};