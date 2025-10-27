import React, { useState } from 'react';
import { X, Coins, Loader2 } from 'lucide-react';
import { useContracts } from '@/hooks/useContracts';
import { ethers } from 'ethers';
import Button from './Button';
import Input from './Input';

export default function BuyTokensModal({ isOpen, onClose, onSuccess }) {
  const { buyTokens, calculateTokensForWei } = useContracts();
  const [ethAmount, setEthAmount] = useState('');
  const [expectedTokens, setExpectedTokens] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const quickAmounts = [
    { eth: '0.0000001', label: '0.0000001 ETH' },
    { eth: '0.000001', label: '0.000001 ETH' },
    { eth: '0.00001', label: '0.00001 ETH' },
    { eth: '0.0001', label: '0.0001 ETH' },
  ];

  async function handleAmountChange(amount) {
    setEthAmount(amount);
    setError('');

    if (!amount || parseFloat(amount) <= 0) {
      setExpectedTokens('0');
      return;
    }

    try {
      const weiAmount = ethers.parseEther(amount);
      const tokens = await calculateTokensForWei(weiAmount);
      setExpectedTokens(ethers.formatEther(tokens));
    } catch (err) {
      console.error('Error calculating tokens:', err);
      setExpectedTokens('0');
    }
  }

  async function handleBuy() {
    if (!ethAmount || parseFloat(ethAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const weiAmount = ethers.parseEther(ethAmount);
      console.log(weiAmount);
      const result = await buyTokens(weiAmount);

      if (result.success) {
        onSuccess && onSuccess();
        onClose();
      } else {
        setError(result.error || 'Transaction failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to buy tokens');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-600/20 p-2 rounded-lg">
              <Coins className="w-6 h-6 text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Buy TPT Tokens</h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white transition-colors h-8 w-8"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Amount (ETH)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={ethAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="Enter ETH amount"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {quickAmounts.map((amount) => (
              <Button
                key={amount.eth}
                onClick={() => handleAmountChange(amount.eth)}
                variant="outline"
                size="sm"
                className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 p-6"
              >
                {amount.label}
              </Button>
            ))}
          </div>

          {/* Expected Tokens */}
          <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-4">
            <div className="text-sm text-gray-300 mb-1">You will receive</div>
            <div className="text-2xl font-bold text-yellow-400">
              {parseFloat(expectedTokens).toLocaleString()} TPT
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Rate: 0.00001 ETH = 10,000 TPT (minus 1% fee)
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-3 text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBuy}
              className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              disabled={loading || !ethAmount || parseFloat(ethAmount) <= 0}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Buying...
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4 mr-2" />
                  Buy Tokens
                </>
              )}
            </Button>
          </div>

          {/* Info */}
          <div className="text-xs text-gray-400 mt-1">
            Make sure you have enough ETH for gas fees
          </div>
        </div>
      </div>
    </div>
  );
}
