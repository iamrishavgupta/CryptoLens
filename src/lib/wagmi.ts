import { createConfig, http } from "wagmi";
import { arbitrum, base, bsc, mainnet, optimism, polygon } from "wagmi/chains";
import { getDefaultConfig } from "connectkit";

export const SUPPORTED_CHAINS = [
  mainnet,
  polygon,
  arbitrum,
  optimism,
  base,
  bsc,
] as const;

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error(
    "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is required for wallet connections."
  );
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const appName = process.env.NEXT_PUBLIC_APP_NAME || "CryptoLens";

export const wagmiConfig = createConfig(
  getDefaultConfig({
    walletConnectProjectId: projectId,
    appName,
    appDescription:
      "Cryptocurrency analytics, portfolio tracking, and Web3 wallet tools",
    appUrl,
    appIcon: `${appUrl}/favicon.ico`,
    chains: SUPPORTED_CHAINS,
    transports: {
      [mainnet.id]: http(),
      [polygon.id]: http(),
      [arbitrum.id]: http(),
      [optimism.id]: http(),
      [base.id]: http(),
      [bsc.id]: http(),
    },
  })
);
