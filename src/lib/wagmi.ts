import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

const morphTestnet = defineChain({
  id: 2810,
  name: "Morph Holesky",
  nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
  rpcUrls: {
    default: { http: ["https://rpc-quicknode-holesky.morphl2.io"] },
  },
  blockExplorers: {
    default: { name: "Morph Explorer", url: "https://explorer-holesky.morphl2.io" },
  },
  testnet: true,
});

export const wagmiConfig = getDefaultConfig({
  appName: "CreatorVault",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "",
  chains: [morphTestnet],
  ssr: true,
});
