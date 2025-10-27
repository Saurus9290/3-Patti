import { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import Button from './Button';

const SUPPORTED_NETWORKS = {
  84532: {
    name: 'Base Sepolia',
    chainId: '0x14a34', // 84532 in hex
    rpcUrls: ['https://sepolia.base.org'],
    blockExplorerUrls: ['https://sepolia.basescan.org'],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  }
};

const TARGET_CHAIN_ID = 84532; // Base Sepolia

export function NetworkSwitcher() {
  const { chainId, switchNetwork } = useWallet();
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    if (chainId && chainId !== TARGET_CHAIN_ID) {
      setIsWrongNetwork(true);
    } else {
      setIsWrongNetwork(false);
    }
  }, [chainId]);

  async function handleSwitchNetwork() {
    setIsSwitching(true);
    try {
      const success = await switchNetwork(TARGET_CHAIN_ID);
      
      if (!success) {
        // If switch failed, try to add the network
        await addNetwork();
      }
    } catch (error) {
      console.error('Error switching network:', error);
      
      // If the network doesn't exist, add it
      if (error.code === 4902) {
        await addNetwork();
      }
    } finally {
      setIsSwitching(false);
    }
  }

  async function addNetwork() {
    try {
      const network = SUPPORTED_NETWORKS[TARGET_CHAIN_ID];
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: network.chainId,
          chainName: network.name,
          rpcUrls: network.rpcUrls,
          blockExplorerUrls: network.blockExplorerUrls,
          nativeCurrency: network.nativeCurrency
        }]
      });
    } catch (error) {
      console.error('Error adding network:', error);
    }
  }

  if (!isWrongNetwork) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black p-4 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-semibold">Wrong Network</p>
            <p className="text-sm">Please switch to Base Sepolia network to use this app</p>
          </div>
        </div>
        <Button
          onClick={handleSwitchNetwork}
          disabled={isSwitching}
          variant="outline"
          className="bg-black text-yellow-500 hover:bg-gray-800"
        >
          {isSwitching ? 'Switching...' : 'Switch Network'}
        </Button>
      </div>
    </div>
  );
}
