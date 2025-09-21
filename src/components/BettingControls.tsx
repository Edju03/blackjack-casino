import React, { useState } from 'react';

interface BettingControlsProps {
  balance: number;
  minBet: number;
  maxBet: number;
  onPlaceBet: (amount: number) => void;
  disabled?: boolean;
}

export const BettingControls: React.FC<BettingControlsProps> = ({
  balance,
  minBet,
  maxBet,
  onPlaceBet,
  disabled = false
}) => {
  const [betAmount, setBetAmount] = useState<number>(minBet);

  const chipValues = [5, 10, 25, 100, 500];

  const addChip = (value: number) => {
    const newBet = Math.min(betAmount + value, maxBet, balance);
    setBetAmount(newBet);
  };

  const clearBet = () => {
    setBetAmount(minBet);
  };

  const doubleBet = () => {
    const newBet = Math.min(betAmount * 2, maxBet, balance);
    setBetAmount(newBet);
  };

  const handlePlaceBet = () => {
    if (betAmount >= minBet && betAmount <= maxBet && betAmount <= balance) {
      onPlaceBet(betAmount);
    }
  };

  return (
    <div className="bg-black bg-opacity-50 rounded-lg p-6">
      <div className="text-center mb-4">
        <div className="text-white text-sm">Balance</div>
        <div className="text-gold text-3xl font-bold">${balance.toFixed(2)}</div>
      </div>

      <div className="text-center mb-6">
        <div className="text-white text-sm">Current Bet</div>
        <div className="text-white text-2xl font-bold">${betAmount.toFixed(2)}</div>
      </div>

      <div className="flex justify-center gap-3 mb-6">
        {chipValues.map(value => (
          <button
            key={value}
            onClick={() => addChip(value)}
            disabled={disabled || betAmount + value > balance || betAmount + value > maxBet}
            className={`chip chip-${value} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            ${value}
          </button>
        ))}
      </div>

      <div className="flex gap-3 justify-center mb-4">
        <button
          onClick={clearBet}
          disabled={disabled}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          Clear
        </button>
        <button
          onClick={doubleBet}
          disabled={disabled || betAmount * 2 > balance || betAmount * 2 > maxBet}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          Double
        </button>
      </div>

      <button
        onClick={handlePlaceBet}
        disabled={disabled || betAmount < minBet || betAmount > maxBet || betAmount > balance}
        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Place Bet
      </button>

      <div className="text-center text-xs text-gray-400 mt-2">
        Min: ${minBet} | Max: ${maxBet}
      </div>
    </div>
  );
};