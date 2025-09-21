import { useState, useCallback, useEffect, useRef } from 'react';
import { GameEngine, GameState, GamePhase } from '../game/GameEngine';
import { generateClientSeed } from '../utils/provablyFair';

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [clientSeed, setClientSeed] = useState<string>(generateClientSeed());
  const [isProcessing, setIsProcessing] = useState(false);
  const gameEngineRef = useRef<GameEngine | null>(null);
  
  useEffect(() => {
    const handleStateChange = (newState: GameState) => {
      setGameState(newState);
      setIsProcessing(false);
      
      if (newState.phase === GamePhase.Finished && newState.fairnessData) {
        localStorage.setItem(`game_${newState.fairnessData.gameId}`, JSON.stringify(newState.fairnessData));
      }
    };
    
    const engine = new GameEngine(
      {
        deckCount: 6,
        minBet: 10,
        maxBet: 1000,
        penetrationThreshold: 0.75,
        dealerHitsSoft17: false,
        doubleAfterSplit: true,
        surrenderAllowed: true,
        insuranceAllowed: true,
        blackjackPayout: 1.5
      },
      handleStateChange
    );
    
    gameEngineRef.current = engine;
    setGameState(engine.getState());
    
    return () => {
      gameEngineRef.current = null;
    };
  }, []);

  const placeBet = useCallback(async (amount: number) => {
    if (isProcessing || !gameEngineRef.current) return;
    setIsProcessing(true);
    
    const newClientSeed = generateClientSeed();
    setClientSeed(newClientSeed);
    
    const success = await gameEngineRef.current.startNewRound(amount, newClientSeed);
    if (!success) {
      setIsProcessing(false);
    }
  }, [isProcessing]);

  const hit = useCallback(() => {
    if (isProcessing || !gameEngineRef.current) return;
    setIsProcessing(true);
    gameEngineRef.current.hit();
  }, [isProcessing]);

  const stand = useCallback(() => {
    if (isProcessing || !gameEngineRef.current) return;
    setIsProcessing(true);
    gameEngineRef.current.stand();
  }, [isProcessing]);

  const double = useCallback(() => {
    if (isProcessing || !gameEngineRef.current) return;
    setIsProcessing(true);
    gameEngineRef.current.double();
  }, [isProcessing]);

  const split = useCallback(() => {
    if (isProcessing || !gameEngineRef.current) return;
    setIsProcessing(true);
    gameEngineRef.current.split();
  }, [isProcessing]);

  const surrender = useCallback(() => {
    if (isProcessing || !gameEngineRef.current) return;
    setIsProcessing(true);
    gameEngineRef.current.surrender();
  }, [isProcessing]);

  const takeInsurance = useCallback(() => {
    if (isProcessing || !gameEngineRef.current) return;
    setIsProcessing(true);
    gameEngineRef.current.takeInsurance();
  }, [isProcessing]);

  const startNewRound = useCallback(() => {
    if (!gameEngineRef.current) return;
    gameEngineRef.current.resetForNewRound();
    setIsProcessing(false);
  }, []);

  const getAvailableActions = useCallback(() => {
    if (!gameEngineRef.current) return [];
    return gameEngineRef.current.getAvailableActions();
  }, []);

  const changeClientSeed = useCallback((newSeed: string) => {
    setClientSeed(newSeed);
  }, []);

  if (!gameState) {
    return {
      gameState: null,
      clientSeed,
      isProcessing: true,
      placeBet: () => {},
      hit: () => {},
      stand: () => {},
      double: () => {},
      split: () => {},
      surrender: () => {},
      takeInsurance: () => {},
      startNewRound: () => {},
      getAvailableActions: () => [],
      changeClientSeed: () => {}
    };
  }

  return {
    gameState,
    clientSeed,
    isProcessing,
    placeBet,
    hit,
    stand,
    double,
    split,
    surrender,
    takeInsurance,
    startNewRound,
    getAvailableActions,
    changeClientSeed
  };
};