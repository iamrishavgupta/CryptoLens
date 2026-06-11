// Popular cryptocurrencies
export const POPULAR_COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "binancecoin", symbol: "BNB", name: "BNB" },
  { id: "solana", symbol: "SOL", name: "Solana" },
  { id: "cardano", symbol: "ADA", name: "Cardano" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink" },
  { id: "polygon", symbol: "MATIC", name: "Polygon" },
  { id: "litecoin", symbol: "LTC", name: "Litecoin" },
] as const;

// Trending categories
export const COIN_CATEGORIES = [
  "decentralized-finance-defi",
  "smart-contract-platform",
  "layer-1",
  "layer-2",
  "memes",
  "gaming",
  "nft",
  "metaverse",
  "artificial-intelligence",
  "web3",
] as const;

// Market data intervals
export const CHART_INTERVALS = [
  { label: "1H", value: "1" },
  { label: "24H", value: "24" },
  { label: "7D", value: "7" },
  { label: "30D", value: "30" },
  { label: "90D", value: "90" },
  { label: "1Y", value: "365" },
  { label: "MAX", value: "max" },
] as const;

// Supported currencies
export const SUPPORTED_CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "BTC", symbol: "₿", name: "Bitcoin" },
  { code: "ETH", symbol: "Ξ", name: "Ethereum" },
] as const;
