import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Users, Trophy, Sparkles } from 'lucide-react';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import WalletConnect from '@/components/WalletConnect';
import TokenBalance from '@/components/TokenBalance';
import BuyTokensModal from '@/components/BuyTokensModal';
import { useWallet } from '@/hooks/useWallet.jsx';

export default function Home({ socket }) {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBuyTokens, setShowBuyTokens] = useState(false);

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!socket) {
      setError('Not connected to server');
      return;
    }

    setLoading(true);
    setError('');

    socket.emit('createRoom', { playerName: playerName.trim() });

    socket.once('roomCreated', ({ roomId, playerId }) => {
      setLoading(false);
      navigate(`/room/${roomId}`, { state: { playerId, playerName: playerName.trim() } });
    });

    socket.once('error', ({ message }) => {
      setLoading(false);
      setError(message);
    });
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!roomId.trim()) {
      setError('Please enter room ID');
      return;
    }

    if (!socket) {
      setError('Not connected to server');
      return;
    }

    setLoading(true);
    setError('');

    socket.emit('joinRoom', { 
      roomId: roomId.trim().toUpperCase(), 
      playerName: playerName.trim() 
    });

    socket.once('roomJoined', ({ roomId, playerId }) => {
      setLoading(false);
      navigate(`/room/${roomId}`, { state: { playerId, playerName: playerName.trim() } });
    });

    socket.once('error', ({ message }) => {
      setLoading(false);
      setError(message);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Gamepad2 className="w-16 h-16 text-yellow-400" />
            <h1 className="text-6xl font-bold text-white">Teen Patti</h1>
          </div>
          <p className="text-xl text-gray-300">
            Play the classic Indian card game online with friends
          </p>
        </div>

        {/* Wallet Section */}
        <div className="mb-6 flex flex-col items-center gap-4">
          <WalletConnect />
          {isConnected && (
            <div className="flex items-center gap-3">
              <TokenBalance />
              <Button
                onClick={() => setShowBuyTokens(true)}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
              >
                Buy Tokens
              </Button>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h3 className="text-white font-semibold">Multiplayer</h3>
            <p className="text-gray-300 text-sm">Play with 2-6 players</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <h3 className="text-white font-semibold">Real-time</h3>
            <p className="text-gray-300 text-sm">Live game sync via WebSocket</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
            <Sparkles className="w-8 h-8 text-purple-400 mx-auto mb-2" />
            <h3 className="text-white font-semibold">Easy to Play</h3>
            <p className="text-gray-300 text-sm">Simple rules, exciting gameplay</p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Enter your name and create a new room or join an existing one
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Player Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Name</label>
              <Input
                type="text"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Create Room */}
            <div className="space-y-3">
              <Button
                onClick={handleCreateRoom}
                disabled={loading || !socket}
                className="w-full h-12 text-lg"
                size="lg"
              >
                <Gamepad2 className="w-5 h-5 mr-2" />
                Create New Room
              </Button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Join Room */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Room ID</label>
              <Input
                type="text"
                placeholder="Enter room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                maxLength={6}
                disabled={loading}
              />
              <Button
                onClick={handleJoinRoom}
                disabled={loading || !socket}
                variant="secondary"
                className="w-full h-12 text-lg"
                size="lg"
              >
                <Users className="w-5 h-5 mr-2" />
                Join Room
              </Button>
            </div>

            {/* Connection Status */}
            <div className="text-center text-sm">
              {socket ? (
                <span className="text-green-600 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                  Connected to server
                </span>
              ) : (
                <span className="text-red-600 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  Connecting to server...
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* How to Play */}
        <div className="mt-8 text-center">
          <details className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-left">
            <summary className="text-white font-semibold cursor-pointer">
              How to Play Teen Patti
            </summary>
            <div className="mt-4 text-gray-300 space-y-2 text-sm">
              <p><strong>Objective:</strong> Have the best 3-card hand or be the last player standing.</p>
              <p><strong>Hand Rankings (High to Low):</strong></p>
              <ul className="list-disc list-inside ml-4">
                <li>Trio/Trail - Three cards of same rank (AAA is highest)</li>
                <li>Pure Sequence - Three consecutive cards of same suit</li>
                <li>Sequence - Three consecutive cards of different suits</li>
                <li>Color/Flush - Three cards of same suit</li>
                <li>Pair - Two cards of same rank</li>
                <li>High Card - Highest single card wins</li>
              </ul>
              <p><strong>Gameplay:</strong> Players can play blind (without seeing cards) or seen (after viewing). Blind players bet half the amount of seen players. Continue betting until only one player remains or players show their cards.</p>
            </div>
          </details>
        </div>
      </div>

      {/* Buy Tokens Modal */}
      <BuyTokensModal
        isOpen={showBuyTokens}
        onClose={() => setShowBuyTokens(false)}
        onSuccess={() => {
          setShowBuyTokens(false);
          // Token balance will auto-refresh
        }}
      />
    </div>
  );
}
