"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { isProtectedRoute, isAuthRoute } from "@/lib/auth-utils";

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return; // Don't redirect while loading

    const currentPath = pathname;

    // Handle protected routes
    if (isProtectedRoute(currentPath) && !isAuthenticated) {
      const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
      router.push(loginUrl);
      return;
    }

    // Handle auth routes (login/register) when user is already authenticated
    if (isAuthRoute(currentPath) && isAuthenticated) {
      const redirectPath =
        new URLSearchParams(window.location.search).get("redirect") ||
        "/portfolio";
      router.push(redirectPath);
      return;
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Don't render protected content for unauthenticated users
  if (isProtectedRoute(pathname) && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Don't render auth pages for authenticated users
  if (isAuthRoute(pathname) && isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
