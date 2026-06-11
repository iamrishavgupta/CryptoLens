import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

// Helper function to create mock timestamp
interface MockTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate: () => Date;
  toMillis: () => number;
  isEqual: (other?: unknown) => boolean;
  toJSON: () => { seconds: number; nanoseconds: number };
  valueOf: () => string;
}

const createMockTimestamp = (): MockTimestamp => ({
  seconds: Math.floor(Date.now() / 1000),
  nanoseconds: 0,
  toDate: () => new Date(),
  toMillis: () => Date.now(),
  isEqual: () => false,
  toJSON: () => ({ seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 }),
  valueOf: () => Date.now().toString(),
});

// Simplified interfaces for the store
interface SimplePortfolioHolding {
  id?: string;
  coinId: string;
  symbol: string;
  name: string;
  image: string;
  amount: number;
  averagePrice: number;
  currentPrice: number;
  value: number;
  allocation: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  firstPurchaseDate: MockTimestamp;
}

interface SimplePortfolioPerformance {
  totalValue: number;
  totalCost: number;
  totalPnL: number;
  totalPnLPercentage: number;
  dayChange: number;
  dayChangePercentage: number;
  weekChange: number;
  weekChangePercentage: number;
  monthChange: number;
  monthChangePercentage: number;
  allTimeHigh: number;
  allTimeLow: number;
  volatility: number;
  sharpeRatio: number;
}

interface SimplePortfolio {
  id: string;
  userId: string;
  name: string;
  description: string;
  isPublic: boolean;
  holdings: SimplePortfolioHolding[];
  performance: SimplePortfolioPerformance;
  allocation: Array<{ asset: string; percentage: number; value: number }>;
  riskMetrics: {
    var95: number;
    beta: number;
    sharpeRatio: number;
    maxDrawdown: number;
    volatility: number;
  };
  createdAt: MockTimestamp;
  updatedAt: MockTimestamp;
}

interface PortfolioStore {
  portfolios: SimplePortfolio[];
  activePortfolioId: string | null;
  loading: boolean;
  isLoading: boolean; // Add for compatibility
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  addPortfolio: (name: string, description?: string) => void;
  updatePortfolio: (id: string, updates: Partial<SimplePortfolio>) => void;
  deletePortfolio: (id: string) => void;
  setActivePortfolio: (id: string) => void;
  addHolding: (portfolioId: string, holding: SimplePortfolioHolding) => void;
  updateHolding: (
    portfolioId: string,
    holdingId: string,
    updates: Partial<SimplePortfolioHolding>
  ) => void;
  removeHolding: (portfolioId: string, holdingId: string) => void;
  addTransaction: (transaction: unknown) => void; // Add for compatibility
  refreshPortfolioData: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Computed getters
  getActivePortfolio: () => SimplePortfolio | null;
  getTotalPortfolioValue: () => number;
  getPortfolioById: (id: string) => SimplePortfolio | null;
}

export const usePortfolioStore = create<PortfolioStore>()(
  devtools(
    persist(
      (set, get) => ({
        portfolios: [
          // Mock portfolio data
          {
            id: "default-portfolio",
            userId: "mock-user",
            name: "My Portfolio",
            description: "Main investment portfolio",
            isPublic: false,
            holdings: [
              {
                coinId: "bitcoin",
                symbol: "btc",
                name: "Bitcoin",
                image:
                  "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png",
                amount: 0.5,
                averagePrice: 40000,
                currentPrice: 43250.45,
                value: 21625.225,
                allocation: 65.2,
                priceChange24h: 1034.56,
                priceChangePercentage24h: 2.45,
                firstPurchaseDate: createMockTimestamp(),
              },
              {
                coinId: "ethereum",
                symbol: "eth",
                name: "Ethereum",
                image:
                  "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png",
                amount: 5,
                averagePrice: 2200,
                currentPrice: 2385.67,
                value: 11928.35,
                allocation: 35.9,
                priceChange24h: -29.87,
                priceChangePercentage24h: -1.23,
                firstPurchaseDate: createMockTimestamp(),
              },
            ],
            performance: {
              totalValue: 33553.575,
              totalCost: 31000,
              totalPnL: 2553.575,
              totalPnLPercentage: 8.24,
              dayChange: 680.23,
              dayChangePercentage: 2.07,
              weekChange: -234.56,
              weekChangePercentage: -0.69,
              monthChange: 1234.67,
              monthChangePercentage: 3.82,
              allTimeHigh: 35000,
              allTimeLow: 28000,
              volatility: 12.5,
              sharpeRatio: 1.2,
            },
            allocation: [
              { asset: "BTC", percentage: 65.2, value: 21625.225 },
              { asset: "ETH", percentage: 35.9, value: 11928.35 },
            ],
            riskMetrics: {
              var95: 2500,
              beta: 1.1,
              sharpeRatio: 1.2,
              maxDrawdown: 15.3,
              volatility: 12.5,
            },
            createdAt: createMockTimestamp(),
            updatedAt: createMockTimestamp(),
          },
        ],
        activePortfolioId: "default-portfolio",
        loading: false,
        isLoading: false, // Add for compatibility
        error: null,
        lastUpdated: new Date(),

        // Internal setters (not exposed in interface)
        _setPortfolios: (portfolios: SimplePortfolio[]) => set({ portfolios }),
        _setActivePortfolioId: (id: string | null) =>
          set({ activePortfolioId: id }),
        setLoading: (loading: boolean) => set({ loading }),
        setError: (error: string | null) => set({ error }),

        addPortfolio: (name, description) => {
          const newPortfolio = {
            id: `portfolio-${Date.now()}`,
            userId: "mock-user",
            name,
            description: description || "",
            isPublic: false,
            holdings: [],
            performance: {
              totalValue: 0,
              totalCost: 0,
              totalPnL: 0,
              totalPnLPercentage: 0,
              dayChange: 0,
              dayChangePercentage: 0,
              weekChange: 0,
              weekChangePercentage: 0,
              monthChange: 0,
              monthChangePercentage: 0,
              allTimeHigh: 0,
              allTimeLow: 0,
              volatility: 0,
              sharpeRatio: 0,
            },
            allocation: [],
            riskMetrics: {
              var95: 0,
              beta: 0,
              sharpeRatio: 0,
              maxDrawdown: 0,
              volatility: 0,
            },
            createdAt: createMockTimestamp(),
            updatedAt: createMockTimestamp(),
          };

          set((state) => ({
            portfolios: [...state.portfolios, newPortfolio],
            activePortfolioId: newPortfolio.id,
          }));
        },

        updatePortfolio: (id, updates) => {
          set((state) => ({
            portfolios: state.portfolios.map((portfolio) =>
              portfolio.id === id
                ? { ...portfolio, ...updates, updatedAt: createMockTimestamp() }
                : portfolio
            ),
          }));
        },

        deletePortfolio: (id) => {
          set((state) => {
            const updatedPortfolios = state.portfolios.filter(
              (p) => p.id !== id
            );
            const newActiveId =
              state.activePortfolioId === id
                ? updatedPortfolios[0]?.id || null
                : state.activePortfolioId;

            return {
              portfolios: updatedPortfolios,
              activePortfolioId: newActiveId,
            };
          });
        },

        setActivePortfolio: (id) => {
          set({ activePortfolioId: id });
        },

        addHolding: (portfolioId, holding) => {
          set((state) => ({
            portfolios: state.portfolios.map((portfolio) =>
              portfolio.id === portfolioId
                ? {
                    ...portfolio,
                    holdings: [
                      ...portfolio.holdings,
                      {
                        ...holding,
                        id: `holding-${Date.now()}`,
                      },
                    ],
                    updatedAt: createMockTimestamp(),
                  }
                : portfolio
            ),
          }));
        },

        updateHolding: (portfolioId, holdingId, updates) => {
          set((state) => ({
            portfolios: state.portfolios.map((portfolio) =>
              portfolio.id === portfolioId
                ? {
                    ...portfolio,
                    holdings: portfolio.holdings.map((holding) =>
                      holding.id === holdingId
                        ? { ...holding, ...updates }
                        : holding
                    ),
                    updatedAt: createMockTimestamp(),
                  }
                : portfolio
            ),
          }));
        },

        removeHolding: (portfolioId, holdingId) => {
          set((state) => ({
            portfolios: state.portfolios.map((portfolio) =>
              portfolio.id === portfolioId
                ? {
                    ...portfolio,
                    holdings: portfolio.holdings.filter(
                      (holding) => holding.id !== holdingId
                    ),
                    updatedAt: createMockTimestamp(),
                  }
                : portfolio
            ),
          }));
        },

        addTransaction: (transaction) => {
          // Mock implementation for transaction adding
          console.log("Adding transaction:", transaction);
          // In a real app, this would add the transaction and update holdings
        },

        refreshPortfolioData: async () => {
          set({ loading: true, error: null });
          try {
            // Simulate API call to refresh portfolio data
            await new Promise((resolve) => setTimeout(resolve, 1000));

            // In a real app, this would fetch updated prices and recalculate portfolio metrics
            set({
              loading: false,
              lastUpdated: new Date(),
            });
          } catch (error) {
            set({
              loading: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to refresh portfolio data",
            });
          }
        },

        // Computed selectors
        getActivePortfolio: () => {
          const state = get();
          return (
            state.portfolios.find((p) => p.id === state.activePortfolioId) ||
            null
          );
        },

        getTotalPortfolioValue: () => {
          const state = get();
          return state.portfolios.reduce(
            (total, portfolio) => total + portfolio.performance.totalValue,
            0
          );
        },

        getPortfolioById: (id: string) => {
          const state = get();
          return state.portfolios.find((p) => p.id === id) || null;
        },
      }),
      {
        name: "portfolio-store",
        partialize: (state) => ({
          portfolios: state.portfolios,
          activePortfolioId: state.activePortfolioId,
        }),
      }
    ),
    { name: "portfolio-store" }
  )
);
