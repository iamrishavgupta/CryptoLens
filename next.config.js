/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { hostname: "assets.coingecko.com" },
      { hostname: "coin-images.coingecko.com" },
      { hostname: "static.coinpaprika.com" },
      { hostname: "s2.coinmarketcap.com" },
      { hostname: "cryptologos.cc" },
      { hostname: "firebasestorage.googleapis.com" },
      { hostname: "images.unsplash.com" },
    ],
    formats: ["image/webp", "image/avif"],
  },
  env: {
    NEXT_PUBLIC_COINGECKO_API_URL: "https://api.coingecko.com/api/v3",
    NEXT_PUBLIC_BINANCE_WS_URL: "wss://stream.binance.com:9443/ws",
    NEXT_PUBLIC_DEFILLAMA_API_URL: "https://api.llama.fi",
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

module.exports = nextConfig;
