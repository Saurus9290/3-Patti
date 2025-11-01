import { Coins, RefreshCw } from 'lucide-react';
import { useAccount, useReadContract } from 'wagmi';
import { formatChips } from '@/lib/utils';
import { ethers } from 'ethers';
import TokenABI from '@/contracts/TeenPattiToken.json';
import addresses from '@/contracts/addresses.json';
import Button from './Button';

const NETWORK_NAMES = {
  84532: 'Base Sepolia',
  8453: 'Base Mainnet',
};

export default function TokenBalance() {
  const { address: account, isConnected, chainId } = useAccount();

  const { data: balance, refetch, isLoading } = useReadContract({
    address: addresses.baseSepolia?.TeenPattiToken,
    abi: TokenABI.abi,
    functionName: 'balanceOf',
    args: account ? [account] : undefined,
    query: {
      enabled: !!account && isConnected,
      refetchInterval: 5000,
    },
  });

  if (!isConnected) {
    return null;
  }

  const formattedBalance = balance ? ethers.formatEther(balance) : '0';

  return (
    <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-lg px-2 py-1 border border-yellow-600/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-400" />
          <div>
            <div className="text-sm font-bold text-yellow-400">
              {formatChips(Math.floor(parseFloat(formattedBalance)))} TPT
            </div>
          </div>
        </div>
        <Button
          onClick={() => refetch()}
          disabled={isLoading}
          variant="ghost"
          size="icon"
          className="p-2 hover:bg-white/10 rounded-lg transition-colors h-8 w-8"
        >
          <RefreshCw className={`w-4 h-4 text-gray-300 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </div>
  );
}
