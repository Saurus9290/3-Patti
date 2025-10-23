import React, { useState } from 'react';
import { ethers } from 'ethers';
import { X, Loader2, Users, Coins } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import RoomIdDisplay from './RoomIdDisplay';
import { useContracts } from '@/hooks/useContracts';
import { useWallet } from '@/hooks/useWallet';
import { encodeRoomId } from '@/utils/roomIdUtils';

export default function CreateRoomModal({ isOpen, onClose, onSuccess, socket }) {
  const { account } = useWallet();
  const { createRoom, approveTokens, gameContract, tokenContract, contractAddresses } = useContracts();

  const [buyIn, setBuyIn] = useState('1000');
  const [maxPlayers, setMaxPlayers] = useState('4');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState('input'); // input, approving, creating

  if (!isOpen) return null;

  async function handleCreate() {
    if (!account) {
      setError('Please connect your wallet');
      return;
    }

    if (!gameContract || !tokenContract || !contractAddresses) {
      setError('Contracts not initialized. Please wait a moment and try again.');
      return;
    }

    if (!buyIn || parseFloat(buyIn) <= 0) {
      setError('Please enter a valid buy-in amount');
      return;
    }

    if (!maxPlayers || parseInt(maxPlayers) < 2 || parseInt(maxPlayers) > 6) {
      setError('Max players must be between 2 and 6');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const buyInAmount = ethers.parseEther(buyIn);
      const players = parseInt(maxPlayers);

      // Step 1: Approve tokens
      setStep('approving');
      console.log('Approving tokens...');

      const approveResult = await approveTokens(
        contractAddresses.TeenPattiGame,
        buyInAmount
      );

      if (!approveResult.success) {
        throw new Error(approveResult.error || 'Failed to approve tokens');
      }

      console.log('Tokens approved:', approveResult.txHash);

      // Step 2: Create room on blockchain
      setStep('creating');
      setMessage('Tokens approved! Creating room...');
      console.log('Creating room on blockchain...');

      const createResult = await createRoom(buyInAmount, players);

      if (!createResult.success) {
        throw new Error(createResult.error || 'Failed to create room');
      }

      console.log('Room created on blockchain:', createResult);

      // Extract roomId from blockchain event
      const blockchainRoomId = createResult.roomId;
      const shortRoomId = encodeRoomId(blockchainRoomId);

      console.log(`✅ Room created! Code: ${shortRoomId}`);

      // Step 3: Notify backend via Socket.IO
      if (socket) {
        socket.emit('createRoomWithBlockchain', {
          blockchainRoomId: blockchainRoomId.toString(),
          buyIn: buyIn,
          maxPlayers: players,
          creator: account,
          txHash: createResult.txHash
        });

        // Wait for backend confirmation
        socket.once('roomCreated', ({ roomId, shortRoomId: backendShortId }) => {
          setLoading(false);
          setStep('input');
          onSuccess(roomId, blockchainRoomId, shortRoomId);
        });

        socket.once('error', ({ message }) => {
          setLoading(false);
          setStep('input');
          setError(message);
        });
      } else {
        // No socket, just return success
        setLoading(false);
        setStep('input');
        onSuccess(null, blockchainRoomId);
      }

    } catch (err) {
      console.error('Error creating room:', err);
      setLoading(false);
      setStep('input');

      let errorMessage = err.message;
      if (err.message.includes('user rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (err.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient token balance';
      }

      setError(errorMessage);
    }
  }

  function handleClose() {
    if (!loading) {
      setStep('input');
      setError('');
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Create Game Room</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Buy-in Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Buy-in Amount (TPT)
            </label>
            <Input
              type="number"
              value={buyIn}
              onChange={(e) => setBuyIn(e.target.value)}
              placeholder="1000"
              min="1"
              disabled={loading}
              className="bg-gray-800 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-400">
              Each player must have this amount to join
            </p>
          </div>

          {/* Max Players */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Maximum Players
            </label>
            <select
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2">2 Players</option>
              <option value="3">3 Players</option>
              <option value="4">4 Players</option>
              <option value="5">5 Players</option>
              <option value="6">6 Players</option>
            </select>
          </div>

          {/* Transaction Info */}
          {loading && (
            <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                <div className="text-sm text-blue-200">
                  {step === 'approving' && 'Approving tokens...'}
                  {step === 'creating' && 'Creating room on blockchain...'}
                </div>
              </div>
              <p className="text-xs text-blue-300 mt-2">
                Please confirm the transaction in your wallet
              </p>
            </div>
          )}

          {/* Success Message */}
          {message && !error && (
            <div className="bg-green-600/20 border border-green-600/50 rounded-lg p-3 text-green-200 text-sm">
              {message}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-3 text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-yellow-600/10 border border-yellow-600/30 rounded-lg p-4">
            <p className="text-sm text-yellow-200">
              <strong>Note:</strong> Creating a room requires 2 transactions:
            </p>
            <ol className="text-xs text-yellow-300 mt-2 ml-4 list-decimal space-y-1">
              <li>Approve tokens for the game contract</li>
              <li>Create room and lock your buy-in</li>
            </ol>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              disabled={loading}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={loading || !gameContract || !tokenContract}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : !gameContract || !tokenContract ? (
                'Initializing...'
              ) : (
                'Create Room'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
