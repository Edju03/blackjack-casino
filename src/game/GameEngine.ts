import { Deck } from '../models/Deck';
import { Player } from '../models/Player';
import { Hand, HandStatus } from '../models/Hand';
import { FairnessData, createFairnessData, generateClientSeed } from '../utils/provablyFair';

export enum GamePhase {
  Betting = 'betting',
  Dealing = 'dealing',
  PlayerTurn = 'playerTurn',
  DealerTurn = 'dealerTurn',
  Settlement = 'settlement',
  Finished = 'finished'
}

export interface GameSettings {
  deckCount: number;
  minBet: number;
  maxBet: number;
  penetrationThreshold: number;
  dealerHitsSoft17: boolean;
  doubleAfterSplit: boolean;
  surrenderAllowed: boolean;
  insuranceAllowed: boolean;
  blackjackPayout: number;
}

export interface RoundResult {
  playerHands: HandResult[];
  dealerHand: HandResult;
  netWinnings: number;
  insuranceResult?: InsuranceResult;
}

export interface HandResult {
  hand: Hand;
  payout: number;
  result: 'win' | 'loss' | 'push' | 'blackjack' | 'surrender';
}

export interface InsuranceResult {
  taken: boolean;
  won: boolean;
  payout: number;
}

export interface GameState {
  phase: GamePhase;
  player: Player;
  dealerHand: Hand;
  deck: Deck;
  settings: GameSettings;
  fairnessData?: FairnessData;
  roundHistory: RoundResult[];
  currentRoundResult?: RoundResult;
}

export class GameEngine {
  private state: GameState;
  private onStateChange?: (state: GameState) => void;

  constructor(settings?: Partial<GameSettings>, onStateChange?: (state: GameState) => void) {
    const defaultSettings: GameSettings = {
      deckCount: 6,
      minBet: 10,
      maxBet: 1000,
      penetrationThreshold: 0.75,
      dealerHitsSoft17: false,
      doubleAfterSplit: true,
      surrenderAllowed: true,
      insuranceAllowed: true,
      blackjackPayout: 1.5
    };

    this.state = {
      phase: GamePhase.Betting,
      player: new Player('player1', 'Player', 1000),
      dealerHand: new Hand(),
      deck: new Deck(settings?.deckCount || defaultSettings.deckCount),
      settings: { ...defaultSettings, ...settings },
      roundHistory: []
    };

    this.onStateChange = onStateChange;
    this.notifyStateChange();
  }

  private notifyStateChange(): void {
    if (this.onStateChange) {
      this.onStateChange(this.getState());
    }
  }

  getState(): GameState {
    return { ...this.state };
  }

  async startNewRound(bet: number, clientSeed?: string): Promise<boolean> {
    if (this.state.phase !== GamePhase.Betting) {
      return false;
    }

    if (bet < this.state.settings.minBet || bet > this.state.settings.maxBet) {
      return false;
    }

    if (!this.state.player.placeBet(bet)) {
      return false;
    }

    if (this.state.deck.needsReshuffle(this.state.settings.penetrationThreshold)) {
      await this.reshuffleDeck(clientSeed);
    }

    this.state.phase = GamePhase.Dealing;
    this.notifyStateChange();

    await this.dealInitialCards();
    return true;
  }

  private async reshuffleDeck(clientSeed?: string): Promise<void> {
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    this.state.fairnessData = await createFairnessData(gameId, clientSeed || generateClientSeed());
    
    this.state.deck.reset();
    this.state.deck.shuffle(
      this.state.fairnessData.serverSeed,
      this.state.fairnessData.clientSeed
    );
  }

  private async dealInitialCards(): Promise<void> {
    this.state.dealerHand.clear();
    
    const playerHand = this.state.player.getCurrentHand();
    if (!playerHand) return;

    for (let i = 0; i < 2; i++) {
      const playerCard = this.state.deck.deal();
      if (playerCard) playerHand.addCard(playerCard);
      
      const dealerCard = this.state.deck.deal();
      if (dealerCard) this.state.dealerHand.addCard(dealerCard);
    }

    if (playerHand.isBlackjack() && !this.state.dealerHand.isBlackjack()) {
      this.state.phase = GamePhase.Settlement;
      this.settleRound();
    } else if (this.canOfferInsurance()) {
      this.state.phase = GamePhase.PlayerTurn;
    } else {
      this.state.phase = GamePhase.PlayerTurn;
    }

    this.notifyStateChange();
  }

  private canOfferInsurance(): boolean {
    if (!this.state.settings.insuranceAllowed) return false;
    
    const dealerCards = this.state.dealerHand.getCards();
    return dealerCards.length > 0 && dealerCards[0].isAce;
  }

  takeInsurance(): boolean {
    if (!this.canOfferInsurance() || this.state.phase !== GamePhase.PlayerTurn) {
      return false;
    }

    const currentHand = this.state.player.getCurrentHand();
    if (!currentHand) return false;

    const insuranceAmount = currentHand.bet / 2;
    const success = this.state.player.placeInsurance(insuranceAmount);
    
    this.notifyStateChange();
    return success;
  }

  hit(): boolean {
    if (this.state.phase !== GamePhase.PlayerTurn) return false;

    const currentHand = this.state.player.getCurrentHand();
    if (!currentHand || !currentHand.canHit()) return false;

    const card = this.state.deck.deal();
    if (!card) return false;

    currentHand.addCard(card);

    if (currentHand.isBusted()) {
      this.nextPlayerHand();
    } else if (currentHand.isDoubled) {
      currentHand.stand();
      this.nextPlayerHand();
    }

    this.notifyStateChange();
    return true;
  }

  stand(): boolean {
    if (this.state.phase !== GamePhase.PlayerTurn) return false;

    const currentHand = this.state.player.getCurrentHand();
    if (!currentHand) return false;

    currentHand.stand();
    this.nextPlayerHand();
    
    this.notifyStateChange();
    return true;
  }

  double(): boolean {
    if (this.state.phase !== GamePhase.PlayerTurn) return false;

    const currentHand = this.state.player.getCurrentHand();
    if (!currentHand || !currentHand.canDouble()) return false;

    if (!this.state.player.doubleDown()) return false;

    const card = this.state.deck.deal();
    if (!card) return false;

    currentHand.addCard(card);
    currentHand.stand();
    this.nextPlayerHand();

    this.notifyStateChange();
    return true;
  }

  split(): boolean {
    if (this.state.phase !== GamePhase.PlayerTurn) return false;

    const currentHand = this.state.player.getCurrentHand();
    if (!currentHand || !currentHand.canSplit()) return false;

    if (!this.state.player.splitHand()) return false;

    const hand1 = this.state.player.hands[this.state.player.currentHandIndex];
    const hand2 = this.state.player.hands[this.state.player.currentHandIndex + 1];

    const card1 = this.state.deck.deal();
    const card2 = this.state.deck.deal();

    if (card1) hand1.addCard(card1);
    if (card2) hand2.addCard(card2);

    this.notifyStateChange();
    return true;
  }

  surrender(): boolean {
    if (this.state.phase !== GamePhase.PlayerTurn) return false;
    if (!this.state.settings.surrenderAllowed) return false;

    const currentHand = this.state.player.getCurrentHand();
    if (!currentHand || currentHand.getCards().length !== 2) return false;

    if (!this.state.player.surrender()) return false;

    this.nextPlayerHand();
    this.notifyStateChange();
    return true;
  }

  private nextPlayerHand(): void {
    if (this.state.player.hasMoreHands()) {
      this.state.player.nextHand();
    } else {
      const activeHands = this.state.player.getActiveHands();
      if (activeHands.length === 0) {
        this.state.phase = GamePhase.Settlement;
        this.settleRound();
      } else {
        this.state.phase = GamePhase.DealerTurn;
        this.playDealerHand();
      }
    }
  }

  private playDealerHand(): void {
    while (this.shouldDealerHit()) {
      const card = this.state.deck.deal();
      if (!card) break;
      this.state.dealerHand.addCard(card);
    }

    this.state.dealerHand.stand();
    this.state.phase = GamePhase.Settlement;
    this.settleRound();
    this.notifyStateChange();
  }

  private shouldDealerHit(): boolean {
    const dealerValue = this.state.dealerHand.getValue();
    
    if (dealerValue < 17) return true;
    if (dealerValue > 17) return false;
    
    if (dealerValue === 17 && this.state.settings.dealerHitsSoft17) {
      return this.state.dealerHand.isSoft();
    }
    
    return false;
  }

  private settleRound(): void {
    const dealerValue = this.state.dealerHand.getValue();
    const dealerBlackjack = this.state.dealerHand.isBlackjack();
    const dealerBusted = this.state.dealerHand.isBusted();

    const handResults: HandResult[] = [];
    let totalWinnings = 0;

    for (const hand of this.state.player.getAllHands()) {
      let result: HandResult['result'];
      let payout = 0;

      if (hand.status === HandStatus.Surrendered) {
        result = 'surrender';
        payout = hand.bet * 0.5;
      } else if (hand.status === HandStatus.Busted) {
        result = 'loss';
        payout = 0;
      } else if (hand.isBlackjack() && !dealerBlackjack) {
        result = 'blackjack';
        payout = hand.bet * (1 + this.state.settings.blackjackPayout);
      } else if (dealerBusted) {
        result = 'win';
        payout = hand.bet * 2;
      } else if (hand.getValue() > dealerValue) {
        result = 'win';
        payout = hand.bet * 2;
      } else if (hand.getValue() === dealerValue) {
        result = 'push';
        payout = hand.bet;
      } else {
        result = 'loss';
        payout = 0;
      }

      this.state.player.win(payout);
      totalWinnings += payout;

      handResults.push({
        hand: hand,
        payout,
        result
      });
    }

    let insuranceResult: InsuranceResult | undefined;
    if (this.state.player.insuranceBet > 0) {
      const insuranceWon = dealerBlackjack;
      const insurancePayout = insuranceWon ? this.state.player.insuranceBet * 3 : 0;
      
      if (insurancePayout > 0) {
        this.state.player.win(insurancePayout);
        totalWinnings += insurancePayout;
      }

      insuranceResult = {
        taken: true,
        won: insuranceWon,
        payout: insurancePayout
      };
    }

    const totalBet = this.state.player.getTotalBet();
    const netWinnings = totalWinnings - totalBet;

    this.state.currentRoundResult = {
      playerHands: handResults,
      dealerHand: {
        hand: this.state.dealerHand,
        payout: 0,
        result: dealerBusted ? 'loss' : 'win'
      },
      netWinnings,
      insuranceResult
    };

    this.state.roundHistory.push(this.state.currentRoundResult);
    this.state.phase = GamePhase.Finished;
    this.notifyStateChange();
  }

  resetForNewRound(): void {
    this.state.player.resetHands();
    this.state.dealerHand.clear();
    this.state.currentRoundResult = undefined;
    this.state.phase = GamePhase.Betting;
    this.notifyStateChange();
  }

  getAvailableActions(): string[] {
    const actions: string[] = [];
    
    if (this.state.phase !== GamePhase.PlayerTurn) return actions;
    
    const currentHand = this.state.player.getCurrentHand();
    if (!currentHand) return actions;

    if (currentHand.canHit()) actions.push('hit');
    if (currentHand.status === HandStatus.Active) actions.push('stand');
    if (currentHand.canDouble() && this.state.player.balance >= currentHand.bet) actions.push('double');
    if (currentHand.canSplit() && this.state.player.balance >= currentHand.bet) actions.push('split');
    if (this.state.settings.surrenderAllowed && currentHand.getCards().length === 2) actions.push('surrender');
    
    if (this.canOfferInsurance() && this.state.player.insuranceBet === 0) {
      const maxInsurance = currentHand.bet / 2;
      if (this.state.player.balance >= maxInsurance) actions.push('insurance');
    }

    return actions;
  }

  getFairnessData(): FairnessData | undefined {
    return this.state.fairnessData;
  }

  getRoundHistory(): RoundResult[] {
    return [...this.state.roundHistory];
  }
}