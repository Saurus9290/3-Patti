import dotenv from 'dotenv';
dotenv.config();

export const blockchainConfig = {
  // Network configuration
  network: process.env.BLOCKCHAIN_NETWORK || 'localhost',
  rpcUrl: process.env.RPC_URL || 'http://127.0.0.1:8545',
  chainId: parseInt(process.env.CHAIN_ID || '1337'),
  
  // Contract addresses (update after deployment)
  tokenAddress: process.env.TOKEN_CONTRACT_ADDRESS || '',
  gameAddress: process.env.GAME_CONTRACT_ADDRESS || '',
  
  // Backend wallet (for automated transactions)
  privateKey: process.env.BACKEND_PRIVATE_KEY || '',
  
  // Gas settings
  gasLimit: 500000,
  maxFeePerGas: null, // Auto-calculate
  maxPriorityFeePerGas: null, // Auto-calculate
  
  // Transaction settings
  confirmations: 1, // Number of confirmations to wait
  timeout: 300000, // 5 minutes
  
  // Monitoring
  eventPollingInterval: 5000, // 5 seconds
  
  // Feature flags
  enabled: process.env.BLOCKCHAIN_ENABLED === 'true',
  autoStartEventListeners: true,
};

// Network-specific configurations
export const networkConfigs = {
  baseSepolia: {
    name: 'Base Sepolia',
    rpcUrl: 'https://sepolia.base.org',
    chainId: 84532,
    currency: 'ETH',
    explorer: 'https://sepolia.basescan.org',
  },
  base: {
    name: 'Base Mainnet',
    rpcUrl: 'https://mainnet.base.org',
    chainId: 8453,
    currency: 'ETH',
    explorer: 'https://basescan.org',
  },
};

export function getNetworkConfig(network = blockchainConfig.network) {
  return networkConfigs[network] || networkConfigs.localhost;
}
