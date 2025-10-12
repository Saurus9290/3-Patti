import React, { useState, useEffect } from 'react';
import { Coins, RefreshCw } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet.jsx';
import { useContracts } from '@/hooks/useContracts';
import { formatChips } from '@/lib/utils';
import { ethers } from 'ethers';

const NETWORK_NAMES = {
  84532: 'Base Sepolia',
  8453: 'Base Mainnet',
};

export default function TokenBalance() {
  const { account, isConnected, chainId } = useWallet();
  const { getTokenBalance } = useContracts();
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && account && getTokenBalance) {
      fetchBalance();
    }
  }, [isConnected, account, getTokenBalance]);

  async function fetchBalance() {
    if (!account || !getTokenBalance) return;
    
    setLoading(true);
    try {
      const bal = await getTokenBalance(account);
      if (bal !== undefined && bal !== null) {
        setBalance(ethers.formatEther(bal));
      }
    } catch (error) {
      console.error('Error fetching token balance:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!isConnected) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-lg px-4 py-3 border border-yellow-600/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-400" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-300">TPT Balance</span>
              {chainId && (
                <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                  {NETWORK_NAMES[chainId] || `Chain ${chainId}`}
                </span>
              )}
            </div>
            <div className="text-lg font-bold text-yellow-400">
              {formatChips(Math.floor(parseFloat(balance)))}
            </div>
          </div>
        </div>
        <button
          onClick={fetchBalance}
          disabled={loading}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-gray-300 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
}
