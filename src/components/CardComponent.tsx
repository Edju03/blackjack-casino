import React from 'react';
import { Card, Rank, Suit } from '../models/Card';

interface CardComponentProps {
  card?: Card;
  faceDown?: boolean;
  animate?: boolean;
}

export const CardComponent: React.FC<CardComponentProps> = ({ card, faceDown = false, animate = true }) => {
  const getSuitSymbol = (suit: Suit): string => {
    const symbols: Record<Suit, string> = {
      [Suit.Spades]: '♠',
      [Suit.Hearts]: '♥',
      [Suit.Diamonds]: '♦',
      [Suit.Clubs]: '♣'
    };
    return symbols[suit];
  };

  const getRankDisplay = (rank: Rank): string => {
    return rank;
  };

  if (faceDown || !card) {
    return (
      <div className={`card card-back ${animate ? 'animate-deal' : ''}`}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-2xl text-blue-200 opacity-20">♠</div>
        </div>
      </div>
    );
  }

  const isRed = card.color === 'red';

  return (
    <div className={`card ${animate ? 'animate-deal' : ''}`}>
      <div className="absolute top-1 left-1 text-center">
        <div className={`text-lg font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
          {getRankDisplay(card.rank)}
        </div>
        <div className={`text-2xl -mt-1 ${isRed ? 'text-red-600' : 'text-black'}`}>
          {getSuitSymbol(card.suit)}
        </div>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`text-5xl ${isRed ? 'text-red-600' : 'text-black'}`}>
          {getSuitSymbol(card.suit)}
        </div>
      </div>
      
      <div className="absolute bottom-1 right-1 text-center rotate-180">
        <div className={`text-lg font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
          {getRankDisplay(card.rank)}
        </div>
        <div className={`text-2xl -mt-1 ${isRed ? 'text-red-600' : 'text-black'}`}>
          {getSuitSymbol(card.suit)}
        </div>
      </div>
    </div>
  );
};