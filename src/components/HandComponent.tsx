import React from 'react';
import { Hand } from '../models/Hand';
import { CardComponent } from './CardComponent';

interface HandComponentProps {
  hand: Hand;
  isDealer?: boolean;
  hideFirstCard?: boolean;
  label?: string;
}

export const HandComponent: React.FC<HandComponentProps> = ({ 
  hand, 
  isDealer = false, 
  hideFirstCard = false,
  label
}) => {
  const cards = hand.getCards();
  const value = hideFirstCard ? null : hand.getValue();
  const isSoft = hand.isSoft();
  const status = hand.status;

  const getStatusColor = () => {
    switch (status) {
      case 'busted': return 'text-red-500';
      case 'blackjack': return 'text-yellow-400';
      case 'standing': return 'text-green-400';
      default: return 'text-white';
    }
  };

  const getStatusText = () => {
    if (hideFirstCard) return '?';
    if (status === 'busted') return `Bust (${value})`;
    if (status === 'blackjack') return 'Blackjack!';
    if (isSoft && value) return `Soft ${value}`;
    return value?.toString() || '';
  };

  return (
    <div className="relative">
      {label && (
        <div className="text-white text-lg font-semibold mb-2 text-center">
          {label}
        </div>
      )}
      <div className="flex gap-2 justify-center">
        {cards.map((card, index) => (
          <div key={index} style={{ marginLeft: index > 0 ? '-40px' : '0' }}>
            <CardComponent 
              card={card} 
              faceDown={isDealer && index === 0 && hideFirstCard}
              animate={true}
            />
          </div>
        ))}
      </div>
      {cards.length > 0 && (
        <div className={`hand-indicator ${getStatusColor()}`}>
          {getStatusText()}
        </div>
      )}
    </div>
  );
};