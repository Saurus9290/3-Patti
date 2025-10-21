import { useState, useEffect, createContext, useContext } from 'react';
import { useAccount, useBalance, useWalletClient, usePublicClient, useSwitchChain } from 'wagmi';
import { ethers } from 'ethers';

const WalletContext = createContext();

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}

export function WalletProvider({ children }) {
  const { address, isConnected, chain } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { switchChain } = useSwitchChain();
  const { data: balanceData } = useBalance({
    address: address,
  });

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  // Create ethers provider and signer from wagmi clients
  useEffect(() => {
    if (walletClient && publicClient) {
      // Create ethers provider from viem public client
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethersProvider);

      // Get signer
      ethersProvider.getSigner().then(setSigner).catch(console.error);
    } else {
      setProvider(null);
      setSigner(null);
    }
  }, [walletClient, publicClient, address]);

  const switchNetwork = async (targetChainId) => {
    try {
      await switchChain({ chainId: targetChainId });
      return true;
    } catch (err) {
      console.error('Error switching network:', err);
      return false;
    }
  };

  const value = {
    account: address,
    provider,
    signer,
    chainId: chain?.id,
    balance: balanceData ? ethers.formatEther(balanceData.value) : '0',
    isConnecting: false,
    error: null,
    isConnected,
    connectWallet: () => {}, // Handled by RainbowKit
    disconnectWallet: () => {}, // Handled by RainbowKit
    switchNetwork,
    updateBalance: () => {}, // Handled by wagmi
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
