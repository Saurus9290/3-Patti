import { useState, useEffect, createContext, useContext } from 'react';
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
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Check if wallet is already connected
  useEffect(() => {
    checkConnection();
    
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // Update balance when account changes
  useEffect(() => {
    if (account && provider) {
      updateBalance();
    }
  }, [account, provider]);

  async function checkConnection() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const network = await provider.getNetwork();
          
          setProvider(provider);
          setSigner(signer);
          setAccount(address);
          setChainId(Number(network.chainId));
        }
      } catch (err) {
        console.error('Error checking connection:', err);
      }
    }
  }

  async function connectWallet() {
    if (!window.ethereum) {
      setError('Please install MetaMask or another Web3 wallet');
      return false;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setChainId(Number(network.chainId));
      
      console.log('Wallet connected:', address);
      return true;
      
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError(err.message);
      return false;
    } finally {
      setIsConnecting(false);
    }
  }

  async function disconnectWallet() {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    setBalance('0');
    setError(null);
  }

  async function switchNetwork(targetChainId) {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      return true;
    } catch (err) {
      // Chain not added to MetaMask
      if (err.code === 4902) {
        console.error('Network not added to wallet');
      }
      setError(err.message);
      return false;
    }
  }

  async function updateBalance() {
    if (!account || !provider) return;

    try {
      const balance = await provider.getBalance(account);
      setBalance(ethers.formatEther(balance));
    } catch (err) {
      console.error('Error updating balance:', err);
    }
  }

  function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAccount(accounts[0]);
    }
  }

  function handleChainChanged(chainId) {
    window.location.reload();
  }

  const value = {
    account,
    provider,
    signer,
    chainId,
    balance,
    isConnecting,
    error,
    isConnected: !!account,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    updateBalance,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
