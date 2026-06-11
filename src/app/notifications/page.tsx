"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell, TrendingUp, TrendingDown, Check, Plus,
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  collection, query, where, onSnapshot, doc, updateDoc, writeBatch,
} from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { withAuthRequired } from "@/components/common/withAuth";
import Image from "next/image";

interface AlertNotification {
  id: string;
  coinId: string;
  coinSymbol: string;
  coinName: string;
  coinImage: string;
  condition: "above" | "below";
  targetPrice: number;
  triggeredAt?: string;
  notificationRead?: boolean;
}

function NotificationsPageComponent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "alerts"),
      where("userId", "==", user.uid),
      where("isTriggered", "==", true)
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as AlertNotification[];
      data.sort((a, b) => new Date(b.triggeredAt || 0).getTime() - new Date(a.triggeredAt || 0).getTime());
      setNotifications(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, [user?.uid]);

  const markAllAsRead = async () => {
    const batch = writeBatch(db);
    notifications.forEach((n) => {
      if (!n.notificationRead) {
        batch.update(doc(db, "alerts", n.id), { notificationRead: true });
      }
    });
    await batch.commit();
  };

  const markAsRead = async (id: string) => {
    await updateDoc(doc(db, "alerts", id), { notificationRead: true });
  };

  const formatPrice = (price: number) => {
    if (price < 1) return `$${price.toFixed(6)}`;
    if (price < 10) return `$${price.toFixed(4)}`;
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const unreadCount = notifications.filter((n) => !n.notificationRead).length;

  return (
    <div className="min-h-screen bg-background">
      <Header variant="simplified" isMobileMenuOpen={sidebarOpen} setIsMobileMenuOpen={setSidebarOpen} />
      <div className="flex container mx-auto px-4">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0">
          <div className="container mx-auto px-4 py-5 space-y-6">

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Bell className="h-8 w-8" />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
                  )}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Notifications from your triggered price alerts
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/alerts">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Alert
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              </div>
            </div>

            {/* List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You&apos;ll see notifications here when your price alerts are triggered
                  </p>
                  <Link href="/alerts">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Alert
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <Card
                    key={n.id}
                    className={`transition-colors ${!n.notificationRead ? "border-blue-300 bg-blue-50/50 dark:bg-blue-950/20" : ""}`}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="relative">
                        <Image src={n.coinImage} alt={n.coinName} width={40} height={40} className="rounded-full" />
                        <div className={`absolute -bottom-1 -right-1 rounded-full p-0.5 ${n.condition === "above" ? "bg-green-500" : "bg-red-500"}`}>
                          {n.condition === "above"
                            ? <TrendingUp className="h-3 w-3 text-white" />
                            : <TrendingDown className="h-3 w-3 text-white" />}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">
                          {n.coinName} ({n.coinSymbol.toUpperCase()}) Price Alert
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Reached your target of {formatPrice(n.targetPrice)} (alert: price goes {n.condition} {formatPrice(n.targetPrice)})
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{formatTime(n.triggeredAt)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!n.notificationRead && (
                          <Button variant="ghost" size="sm" onClick={() => markAsRead(n.id)}>
                            <Check className="h-4 w-4 mr-1" />
                            Mark read
                          </Button>
                        )}
                        <Link href="/alerts">
                          <Button variant="outline" size="sm">View Alert</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

export default withAuthRequired(NotificationsPageComponent);