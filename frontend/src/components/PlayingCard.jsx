import React from 'react';
import { cn, getCardSymbol, getCardColor } from '@/lib/utils';

export default function PlayingCard({ rank, suit, faceDown = false, className }) {
  if (faceDown) {
    return (
      <div className={cn(
        'card relative w-16 h-24 rounded-lg border-2 border-gray-700 bg-gradient-to-br from-blue-900 to-blue-700 shadow-lg',
        'flex items-center justify-center',
        className
      )}>
        <div className="text-white text-base font-bold opacity-30">
          ♠♥♣♦
        </div>
      </div>
    );
  }

  const symbol = getCardSymbol(suit);
  const colorClass = getCardColor(suit);

  return (
    <div className={cn(
      'card relative w-16 h-24 rounded-lg border-2 border-gray-300 bg-white shadow-lg',
      'flex flex-col items-center justify-between p-2',
      className
    )}>
      <div className={cn('text-lg font-bold', colorClass)}>
        {rank}
      </div>
      <div className={cn('text-3xl', colorClass)}>
        {symbol}
      </div>
      <div className={cn('text-lg font-bold', colorClass)}>
        {rank}
      </div>
    </div>
  );
}
