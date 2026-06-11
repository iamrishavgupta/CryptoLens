// API Configuration
export const API_CONFIG = {
  COINGECKO: {
    BASE_URL: "https://api.coingecko.com/api/v3",
    RATE_LIMIT: 50, // requests per minute
  },
  BINANCE: {
    WS_URL: "wss://stream.binance.com:9443/ws",
    API_URL: "https://api.binance.com/api/v3",
  },
  DEFILLAMA: {
    BASE_URL: "https://api.llama.fi",
  },
  FEAR_GREED: {
    BASE_URL: "https://api.alternative.me/fng",
  },
} as const;

// Rate limiting
export const RATE_LIMITS = {
  COINGECKO_FREE: 50, // per minute
  COINGECKO_PRO: 500, // per minute
  BINANCE: 1200, // per minute
} as const;

// Cache durations (in seconds)
export const CACHE_DURATIONS = {
  MARKET_DATA: 30,
  COIN_DETAILS: 300,
  NEWS: 600,
  GLOBAL_STATS: 60,
} as const;
