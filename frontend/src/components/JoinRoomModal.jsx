import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { X, Loader2, Users, Coins, Info } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import { useContracts } from '@/hooks/useContracts';
import { useWallet } from '@/hooks/useWallet';

export default function JoinRoomModal({ isOpen, onClose, onSuccess, socket, roomId: initialRoomId }) {
  const { account } = useWallet();
  const { joinRoom, approveTokens, getRoomDetails, contractAddresses } = useContracts();
  
  const [blockchainRoomId, setBlockchainRoomId] = useState('');
  const [roomDetails, setRoomDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('input'); // input, approving, joining

  useEffect(() => {
    if (initialRoomId) {
      setBlockchainRoomId(initialRoomId);
    }
  }, [initialRoomId]);

  useEffect(() => {
    if (blockchainRoomId && blockchainRoomId.startsWith('0x')) {
      fetchRoomDetails();
    }
  }, [blockchainRoomId]);

  if (!isOpen) return null;

  async function fetchRoomDetails() {
    setLoadingDetails(true);
    setError('');
    
    try {
      const details = await getRoomDetails(blockchainRoomId);
      
      if (!details) {
        setError('Room not found on blockchain');
        setRoomDetails(null);
        return;
      }

      console.log(details)

      if (Number(details.state) !== 0) { // 0 = WAITING
        setError('Room is not accepting players');
        setRoomDetails(null);
        return;
      }

      setRoomDetails(details);
    } catch (err) {
      console.error('Error fetching room details:', err);
      setError('Failed to fetch room details');
      setRoomDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  }

  async function handleJoin() {
    if (!account) {
      setError('Please connect your wallet');
      return;
    }

    if (!blockchainRoomId || !blockchainRoomId.startsWith('0x')) {
      setError('Please enter a valid blockchain room ID');
      return;
    }

    if (!roomDetails) {
      setError('Please load room details first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const buyInAmount = roomDetails.buyIn;

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

      // Step 2: Join room on blockchain
      setStep('joining');
      console.log('Joining room on blockchain...');
      
      const joinResult = await joinRoom(blockchainRoomId);

      if (!joinResult.success) {
        throw new Error(joinResult.error || 'Failed to join room');
      }

      console.log('Joined room on blockchain:', joinResult);
      
      // Step 3: Notify backend via Socket.IO
      if (socket) {
        socket.emit('joinRoomWithBlockchain', {
          blockchainRoomId: blockchainRoomId,
          player: account,
          txHash: joinResult.txHash
        });

        // Wait for backend confirmation
        socket.once('roomJoined', ({ roomId }) => {
          setLoading(false);
          setStep('input');
          onSuccess(roomId, blockchainRoomId);
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
      console.error('Error joining room:', err);
      setLoading(false);
      setStep('input');
      
      let errorMessage = err.message;
      if (err.message.includes('user rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (err.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient token balance';
      } else if (err.message.includes('Already joined')) {
        errorMessage = 'You have already joined this room';
      } else if (err.message.includes('Room is full')) {
        errorMessage = 'Room is full';
      }
      
      setError(errorMessage);
    }
  }

  function handleClose() {
    if (!loading) {
      setStep('input');
      setError('');
      setRoomDetails(null);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Join Game Room</h2>
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
          {/* Room ID Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Blockchain Room ID
            </label>
            <Input
              type="text"
              value={blockchainRoomId}
              onChange={(e) => setBlockchainRoomId(e.target.value)}
              placeholder="0x..."
              disabled={loading || loadingDetails}
              className="bg-gray-800 border-gray-600 text-white font-mono text-sm"
            />
            <Button
              onClick={fetchRoomDetails}
              disabled={loading || loadingDetails || !blockchainRoomId}
              size="sm"
              variant="outline"
              className="w-full border-gray-600 text-gray-300"
            >
              {loadingDetails ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Info className="w-4 h-4 mr-2" />
                  Load Room Details
                </>
              )}
            </Button>
          </div>

          {/* Room Details */}
          {roomDetails && (
            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Buy-in:</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  {ethers.formatEther(roomDetails.buyIn)} TPT
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Players:</span>
                <span className="text-white font-semibold flex items-center gap-1">
                  <Users className="w-4 h-4 text-blue-400" />
                  {roomDetails.currentPlayers.toString()} / {roomDetails.maxPlayers.toString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Pot:</span>
                <span className="text-white font-semibold">
                  {ethers.formatEther(roomDetails.pot)} TPT
                </span>
              </div>
            </div>
          )}

          {/* Transaction Info */}
          {loading && (
            <div className="bg-blue-600/20 border border-blue-600/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                <div className="text-sm text-blue-200">
                  {step === 'approving' && 'Approving tokens...'}
                  {step === 'joining' && 'Joining room on blockchain...'}
                </div>
              </div>
              <p className="text-xs text-blue-300 mt-2">
                Please confirm the transaction in your wallet
              </p>
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
              <strong>Note:</strong> Joining a room requires 2 transactions:
            </p>
            <ol className="text-xs text-yellow-300 mt-2 ml-4 list-decimal space-y-1">
              <li>Approve tokens for the game contract</li>
              <li>Join room and lock your buy-in</li>
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
              onClick={handleJoin}
              disabled={loading || !roomDetails}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Join Room'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
