import { Hand } from './Hand';

export class Player {
  public readonly id: string;
  public name: string;
  public balance: number;
  public hands: Hand[] = [];
  public currentHandIndex: number = 0;
  public insuranceBet: number = 0;

  constructor(id: string, name: string, initialBalance: number = 1000) {
    this.id = id;
    this.name = name;
    this.balance = initialBalance;
  }

  placeBet(amount: number): boolean {
    if (amount > this.balance || amount <= 0) {
      return false;
    }
    
    this.hands = [new Hand(amount)];
    this.currentHandIndex = 0;
    this.balance -= amount;
    return true;
  }

  placeInsurance(amount: number): boolean {
    if (amount > this.balance || amount <= 0) {
      return false;
    }
    
    const maxInsurance = this.getCurrentHand()?.bet ? this.getCurrentHand()!.bet / 2 : 0;
    if (amount > maxInsurance) {
      return false;
    }
    
    this.insuranceBet = amount;
    this.balance -= amount;
    return true;
  }

  splitHand(): boolean {
    const currentHand = this.getCurrentHand();
    if (!currentHand || !currentHand.canSplit() || currentHand.bet > this.balance) {
      return false;
    }

    const cards = currentHand.getCards();
    if (cards.length !== 2) {
      return false;
    }

    const newHand = new Hand(currentHand.bet);
    this.balance -= currentHand.bet;
    
    currentHand.clear();
    currentHand.bet = newHand.bet;
    currentHand.isSplit = true;
    currentHand.addCard(cards[0]);
    
    newHand.isSplit = true;
    newHand.addCard(cards[1]);
    
    this.hands.splice(this.currentHandIndex + 1, 0, newHand);
    
    return true;
  }

  doubleDown(): boolean {
    const currentHand = this.getCurrentHand();
    if (!currentHand || !currentHand.canDouble() || currentHand.bet > this.balance) {
      return false;
    }

    this.balance -= currentHand.bet;
    currentHand.double(currentHand.bet);
    return true;
  }

  surrender(): boolean {
    const currentHand = this.getCurrentHand();
    if (!currentHand || currentHand.getCards().length !== 2) {
      return false;
    }

    currentHand.surrender();
    this.balance += currentHand.bet / 2;
    return true;
  }

  getCurrentHand(): Hand | null {
    if (this.currentHandIndex < this.hands.length) {
      return this.hands[this.currentHandIndex];
    }
    return null;
  }

  nextHand(): void {
    this.currentHandIndex++;
  }

  hasMoreHands(): boolean {
    return this.currentHandIndex < this.hands.length - 1;
  }

  resetHands(): void {
    this.hands = [];
    this.currentHandIndex = 0;
    this.insuranceBet = 0;
  }

  win(amount: number): void {
    this.balance += amount;
  }

  getActiveHands(): Hand[] {
    return this.hands.filter(hand => 
      hand.status !== 'busted' && 
      hand.status !== 'surrendered'
    );
  }

  getAllHands(): Hand[] {
    return [...this.hands];
  }

  getTotalBet(): number {
    return this.hands.reduce((total, hand) => total + hand.bet, 0) + this.insuranceBet;
  }
}