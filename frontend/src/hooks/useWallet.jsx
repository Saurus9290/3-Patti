import { useState, useEffect, createContext, useContext } from 'react';
import { useAccount, useBalance, useWalletClient, useSwitchChain } from 'wagmi';
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
  const { address, isConnected, chain, connector } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { switchChain } = useSwitchChain();
  const { data: balanceData } = useBalance({
    address: address,
  });

  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  // Create ethers provider and signer from wagmi wallet client
  useEffect(() => {
    async function setupProviderAndSigner() {
      if (walletClient && address && connector) {
        try {
          // Get the provider from the connector
          const connectorProvider = await connector.getProvider();
          
          if (!connectorProvider) {
            console.error('No provider available from connector');
            return;
          }

          // Create ethers provider from the connector's provider
          const ethersProvider = new ethers.BrowserProvider(connectorProvider);
          setProvider(ethersProvider);

          // Get signer with the specific address
          const ethersSigner = await ethersProvider.getSigner(address);
          setSigner(ethersSigner);
          
          console.log('✅ Provider and signer set up for address:', address, 'via connector:', connector.name);
        } catch (error) {
          console.error('Error setting up provider/signer:', error);
          setProvider(null);
          setSigner(null);
        }
      } else {
        setProvider(null);
        setSigner(null);
      }
    }

    setupProviderAndSigner();
  }, [walletClient, address, chain, connector]);

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
    connectWallet: () => {}, // Handled by wagmi useConnect
    disconnectWallet: () => {}, // Handled by wagmi useDisconnect
    switchNetwork,
    updateBalance: () => {}, // Handled by wagmi useBalance
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
