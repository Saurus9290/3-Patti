import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from '@/hooks/useWallet.jsx';

export default function WalletConnect() {
  const { balance } = useWallet();

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
      <ConnectButton 
        chainStatus="icon"
        showBalance={false}
      />
    </div>
  );
}
