import { http, createConfig } from 'wagmi';
import { mainnet, sepolia, polygon, polygonAmoy, base, baseSepolia } from 'wagmi/chains';
import { walletConnect, injected, coinbaseWallet } from '@wagmi/connectors';

// Get your free project ID from https://cloud.walletconnect.com
const projectId = '40c9999c51393274c9045358cb4e31cb';

export const config = createConfig({
  chains: [baseSepolia, base, mainnet, sepolia, polygon, polygonAmoy],
  connectors: [
    injected(), // MetaMask, Phantom, etc.
    // Only include WalletConnect if we have a valid project ID
    ...(projectId && projectId !== 'demo-project-id' 
      ? [walletConnect({ projectId, showQrModal: true })] 
      : []
    ),
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
