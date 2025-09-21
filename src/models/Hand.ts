import { Card } from './Card';

export enum HandStatus {
  Active = 'active',
  Standing = 'standing',
  Busted = 'busted',
  Blackjack = 'blackjack',
  Surrendered = 'surrendered'
}

export class Hand {
  private cards: Card[] = [];
  public status: HandStatus = HandStatus.Active;
  public bet: number = 0;
  public isDoubled: boolean = false;
  public isSplit: boolean = false;

  constructor(bet: number = 0) {
    this.bet = bet;
  }

  addCard(card: Card): void {
    this.cards.push(card);
    
    if (this.getValue() > 21) {
      this.status = HandStatus.Busted;
    } else if (this.isBlackjack() && this.cards.length === 2) {
      this.status = HandStatus.Blackjack;
    }
  }

  getCards(): Card[] {
    return [...this.cards];
  }

  getValue(): number {
    let value = 0;
    let aces = 0;

    for (const card of this.cards) {
      value += card.value;
      if (card.isAce) {
        aces++;
      }
    }

    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    return value;
  }

  getSoftValue(): number | null {
    let value = 0;
    let aces = 0;

    for (const card of this.cards) {
      value += card.value;
      if (card.isAce) {
        aces++;
      }
    }

    if (aces > 0 && value <= 21) {
      return value;
    }

    return null;
  }

  isSoft(): boolean {
    return this.getSoftValue() !== null;
  }

  isBlackjack(): boolean {
    return this.cards.length === 2 && this.getValue() === 21;
  }

  isBusted(): boolean {
    return this.getValue() > 21;
  }

  canSplit(): boolean {
    return this.cards.length === 2 && 
           this.cards[0].rank === this.cards[1].rank &&
           !this.isSplit;
  }

  canDouble(): boolean {
    return this.cards.length === 2 && 
           this.status === HandStatus.Active &&
           !this.isDoubled;
  }

  canHit(): boolean {
    return this.status === HandStatus.Active && 
           this.getValue() < 21 &&
           !this.isDoubled;
  }

  stand(): void {
    if (this.status === HandStatus.Active) {
      this.status = HandStatus.Standing;
    }
  }

  double(additionalBet: number): void {
    if (this.canDouble()) {
      this.bet += additionalBet;
      this.isDoubled = true;
    }
  }

  surrender(): void {
    if (this.cards.length === 2 && this.status === HandStatus.Active) {
      this.status = HandStatus.Surrendered;
    }
  }

  clear(): void {
    this.cards = [];
    this.status = HandStatus.Active;
    this.bet = 0;
    this.isDoubled = false;
    this.isSplit = false;
  }

  toString(): string {
    const cardsStr = this.cards.map(c => c.toUnicode()).join(' ');
    const valueStr = this.isSoft() ? `Soft ${this.getValue()}` : `${this.getValue()}`;
    return `${cardsStr} (${valueStr})`;
  }
}