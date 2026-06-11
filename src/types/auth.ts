import { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified?: boolean;
  avatar?: string;
  preferences: UserPreferences;
  subscription?: UserSubscription;
  createdAt: Date | Timestamp;
  lastLoginAt?: Date | Timestamp;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  currency: string;
  language: string;
  notifications: NotificationSettings;
  privacy: UserPrivacySettings;
  display: UserDisplaySettings;
  defaultPortfolio?: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  priceAlerts: boolean;
  portfolioUpdates: boolean;
  newsUpdates: boolean;
  marketUpdates: boolean;
}

export interface UserPrivacySettings {
  showPortfolio: boolean;
  showHoldings: boolean;
  analyticsOptIn: boolean;
}

export interface UserDisplaySettings {
  showTestnetData: boolean;
  compactMode: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // seconds
}

export interface UserSubscription {
  plan: "free" | "pro" | "enterprise";
  status: "active" | "inactive" | "cancelled" | "past_due";
  currentPeriodStart?: Timestamp;
  currentPeriodEnd?: Timestamp;
  cancelAtPeriodEnd?: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface UserSession {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export interface Web3AuthState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
}
