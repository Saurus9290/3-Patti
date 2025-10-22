import { http, createConfig } from 'wagmi';
import { mainnet, sepolia, polygon, polygonAmoy, base, baseSepolia } from 'wagmi/chains';
import { walletConnect, injected, coinbaseWallet } from '@wagmi/connectors';

const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID'; // Get from https://cloud.walletconnect.com

export const config = createConfig({
  chains: [baseSepolia, base, mainnet, sepolia, polygon, polygonAmoy],
  connectors: [
    injected(), // MetaMask, Phantom, etc.
    walletConnect({ projectId }),
    coinbaseWallet({ appName: 'Teen Patti' }),
  ],
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [polygonAmoy.id]: http(),
  },
});
