// API Configuration
export const API_CONFIG = {
  COINGECKO: {
    BASE_URL:
      process.env.NEXT_PUBLIC_COINGECKO_API_URL ||
      "https://api.coingecko.com/api/v3",
    API_KEY: process.env.NEXT_PUBLIC_COINGECKO_API_KEY,
    RATE_LIMIT: {
      REQUESTS_PER_MINUTE: 30, // Free tier limit
      REQUESTS_PER_HOUR: 1000,
    },
  },
  BINANCE: {
    WS_URL:
      process.env.NEXT_PUBLIC_BINANCE_WS_URL ||
      "wss://stream.binance.com:9443/ws",
    REST_URL: "https://api.binance.com/api/v3",
  },
  DEFILLAMA: {
    BASE_URL:
      process.env.NEXT_PUBLIC_DEFILLAMA_API_URL || "https://api.llama.fi",
  },
  FEAR_GREED: {
    BASE_URL: "https://api.alternative.me/fng",
  },
  NEWS: {
    BASE_URL: "https://newsapi.org/v2",
    API_KEY: process.env.NEXT_PUBLIC_NEWS_API_KEY,
  },
} as const;

// Application Configuration
export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || "CryptoPlatform",
  URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  DESCRIPTION:
    "Advanced cryptocurrency analytics and portfolio management platform",
  VERSION: "1.0.0",
  AUTHOR: "CryptoPlatform Team",
  SOCIAL: {
    TWITTER: "@cryptoplatform",
    GITHUB: "https://github.com/cryptoplatform",
    DISCORD: "https://discord.gg/cryptoplatform",
  },
} as const;

// Firebase Configuration
export const FIREBASE_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} as const;

// Web3 Configuration
export const WEB3_CONFIG = {
  WALLETCONNECT_PROJECT_ID:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
  SUPPORTED_CHAINS: [1, 56, 137, 43114, 250, 42161, 10] as const, // Ethereum, BSC, Polygon, Avalanche, Fantom, Arbitrum, Optimism
  DEFAULT_CHAIN: 1, // Ethereum
  RPC_URLS: {
    1: "https://eth-mainnet.g.alchemy.com/v2/",
    56: "https://bsc-dataseed.binance.org/",
    137: "https://polygon-rpc.com/",
    43114: "https://api.avax.network/ext/bc/C/rpc",
    250: "https://rpc.ftm.tools/",
    42161: "https://arb1.arbitrum.io/rpc",
    10: "https://mainnet.optimism.io",
  },
} as const;

// Navigation Items
export const NAVIGATION_ITEMS = [
  {
    label: "Dashboard",
    href: "/",
    icon: "LayoutDashboard",
  },
  {
    label: "Markets",
    href: "/markets",
    icon: "TrendingUp",
    children: [
      { label: "Overview", href: "/markets" },
      { label: "Cryptocurrencies", href: "/markets/cryptocurrencies" },
      { label: "Exchanges", href: "/markets/exchanges" },
      { label: "Trending", href: "/markets/trending" },
    ],
  },
  {
    label: "Portfolio",
    href: "/portfolio",
    icon: "PieChart",
    children: [
      { label: "Overview", href: "/portfolio" },
      { label: "Holdings", href: "/portfolio/holdings" },
      { label: "Transactions", href: "/portfolio/transactions" },
      { label: "Performance", href: "/portfolio/performance" },
    ],
  },
  {
    label: "DeFi",
    href: "/defi",
    icon: "Coins",
    children: [
      { label: "Protocols", href: "/defi/protocols" },
      { label: "Yield Farming", href: "/defi/yield" },
      { label: "Liquidity Pools", href: "/defi/pools" },
      { label: "Staking", href: "/defi/staking" },
    ],
  },
  {
    label: "NFT",
    href: "/nft",
    icon: "Image",
    children: [
      { label: "Collections", href: "/nft/collections" },
      { label: "Marketplace", href: "/nft/marketplace" },
      { label: "Portfolio", href: "/nft/portfolio" },
    ],
  },
  {
    label: "News",
    href: "/news",
    icon: "Newspaper",
  },
  {
    label: "Learn",
    href: "/learn",
    icon: "BookOpen",
    children: [
      { label: "Guides", href: "/learn/guides" },
      { label: "Tutorials", href: "/learn/tutorials" },
      { label: "Glossary", href: "/learn/glossary" },
    ],
  },
] as const;

// Supported Currencies
export const SUPPORTED_CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "🇰🇷" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷" },
] as const;

// Supported Languages
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "Korean", nativeName: "한국어", flag: "🇰🇷" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" },
] as const;

// Chart Configuration
export const CHART_TIMEFRAMES = [
  { label: "1H", value: "1h", days: 1, interval: "minutely" },
  { label: "24H", value: "24h", days: 1, interval: "hourly" },
  { label: "7D", value: "7d", days: 7, interval: "hourly" },
  { label: "30D", value: "30d", days: 30, interval: "daily" },
  { label: "90D", value: "90d", days: 90, interval: "daily" },
  { label: "1Y", value: "1y", days: 365, interval: "daily" },
  { label: "MAX", value: "max", days: "max", interval: "daily" },
] as const;

// Color Palette for Charts
export const CHART_COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#F97316", // Orange
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#EC4899", // Pink
  "#6B7280", // Gray
] as const;

// Default Settings
export const DEFAULT_SETTINGS = {
  theme: "system" as const,
  currency: "USD",
  language: "en",
  notifications: {
    email: true,
    push: true,
    priceAlerts: true,
    portfolioUpdates: true,
    newsUpdates: false,
    marketUpdates: false,
  },
  privacy: "private" as const,
  chartTimeframe: "7d" as const,
  tablePageSize: 50,
  refreshInterval: 30000, // 30 seconds
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  API_ERROR: "API error. Please try again later.",
  VALIDATION_ERROR: "Please check your input and try again.",
  AUTHENTICATION_ERROR: "Authentication failed. Please sign in again.",
  AUTHORIZATION_ERROR: "You do not have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  RATE_LIMIT: "Too many requests. Please wait and try again.",
  SERVER_ERROR: "Internal server error. Please try again later.",
  UNKNOWN_ERROR: "An unknown error occurred. Please try again.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SIGN_IN: "Successfully signed in!",
  SIGN_UP: "Account created successfully!",
  SIGN_OUT: "Successfully signed out!",
  PASSWORD_RESET: "Password reset email sent!",
  PROFILE_UPDATED: "Profile updated successfully!",
  PORTFOLIO_CREATED: "Portfolio created successfully!",
  PORTFOLIO_UPDATED: "Portfolio updated successfully!",
  PORTFOLIO_DELETED: "Portfolio deleted successfully!",
  TRANSACTION_ADDED: "Transaction added successfully!",
  TRANSACTION_UPDATED: "Transaction updated successfully!",
  TRANSACTION_DELETED: "Transaction deleted successfully!",
  WATCHLIST_CREATED: "Watchlist created successfully!",
  WATCHLIST_UPDATED: "Watchlist updated successfully!",
  WATCHLIST_DELETED: "Watchlist deleted successfully!",
  ALERT_CREATED: "Price alert created successfully!",
  ALERT_UPDATED: "Price alert updated successfully!",
  ALERT_DELETED: "Price alert deleted successfully!",
  COPIED_TO_CLIPBOARD: "Copied to clipboard!",
} as const;

// Loading States
export const LOADING_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: "crypto-platform-theme",
  CURRENCY: "crypto-platform-currency",
  LANGUAGE: "crypto-platform-language",
  SIDEBAR_COLLAPSED: "crypto-platform-sidebar-collapsed",
  RECENT_SEARCHES: "crypto-platform-recent-searches",
  FAVORITE_COINS: "crypto-platform-favorite-coins",
  CHART_SETTINGS: "crypto-platform-chart-settings",
  TABLE_SETTINGS: "crypto-platform-table-settings",
} as const;
