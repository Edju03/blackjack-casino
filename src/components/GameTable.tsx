import React from 'react';
import { GameState, GamePhase } from '../game/GameEngine';
import { HandComponent } from './HandComponent';
import { BettingControls } from './BettingControls';
import { ActionButtons } from './ActionButtons';
import { FairnessVerification } from './FairnessVerification';

interface GameTableProps {
  gameState: GameState;
  onPlaceBet: (amount: number) => void;
  onHit: () => void;
  onStand: () => void;
  onDouble: () => void;
  onSplit: () => void;
  onSurrender: () => void;
  onInsurance: () => void;
  onNewRound: () => void;
  availableActions: string[];
}

export const GameTable: React.FC<GameTableProps> = ({
  gameState,
  onPlaceBet,
  onHit,
  onStand,
  onDouble,
  onSplit,
  onSurrender,
  onInsurance,
  onNewRound,
  availableActions
}) => {
  const { phase, player, dealerHand, settings, currentRoundResult, fairnessData } = gameState;
  
  const showDealerHole = phase === GamePhase.DealerTurn || 
                         phase === GamePhase.Settlement || 
                         phase === GamePhase.Finished;

  const renderRoundResult = () => {
    if (!currentRoundResult) return null;

    return (
      <div className="bg-black bg-opacity-75 rounded-lg p-6 text-white max-w-md mx-auto">
        <h3 className="text-xl font-bold mb-4 text-center">Round Complete</h3>
        
        {currentRoundResult.playerHands.map((handResult, index) => (
          <div key={index} className="mb-2">
            <div className="flex justify-between">
              <span>Hand {index + 1}: {handResult.result.toUpperCase()}</span>
              <span className={handResult.payout > 0 ? 'text-green-400' : 'text-red-400'}>
                ${handResult.payout.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
        
        {currentRoundResult.insuranceResult && (
          <div className="mb-2">
            <div className="flex justify-between">
              <span>Insurance: {currentRoundResult.insuranceResult.won ? 'WON' : 'LOST'}</span>
              <span className={currentRoundResult.insuranceResult.payout > 0 ? 'text-green-400' : 'text-red-400'}>
                ${currentRoundResult.insuranceResult.payout.toFixed(2)}
              </span>
            </div>
          </div>
        )}
        
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between font-bold text-lg">
            <span>Net Result:</span>
            <span className={currentRoundResult.netWinnings >= 0 ? 'text-green-400' : 'text-red-400'}>
              {currentRoundResult.netWinnings >= 0 ? '+' : ''}${currentRoundResult.netWinnings.toFixed(2)}
            </span>
          </div>
        </div>
        
        <button
          onClick={onNewRound}
          className="w-full mt-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
        >
          New Round
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen table-felt flex flex-col">
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gold mb-2">Professional Blackjack</h1>
            <div className="text-white text-sm">
              Provably Fair • {settings.deckCount} Decks • 
              {settings.blackjackPayout === 1.5 ? ' 3:2' : ' 6:5'} Blackjack
            </div>
          </div>

          <div className="mb-8">
            <HandComponent
              hand={dealerHand}
              isDealer={true}
              hideFirstCard={!showDealerHole && dealerHand.getCards().length > 0}
              label="Dealer"
            />
          </div>

          <div className="mb-8">
            <div className="flex justify-center gap-8">
              {player.hands.map((hand, index) => (
                <div 
                  key={index}
                  className={`${index === player.currentHandIndex && phase === GamePhase.PlayerTurn ? 'ring-2 ring-yellow-400 rounded-lg p-2' : ''}`}
                >
                  <HandComponent
                    hand={hand}
                    label={player.hands.length > 1 ? `Hand ${index + 1}` : 'Player'}
                  />
                  {hand.bet > 0 && (
                    <div className="text-center mt-2 text-white">
                      Bet: ${hand.bet}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {phase === GamePhase.Betting && (
            <div className="flex justify-center">
              <BettingControls
                balance={player.balance}
                minBet={settings.minBet}
                maxBet={settings.maxBet}
                onPlaceBet={onPlaceBet}
              />
            </div>
          )}

          {phase === GamePhase.PlayerTurn && (
            <div className="flex justify-center">
              <ActionButtons
                availableActions={availableActions}
                onHit={onHit}
                onStand={onStand}
                onDouble={onDouble}
                onSplit={onSplit}
                onSurrender={onSurrender}
                onInsurance={onInsurance}
              />
            </div>
          )}

          {(phase === GamePhase.Settlement || phase === GamePhase.Finished) && (
            <div className="flex justify-center">
              {renderRoundResult()}
            </div>
          )}
        </div>
      </div>

      {fairnessData && phase === GamePhase.Finished && (
        <div className="p-4">
          <FairnessVerification
            fairnessData={fairnessData}
            dealtCards={gameState.deck.getDealtCards().map(c => c.toString())}
          />
        </div>
      )}
    </div>
  );
};