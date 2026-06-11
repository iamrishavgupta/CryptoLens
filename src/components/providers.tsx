"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { WagmiProvider } from "wagmi";
import { ConnectKitProvider } from "connectkit";
import { wagmiConfig } from "@/lib/wagmi";
import { useAuthStore } from "@/store/authStore";

// Create QueryClient with memoization to prevent recreation
const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 1,
      },
    },
  });

function AuthInitializer() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return null;
}

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Memoize QueryClient to prevent recreation on re-renders
  const queryClient = useMemo(() => createQueryClient(), []);

  // Track if providers are already initialized to prevent multiple instances
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) {
      console.warn("Providers already initialized, skipping re-initialization");
      return;
    }
    isInitialized.current = true;

    // Cleanup on unmount
    return () => {
      isInitialized.current = false;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <WagmiProvider config={wagmiConfig}>
          <ConnectKitProvider
            theme="auto"
            mode="auto"
            options={{
              initialChainId: 0,
              enforceSupportedChains: false,
              disclaimer: undefined,
            }}
          >
            <AuthInitializer />
            {children}
          </ConnectKitProvider>
        </WagmiProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
