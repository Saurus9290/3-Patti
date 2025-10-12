import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Users, Trophy, Sparkles } from 'lucide-react';
import Button from '@/components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import WalletConnect from '@/components/WalletConnect';
import TokenBalance from '@/components/TokenBalance';
import BuyTokensModal from '@/components/BuyTokensModal';
import CreateRoomModal from '@/components/CreateRoomModal';
import JoinRoomModal from '@/components/JoinRoomModal';
import { useWallet } from '@/hooks/useWallet.jsx';

export default function Home({ socket }) {
  const navigate = useNavigate();
  const { isConnected, account } = useWallet();
  const [error, setError] = useState('');
  const [showBuyTokens, setShowBuyTokens] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showJoinRoom, setShowJoinRoom] = useState(false);

  function handleCreateRoomSuccess(socketRoomId, blockchainRoomId) {
    console.log('Room created:', { socketRoomId, blockchainRoomId });
    setShowCreateRoom(false);
    
    if (blockchainRoomId) {
      navigate(`/room/${blockchainRoomId}`, { 
        state: { 
          playerId: account, 
          playerName: account.slice(0, 6),
          blockchainRoomId 
        } 
      });
    }
  }

  function handleJoinRoomSuccess(socketRoomId, blockchainRoomId) {
    console.log('Room joined:', { socketRoomId, blockchainRoomId });
    setShowJoinRoom(false);
    
    if (blockchainRoomId) {
      navigate(`/room/${blockchainRoomId}`, { 
        state: { 
          playerId: account, 
          playerName: account.slice(0, 6),
          blockchainRoomId 
        } 
      });
    }
  }

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
            {/* Wallet Connection Required */}
            {!isConnected ? (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded text-center">
                <p className="font-semibold">Connect your wallet to play</p>
                <p className="text-sm mt-1">You need to connect your wallet to create or join a game room</p>
              </div>
            ) : (
              <>
                {/* Error Message */}
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                {/* Create Room */}
                <div className="space-y-3">
                  <Button
                    onClick={() => setShowCreateRoom(true)}
                    disabled={!isConnected}
                    className="w-full h-12 text-lg"
                    size="lg"
                  >
                    <Gamepad2 className="w-5 h-5 mr-2" />
                    Create New Room (On-Chain)
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Creates a room on the blockchain with token buy-in
                  </p>
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
                  <Button
                    onClick={() => setShowJoinRoom(true)}
                    disabled={!isConnected}
                    variant="secondary"
                    className="w-full h-12 text-lg"
                    size="lg"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Join Room (On-Chain)
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    Join an existing blockchain room with your tokens
                  </p>
                </div>
              </>
            )}

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

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={showCreateRoom}
        onClose={() => setShowCreateRoom(false)}
        onSuccess={handleCreateRoomSuccess}
        socket={socket}
      />

      {/* Join Room Modal */}
      <JoinRoomModal
        isOpen={showJoinRoom}
        onClose={() => setShowJoinRoom(false)}
        onSuccess={handleJoinRoomSuccess}
        socket={socket}
      />
    </div>
  );
}
