"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface WithAuthOptions {
  redirectTo?: string;
  requireAuth?: boolean;
  redirectIfAuthenticated?: boolean;
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const {
    redirectTo = "/login",
    requireAuth = true,
    redirectIfAuthenticated = false,
  } = options;

  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (isLoading) return; // Don't redirect while loading

      if (requireAuth && !isAuthenticated) {
        const currentPath = window.location.pathname;
        const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(
          currentPath
        )}`;
        router.push(loginUrl);
        return;
      }

      if (redirectIfAuthenticated && isAuthenticated) {
        const redirectPath =
          new URLSearchParams(window.location.search).get("redirect") ||
          "/portfolio";
        router.push(redirectPath);
        return;
      }
    }, [isAuthenticated, isLoading, router]);

    // Show loading spinner while checking authentication
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    // Don't render if authentication check fails
    if (requireAuth && !isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    // Don't render if user should be redirected
    if (redirectIfAuthenticated && isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

// Convenience HOCs for common use cases
export const withAuthRequired = <P extends object>(
  Component: React.ComponentType<P>
) => withAuth(Component, { requireAuth: true });

export const withAuthRedirect = <P extends object>(
  Component: React.ComponentType<P>
) => withAuth(Component, { requireAuth: false, redirectIfAuthenticated: true });
