import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserPreferences {
  theme: "light" | "dark" | "system";
  currency: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    priceAlerts: boolean;
    newsUpdates: boolean;
    portfolioUpdates: boolean;
  };
  privacy: {
    showPortfolio: boolean;
    showHoldings: boolean;
    analyticsOptIn: boolean;
  };
  display: {
    showTestnetData: boolean;
    compactMode: boolean;
    autoRefresh: boolean;
    refreshInterval: number; // seconds
  };
}

interface UserStore {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
}

const defaultPreferences: UserPreferences = {
  theme: "system",
  currency: "USD",
  language: "en",
  notifications: {
    email: true,
    push: true,
    priceAlerts: true,
    newsUpdates: false,
    portfolioUpdates: true,
  },
  privacy: {
    showPortfolio: false,
    showHoldings: false,
    analyticsOptIn: true,
  },
  display: {
    showTestnetData: false,
    compactMode: false,
    autoRefresh: true,
    refreshInterval: 30,
  },
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      updatePreferences: (updates) =>
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
        })),
      resetPreferences: () => set({ preferences: defaultPreferences }),
    }),
    {
      name: "user-preferences",
    }
  )
);
