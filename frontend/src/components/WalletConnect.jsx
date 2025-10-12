import React from 'react';
import { Wallet, LogOut, AlertCircle } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet.jsx';
import Button from './Button';

export default function WalletConnect() {
  const { 
    account, 
    balance, 
    isConnecting, 
    error, 
    isConnected, 
    connectWallet, 
    disconnectWallet 
  } = useWallet();

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
          <div className="text-xs text-gray-300">Balance</div>
          <div className="text-white font-semibold">
            {parseFloat(balance).toFixed(6)} ETH
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
          <div className="text-xs text-gray-300">Wallet</div>
          <div className="text-white font-semibold font-mono">
            {formatAddress(account)}
          </div>
        </div>
        <Button
          onClick={disconnectWallet}
          variant="outline"
          size="sm"
          className="bg-red-600/20 text-white border-red-600/50 hover:bg-red-600/30"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {error && (
        <div className="flex items-center gap-2 bg-red-600/20 text-red-200 px-4 py-2 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    </div>
  );
}
