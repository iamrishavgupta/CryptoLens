import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePortfolioStore } from "@/store/portfolioStore";
import { Portfolio, PortfolioHolding, Transaction } from "@/types/portfolio";

export function usePortfolio() {
  const queryClient = useQueryClient();
  const {
    portfolios,
    activePortfolioId,
    isLoading,
    error,
    setActivePortfolio,
    addPortfolio,
    updatePortfolio,
    deletePortfolio,
    addHolding,

    addTransaction,
  } = usePortfolioStore();

  // Get active portfolio
  const activePortfolio = portfolios.find((p) => p.id === activePortfolioId);

  // Fetch portfolios from API
  const { isLoading: isLoadingPortfolios } = useQuery({
    queryKey: ["portfolios"],
    queryFn: async () => {
      const response = await fetch("/api/portfolio");
      if (!response.ok) throw new Error("Failed to fetch portfolios");
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create portfolio mutation
  const createPortfolioMutation = useMutation({
    mutationFn: async (
      portfolio: Omit<Portfolio, "id" | "createdAt" | "updatedAt">
    ) => {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(portfolio),
      });
      if (!response.ok) throw new Error("Failed to create portfolio");
      return response.json();
    },
    onSuccess: (newPortfolio) => {
      addPortfolio(newPortfolio);
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
    },
  });

  // Update portfolio mutation
  const updatePortfolioMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Portfolio>;
    }) => {
      const response = await fetch(`/api/portfolio/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error("Failed to update portfolio");
      return response.json();
    },
    onSuccess: (updatedPortfolio) => {
      updatePortfolio(updatedPortfolio.id, updatedPortfolio);
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
    },
  });

  // Delete portfolio mutation
  const deletePortfolioMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/portfolio/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete portfolio");
    },
    onSuccess: (_, id) => {
      deletePortfolio(id);
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
    },
  });

  // Add holding mutation
  const addHoldingMutation = useMutation({
    mutationFn: async ({
      portfolioId,
      holding,
    }: {
      portfolioId: string;
      holding: PortfolioHolding;
    }) => {
      const response = await fetch(`/api/portfolio/${portfolioId}/holdings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(holding),
      });
      if (!response.ok) throw new Error("Failed to add holding");
      return response.json();
    },
    onSuccess: ({ portfolioId, holding }) => {
      addHolding(portfolioId, holding);
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
    },
  });

  // Add transaction mutation
  const addTransactionMutation = useMutation({
    mutationFn: async (transaction: Omit<Transaction, "id" | "createdAt">) => {
      const response = await fetch("/api/portfolio/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });
      if (!response.ok) throw new Error("Failed to add transaction");
      return response.json();
    },
    onSuccess: (newTransaction) => {
      addTransaction(newTransaction);
      queryClient.invalidateQueries({ queryKey: ["portfolios"] });
    },
  });

  // Calculate portfolio metrics
  const calculatePortfolioMetrics = (portfolio: Portfolio) => {
    let totalValue = 0;
    let totalCost = 0;
    let totalPnL = 0;

    portfolio.holdings.forEach((holding) => {
      const currentValue = holding.amount * holding.currentPrice;
      const costBasis = holding.amount * holding.averagePrice;

      totalValue += currentValue;
      totalCost += costBasis;
      totalPnL += currentValue - costBasis;
    });

    const roi = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

    return {
      totalValue,
      totalCost,
      totalPnL,
      roi,
      allocations: portfolio.holdings.map((holding) => ({
        coinId: holding.coinId,
        symbol: holding.symbol,
        percentage:
          totalValue > 0
            ? ((holding.amount * holding.currentPrice) / totalValue) * 100
            : 0,
        value: holding.amount * holding.currentPrice,
      })),
    };
  };

  return {
    // Data
    portfolios,
    activePortfolio,
    activePortfolioId,

    // Loading states
    isLoading: isLoading || isLoadingPortfolios,
    error,

    // Actions
    setActivePortfolio,
    createPortfolio: createPortfolioMutation.mutateAsync,
    updatePortfolio: updatePortfolioMutation.mutateAsync,
    deletePortfolio: deletePortfolioMutation.mutateAsync,
    addHolding: addHoldingMutation.mutateAsync,
    addTransaction: addTransactionMutation.mutateAsync,

    // Utilities
    calculatePortfolioMetrics,

    // Mutation states
    isCreating: createPortfolioMutation.isPending,
    isUpdating: updatePortfolioMutation.isPending,
    isDeleting: deletePortfolioMutation.isPending,
    isAddingHolding: addHoldingMutation.isPending,
    isAddingTransaction: addTransactionMutation.isPending,
  };
}
