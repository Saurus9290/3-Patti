import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Wallet, LogOut, ChevronDown } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet.jsx';
import Button from './Button';

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { balance } = useWallet();
  const [showConnectors, setShowConnectors] = useState(false);

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        {balance && (
          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
            <div className="text-xs text-gray-300">Balance</div>
            <div className="text-white font-semibold">
              {parseFloat(balance).toFixed(6)} ETH
            </div>
          </div>
        )}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
          <div className="text-xs text-gray-300">Wallet</div>
          <div className="text-white font-semibold font-mono">
            {formatAddress(address)}
          </div>
        </div>
        <Button
          onClick={() => disconnect()}
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
    <div className="relative">
      <Button
        onClick={() => setShowConnectors(!showConnectors)}
        disabled={isPending}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {isPending ? 'Connecting...' : 'Connect Wallet'}
        <ChevronDown className="w-4 h-4 ml-2" />
      </Button>

      {showConnectors && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowConnectors(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
            <div className="p-2">
              <div className="text-xs text-gray-400 px-3 py-2">Select Wallet</div>
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => {
                    connect({ connector });
                    setShowConnectors(false);
                  }}
                  disabled={isPending}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-700 text-white transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  {connector.name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
