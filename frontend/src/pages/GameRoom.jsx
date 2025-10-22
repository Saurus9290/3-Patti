import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useReadContract } from 'wagmi';
import { 
  Copy, 
  Users, 
  Play, 
  Eye, 
  DollarSign, 
  X, 
  ArrowLeft,
  Trophy,
  Coins,
  Loader2
} from 'lucide-react';
import Button from '@/components/Button';
import PlayerSeat from '@/components/PlayerSeat';
import { formatChips } from '@/lib/utils';
import { useContracts } from '@/hooks/useContracts';
import GameABI from '@/contracts/TeenPattiGame.json';
import addresses from '@/contracts/addresses.json';

export default function GameRoom({ socket }) {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { startGame: blockchainStartGame, declareWinner, closeRoom } = useContracts();
  
  const [playerId, setPlayerId] = useState(location.state?.playerId || '');
  const [playerName, setPlayerName] = useState(location.state?.playerName || '');
  const [blockchainRoomId] = useState(location.state?.blockchainRoomId || roomId);
  const [gameState, setGameState] = useState(null);
  const [myCards, setMyCards] = useState([]);
  const [showCards, setShowCards] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const [message, setMessage] = useState('');
  const [showBetInput, setShowBetInput] = useState(false);
  const [startingGame, setStartingGame] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState(null);

  // Use wagmi's useReadContract to fetch room details reactively
  const { data: blockchainRoomDetails, refetch: refetchRoomDetails } = useReadContract({
    address: addresses.baseSepolia?.TeenPattiGame,
    abi: GameABI.abi,
    functionName: 'getRoomDetails',
    args: blockchainRoomId ? [blockchainRoomId] : undefined,
    query: {
      enabled: !!blockchainRoomId,
      refetchInterval: 10000, // Auto-refetch every 10 seconds
    },
  });

  // Log room details when they update
  useEffect(() => {
    if (blockchainRoomDetails) {
      console.log('✅ Room details updated:', {
        creator: blockchainRoomDetails[0],
        buyIn: blockchainRoomDetails[1]?.toString(),
        pot: blockchainRoomDetails[2]?.toString(),
        maxPlayers: blockchainRoomDetails[3]?.toString(),
        currentPlayers: blockchainRoomDetails[4]?.toString(),
        state: blockchainRoomDetails[5]?.toString(),
        winner: blockchainRoomDetails[6],
      });
    }
  }, [blockchainRoomDetails]);

  useEffect(() => {
    if (!socket || !playerId) {
      navigate('/');
      return;
    }

    // Listen for game state updates
    socket.on('playerJoined', async ({ gameState: newGameState }) => {
      setGameState(newGameState);
      setMessage('A player joined the room');
      setTimeout(() => setMessage(''), 3000);
      // Refresh blockchain data immediately
      if (refetchRoomDetails) refetchRoomDetails();
    });

    socket.on('gameStarted', async ({ gameState: newGameState }) => {
      setGameState(newGameState);
      setMessage('Game started! Place your bets.');
      setTimeout(() => setMessage(''), 3000);
      // Refresh blockchain data immediately
      if (refetchRoomDetails) refetchRoomDetails();
    });

    socket.on('yourCards', ({ cards }) => {
      setMyCards(cards);
    });

    socket.on('playerSawCards', ({ gameState: newGameState }) => {
      setGameState(newGameState);
    });

    socket.on('actionPerformed', ({ playerId: actionPlayerId, action, amount, gameState: newGameState }) => {
      setGameState(newGameState);
      const player = newGameState.players.find(p => p.id === actionPlayerId);
      if (player) {
        if (action === 'fold' || action === 'pack') {
          setMessage(`${player.name} folded`);
        } else if (action === 'bet' || action === 'chaal') {
          setMessage(`${player.name} bet ${formatChips(amount)}`);
        }
        setTimeout(() => setMessage(''), 3000);
      }
    });

    socket.on('turnChanged', ({ currentPlayerId, currentPlayerName }) => {
      if (currentPlayerId === playerId) {
        setMessage("It's your turn!");
      } else {
        setMessage(`${currentPlayerName}'s turn`);
      }
      setTimeout(() => setMessage(''), 3000);
    });

    socket.on('gameEnded', async ({ winner, pot, allCards, reason }) => {
      if (allCards) {
        // Show all cards at the end
        setShowCards(true);
      }
      
      setGameEnded(true);
      
      if (winner) {
        setWinnerInfo({ name: winner.name, pot, reason });
        setMessage(`${winner.name} wins ${formatChips(pot)} chips! ${reason || ''}`);
        
        // Declare winner on blockchain and close room
        if (blockchainRoomId && winner.id) {
          await handleDeclareWinner(winner.id);
          await handleCloseRoom();
        }
      } else {
        setMessage(`Game ended. ${reason || ''}`);
      }
    });

    socket.on('playerLeft', ({ playerName: leftPlayerName, gameState: newGameState }) => {
      setGameState(newGameState);
      setMessage(`${leftPlayerName} left the game`);
      setTimeout(() => setMessage(''), 3000);
    });

    socket.on('error', ({ message: errorMessage }) => {
      setMessage(`Error: ${errorMessage}`);
      setTimeout(() => setMessage(''), 3000);
    });

    return () => {
      socket.off('playerJoined');
      socket.off('gameStarted');
      socket.off('yourCards');
      socket.off('playerSawCards');
      socket.off('actionPerformed');
      socket.off('turnChanged');
      socket.off('gameEnded');
      socket.off('playerLeft');
      socket.off('error');
    };
  }, [socket, playerId, navigate]);

  const handleCopyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setMessage('Room ID copied to clipboard!');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleStartGame = async () => {
    if (!blockchainRoomId) {
      setMessage('No blockchain room ID found');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setStartingGame(true);
    setMessage('Starting game on blockchain...');

    try {
      // Call blockchain startGame function
      const result = await blockchainStartGame(blockchainRoomId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to start game on blockchain');
      }

      console.log('Game started on blockchain:', result.txHash);
      setMessage('Game started successfully! ✅');
      
      // Refresh blockchain data immediately after transaction
      await refetchRoomDetails();
      
      // Notify backend via Socket.IO (optional)
      if (socket) {
        socket.emit('startGame', { 
          blockchainRoomId,
          txHash: result.txHash 
        });
      }

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error starting game:', err);
      
      let errorMessage = err.message;
      if (err.message.includes('user rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (err.message.includes('Not authorized')) {
        errorMessage = 'Only the room creator can start the game';
      } else if (err.message.includes('Game already started')) {
        errorMessage = 'Game has already started';
      } else if (err.message.includes('Need at least 2 players')) {
        errorMessage = 'Need at least 2 players to start';
      }
      
      setMessage(`Error: ${errorMessage}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setStartingGame(false);
    }
  };

  const handleDeclareWinner = async (winnerAddress) => {
    if (!blockchainRoomId) {
      console.error('No blockchain room ID found');
      return;
    }

    try {
      setMessage('Declaring winner on blockchain...');
      console.log('Declaring winner:', { blockchainRoomId, winnerAddress });

      const result = await declareWinner(blockchainRoomId, winnerAddress);

      if (!result.success) {
        throw new Error(result.error || 'Failed to declare winner on blockchain');
      }

      console.log('Winner declared on blockchain:', result.txHash);
      setMessage('Winner declared successfully! 🏆');
      
      // Refresh blockchain data immediately after transaction
      await refetchRoomDetails();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error declaring winner:', err);
      
      let errorMessage = err.message;
      if (err.message.includes('user rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (err.message.includes('Only backend')) {
        errorMessage = 'Only the backend can declare winner';
      } else if (err.message.includes('Game not active')) {
        errorMessage = 'Game is not active';
      }
      
      setMessage(`Error declaring winner: ${errorMessage}`);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleCloseRoom = async () => {
    if (!blockchainRoomId) {
      console.error('No blockchain room ID found');
      return;
    }

    try {
      setMessage('Closing room on blockchain...');
      console.log('Closing room:', blockchainRoomId);

      const result = await closeRoom(blockchainRoomId);

      if (!result.success) {
        throw new Error(result.error || 'Failed to close room on blockchain');
      }

      console.log('Room closed on blockchain:', result.txHash);
      setMessage('Room closed successfully! ✅');
      
      // Refresh blockchain data immediately after transaction
      await refetchRoomDetails();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error closing room:', err);
      
      let errorMessage = err.message;
      if (err.message.includes('user rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (err.message.includes('Only backend')) {
        errorMessage = 'Only the backend can close room';
      }
      
      setMessage(`Error closing room: ${errorMessage}`);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleSeeCards = () => {
    setShowCards(true);
    socket.emit('seeCards');
  };

  const handleFold = () => {
    socket.emit('playerAction', { action: 'pack' });
    setShowBetInput(false);
  };

  const handleBet = (amount = betAmount) => {
    if (amount <= 0) {
      setMessage('Please enter a valid bet amount');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    socket.emit('playerAction', { action: 'chaal', amount });
    setShowBetInput(false);
    setBetAmount(0);
  };

  const handleLeaveRoom = () => {
    socket.emit('leaveRoom');
    navigate('/');
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-8 text-center">
            <Users className="w-16 h-16 text-white mx-auto mb-4 animate-pulse" />
            <h2 className="text-white text-2xl font-bold mb-4">Waiting for Players</h2>
            <div className="bg-white/10 rounded-lg p-4 mb-4">
              <p className="text-gray-300 text-sm mb-2">Room ID</p>
              <div className="flex items-center justify-center gap-2">
                <p className="text-white text-sm font-bold tracking-wider">{roomId}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyRoomId}
                  className="text-white hover:bg-white/10"
                >
                  <Copy className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <p className="text-gray-300 mb-4">
              Share this Room ID with your friends to join the game
            </p>
            <Button
              onClick={handleLeaveRoom}
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Leave Room
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentPlayer = gameState?.players.find(p => p.id === playerId);
  const isMyTurn = gameState?.currentPlayerIndex !== undefined && 
                   gameState?.players[gameState.currentPlayerIndex]?.id === playerId;
  
  // Use blockchain data to determine if game can start
  // Parse blockchain room details (array from contract)
  const roomCreator = blockchainRoomDetails?.[0];
  const roomBuyIn = blockchainRoomDetails?.[1];
  const roomPot = blockchainRoomDetails?.[2];
  const roomMaxPlayers = blockchainRoomDetails?.[3];
  const roomCurrentPlayers = blockchainRoomDetails?.[4];
  const roomState = blockchainRoomDetails?.[5];
  const roomWinner = blockchainRoomDetails?.[6];

  // Only room creator can start the game
  const isCreator = roomCreator && 
                    playerId && 
                    roomCreator.toLowerCase() === playerId.toLowerCase();
  
  const canStartGame = blockchainRoomDetails && 
                       isCreator && // Must be the room creator
                       Number(roomState) === 0 && // 0 = WAITING
                       Number(roomCurrentPlayers) >= 2;

  // Calculate min and max bet
  const minBet = currentPlayer?.isBlind ? gameState.currentBet : gameState.currentBet * 2;
  const maxBet = currentPlayer?.isBlind ? gameState.currentBet * 2 : gameState.currentBet * 4;

  // Position players around the table
  const getPlayerPosition = (index, total) => {
    if (total <= 2) {
      return index === 0 ? 'bottom' : 'top';
    }
    if (total === 3) {
      return ['bottom', 'top', 'top'][index];
    }
    if (total === 4) {
      return ['bottom', 'left', 'top', 'right'][index];
    }
    if (total === 5) {
      return ['bottom', 'left', 'top', 'top', 'right'][index];
    }
    return ['bottom', 'left', 'left', 'top', 'right', 'right'][index];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-900 p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="flex items-center justify-between bg-black/30 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLeaveRoom}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white text-xl font-bold">Room: {roomId.slice(0, 10)}...</h2>
                {isCreator && (
                  <span className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/50 rounded text-yellow-400 text-xs font-semibold">
                    👑 Creator
                  </span>
                )}
              </div>
              {blockchainRoomDetails ? (
                <div className="text-gray-300 text-sm space-y-1">
                  <p className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {Number(roomCurrentPlayers)} / {Number(roomMaxPlayers)} players on-chain
                  </p>
                  <p className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    Buy-in: {roomBuyIn ? (Number(roomBuyIn) / 1e18).toFixed(0) : '0'} TPT
                  </p>
                  <p className={`text-xs ${Number(roomState) === 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {Number(roomState) === 0 ? '⏳ Waiting' : 
                     Number(roomState) === 1 ? '🎮 Active' : 
                     Number(roomState) === 2 ? '✅ Finished' : '❌ Cancelled'}
                  </p>
                </div>
              ) : (
                <p className="text-gray-300 text-sm">Loading blockchain data...</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyRoomId}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Room ID
            </Button>
            
            {canStartGame && (
              <Button
                onClick={handleStartGame}
                disabled={startingGame}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                {startingGame ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Game
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div className="max-w-7xl mx-auto mb-4">
          <div className="bg-blue-600 text-white px-4 py-3 rounded-lg text-center font-semibold">
            {message}
          </div>
        </div>
      )}

      {/* Game Table */}
      <div className="max-w-7xl mx-auto">
        <div className="game-table relative rounded-3xl p-8 min-h-[600px] flex items-center justify-center">
          {/* Pot in Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-full p-6 shadow-2xl border-4 border-yellow-400">
              <div className="text-center">
                <Coins className="w-8 h-8 text-white mx-auto mb-2" />
                <div className="text-white text-sm font-semibold">POT</div>
                <div className="text-yellow-200 text-2xl font-bold">
                  {formatChips(gameState.pot)}
                </div>
              </div>
            </div>
          </div>

          {/* Players */}
          <div className="absolute inset-0 p-8">
            {gameState.players.map((player, index) => {
              const position = getPlayerPosition(index, gameState.players.length);
              const isCurrentTurn = gameState.gameStarted && 
                                   gameState.currentPlayerIndex === index;
              const isDealer = gameState.dealerIndex === index;
              
              let positionClass = '';
              if (position === 'bottom') {
                positionClass = 'bottom-4 left-1/2 -translate-x-1/2';
              } else if (position === 'top') {
                positionClass = index === 1 && gameState.players.length === 3 
                  ? 'top-4 left-1/4 -translate-x-1/2'
                  : index === 2 && gameState.players.length === 3
                  ? 'top-4 right-1/4 translate-x-1/2'
                  : index === 2 && gameState.players.length === 5
                  ? 'top-4 left-1/3 -translate-x-1/2'
                  : index === 3 && gameState.players.length === 5
                  ? 'top-4 right-1/3 translate-x-1/2'
                  : 'top-4 left-1/2 -translate-x-1/2';
              } else if (position === 'left') {
                positionClass = index === 1 && gameState.players.length === 5
                  ? 'left-4 top-1/3 -translate-y-1/2'
                  : index === 1 && gameState.players.length === 6
                  ? 'left-4 top-1/4 -translate-y-1/2'
                  : index === 2 && gameState.players.length === 6
                  ? 'left-4 top-2/3 -translate-y-1/2'
                  : 'left-4 top-1/2 -translate-y-1/2';
              } else if (position === 'right') {
                positionClass = index === 4 && gameState.players.length === 5
                  ? 'right-4 top-1/3 -translate-y-1/2'
                  : index === 4 && gameState.players.length === 6
                  ? 'right-4 top-1/4 -translate-y-1/2'
                  : index === 5 && gameState.players.length === 6
                  ? 'right-4 top-2/3 -translate-y-1/2'
                  : 'right-4 top-1/2 -translate-y-1/2';
              }

              const playerCards = player.id === playerId ? myCards : [];
              const shouldShowCards = player.id === playerId && showCards;

              return (
                <div key={player.id} className={`absolute ${positionClass}`}>
                  <PlayerSeat
                    player={player}
                    isCurrentPlayer={isCurrentTurn}
                    isDealer={isDealer}
                    cards={playerCards}
                    showCards={shouldShowCards}
                    position={position}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Panel */}
      {gameState.gameStarted && currentPlayer && !currentPlayer.isFolded && (
        <div className="max-w-7xl mx-auto mt-4">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-white">
                <div className="text-sm text-gray-300">Your Chips</div>
                <div className="text-2xl font-bold text-yellow-400">
                  {formatChips(currentPlayer.chips)}
                </div>
              </div>
              <div className="text-white">
                <div className="text-sm text-gray-300">Current Bet</div>
                <div className="text-2xl font-bold text-blue-400">
                  {formatChips(gameState.currentBet)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* See Cards Button */}
              {!showCards && currentPlayer.isBlind && (
                <Button
                  onClick={handleSeeCards}
                  variant="outline"
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  See Cards
                </Button>
              )}

              {/* Fold Button */}
              {isMyTurn && (
                <Button
                  onClick={handleFold}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Fold / Pack
                </Button>
              )}

              {/* Bet Button */}
              {isMyTurn && (
                <>
                  {!showBetInput ? (
                    <Button
                      onClick={() => setShowBetInput(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      Chaal / Bet
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="number"
                        min={minBet}
                        max={maxBet}
                        value={betAmount}
                        onChange={(e) => setBetAmount(Number(e.target.value))}
                        placeholder={`Min: ${minBet}, Max: ${maxBet}`}
                        className="flex-1 px-4 py-2 rounded-md bg-white/10 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <Button
                        onClick={handleBet}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Bet
                      </Button>
                      <Button
                        onClick={() => {
                          setShowBetInput(false);
                          setBetAmount(0);
                        }}
                        variant="ghost"
                        className="text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </>
              )}

              {/* Quick Bet Buttons */}
              {isMyTurn && !showBetInput && (
                <>
                  <Button
                    onClick={() => handleBet(minBet)}
                    variant="outline"
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  >
                    Min ({formatChips(minBet)})
                  </Button>
                  <Button
                    onClick={() => handleBet(Math.floor((minBet + maxBet) / 2))}
                    variant="outline"
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  >
                    Mid ({formatChips(Math.floor((minBet + maxBet) / 2))})
                  </Button>
                  <Button
                    onClick={() => handleBet(maxBet)}
                    variant="outline"
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20"
                  >
                    Max ({formatChips(maxBet)})
                  </Button>
                </>
              )}
            </div>

            {!isMyTurn && (
              <div className="text-center text-gray-300 mt-4">
                Waiting for other players...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Waiting for Game to Start */}
      {!gameState.gameStarted && (
        <div className="max-w-7xl mx-auto mt-4">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 text-center">
            <Users className="w-12 h-12 text-white mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">
              Waiting for players...
            </h3>
            <p className="text-gray-300">
              {gameState.players.length >= 2 
                ? 'Ready to start! Click "Start Game" to begin.'
                : 'Need at least 2 players to start the game.'}
            </p>
          </div>
        </div>
      )}

      {/* Game Ended Overlay */}
      {gameEnded && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border-4 border-yellow-400">
            <div className="text-center">
              <Trophy className="w-24 h-24 text-white mx-auto mb-4 animate-bounce" />
              
              {winnerInfo ? (
                <>
                  <h2 className="text-white text-4xl font-bold mb-2">
                    🎉 Winner! 🎉
                  </h2>
                  <p className="text-yellow-100 text-2xl font-semibold mb-2">
                    {winnerInfo.name}
                  </p>
                  <div className="bg-white/20 rounded-lg p-4 mb-4">
                    <p className="text-white text-sm mb-1">Prize Money</p>
                    <p className="text-yellow-200 text-3xl font-bold">
                      {formatChips(winnerInfo.pot)}
                    </p>
                  </div>
                  {winnerInfo.reason && (
                    <p className="text-yellow-100 text-sm mb-4">
                      {winnerInfo.reason}
                    </p>
                  )}
                  <div className="bg-red-600/80 rounded-lg p-3 mb-4">
                    <p className="text-white text-xl font-bold">
                      🎮 GAME OVER 🎮
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-white text-3xl font-bold mb-4">
                    Game Ended
                  </h2>
                  <p className="text-yellow-100 mb-4">
                    The game has concluded.
                  </p>
                  <div className="bg-red-600/80 rounded-lg p-3 mb-4">
                    <p className="text-white text-xl font-bold">
                      🎮 GAME OVER 🎮
                    </p>
                  </div>
                </>
              )}

              <Button
                onClick={() => navigate('/')}
                size="lg"
                className="w-full bg-white text-orange-600 hover:bg-gray-100 font-bold text-lg"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
