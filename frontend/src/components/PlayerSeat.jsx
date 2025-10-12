import React from 'react';
import { User, Crown, Eye, EyeOff } from 'lucide-react';
import { cn, formatChips } from '@/lib/utils';
import PlayingCard from './PlayingCard';

export default function PlayerSeat({ 
  player, 
  isCurrentPlayer, 
  isDealer, 
  cards = [],
  showCards = false,
  position = 'bottom',
  className 
}) {
  const positionClasses = {
    bottom: 'flex-col',
    top: 'flex-col-reverse',
    left: 'flex-row',
    right: 'flex-row-reverse',
  };

  return (
    <div className={cn(
      'player-seat relative flex items-center gap-3',
      positionClasses[position],
      isCurrentPlayer && 'current-turn',
      player.isActive && 'active',
      className
    )}>
      {/* Player Info */}
      <div className={cn(
        'relative flex items-center gap-2 p-3 rounded-xl border-2',
        player.isFolded ? 'bg-gray-800/50 border-gray-600' : 'bg-gray-900/80 border-gray-700',
        isCurrentPlayer && 'border-blue-500'
      )}>
        {/* Dealer Badge */}
        {isDealer && (
          <div className="absolute -top-3 -right-3 bg-yellow-500 rounded-full p-1">
            <Crown className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Avatar */}
        <div className={cn(
          'w-12 h-12 rounded-full flex items-center justify-center',
          player.isFolded ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-500 to-purple-600'
        )}>
          <User className="w-6 h-6 text-white" />
        </div>

        <div>
        {/* Player Name */}
        <div className="text-center">
          <div className={cn(
            'font-semibold text-sm',
            player.isFolded ? 'text-gray-500' : 'text-white'
          )}>
            {player.name}
          </div>
          
          <div>
          {/* Chips */}
          <div className="flex items-center gap-1 text-xs text-yellow-400">
            <span className="text-yellow-500">●</span>
            {formatChips(player.chips)}
          </div>
        </div>

          {/* Current Bet */}
          {player.currentBet > 0 && (
            <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full shadow-lg border-2 border-white z-10">
              {formatChips(player.currentBet)}
            </div>
          )}

          {/* Blind/Seen Indicator */}
          <div className="flex items-center gap-1 text-xs">
            {player.isBlind ? (
              <>
                <EyeOff className="w-3 h-3 text-gray-400" />
                <span className="text-gray-400">Blind</span>
              </>
            ) : (
              <>
                <Eye className="w-3 h-3 text-green-400" />
                <span className="text-green-400">Seen</span>
              </>
            )}
          </div>
        </div>

        {/* Folded Indicator */}
        {player.isFolded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
            <span className="text-red-500 font-bold text-sm">FOLDED</span>
          </div>
        )}
      </div>

      {/* Cards */}
      {cards.length > 0 && (
        <div className="flex gap-1">
          {cards.map((card, index) => (
            <PlayingCard
              key={index}
              rank={showCards ? card.rank : null}
              suit={showCards ? card.suit : null}
              faceDown={!showCards}
              className="transform hover:scale-110 transition-transform"
            />
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
