import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, polygon, polygonAmoy, baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Teen Patti',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Get from https://cloud.walletconnect.com
  chains: [mainnet, sepolia, polygon, polygonAmoy,baseSepolia],
  ssr: false,
});
