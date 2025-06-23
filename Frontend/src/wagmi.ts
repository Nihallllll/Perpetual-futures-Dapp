import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, polygon, optimism } from 'wagmi/chains';
import { http } from 'wagmi';

export const config = getDefaultConfig({
  appName: 'My RainbowKit dApp',
  projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID as string,
  chains: [mainnet, sepolia, polygon, optimism],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
  },
  ssr: false, // Set to true if using server-side rendering
});