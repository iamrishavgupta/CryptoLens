# CryptoLens — Cryptocurrency Analytics Platform

A full-stack crypto tracking app built with Next.js, Firebase, and real-time market data.

**Live:** [crypto-lens-yobf.vercel.app](https://crypto-lens-yobf.vercel.app)

---

## Stack

- **Next.js 16** — App Router, API Routes
- **TypeScript** — Type-safe codebase
- **Tailwind CSS + Radix UI** — UI components
- **Firebase** — Auth + Firestore database
- **CoinGecko API** — Live crypto prices
- **DefiLlama API** — DeFi protocol data
- **WalletConnect** — Web3 wallet integration
- **Zustand** — State management
- **TanStack Query** — Data fetching

---

## Features

- Live cryptocurrency prices, market cap, volume
- Trending coins and market overview
- Cryptocurrency exchanges with live data
- DeFi protocols with real TVL from DefiLlama
- NFT collections browser
- Crypto education hub with real free resources
- User auth (Email/Password + Google)
- Portfolio tracker — add holdings, track P&L in real time
- Watchlists — create lists, add coins, toggle alerts
- Price alerts dashboard
- Dark/Light theme

---

## Local Setup

```bash
git clone <repo-url>
cd crypto-lens
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_COINGECKO_API_KEY=
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
npm run dev
```

---

## Deployment

Deployed on Vercel. Set all env vars in Vercel dashboard and add your domain to Firebase Authentication → Authorized Domains.

---

## API Sources

| Data | Source |
|---|---|
| Crypto prices | CoinGecko |
| DeFi TVL | DefiLlama |
| NFT collections | CoinGecko |
| Fear & Greed | Alternative.me |
| Exchanges | CoinGecko |
