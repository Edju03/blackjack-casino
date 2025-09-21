export enum Suit {
  Clubs = 'C',
  Diamonds = 'D',
  Hearts = 'H',
  Spades = 'S'
}

export enum Rank {
  Two = '2',
  Three = '3',
  Four = '4',
  Five = '5',
  Six = '6',
  Seven = '7',
  Eight = '8',
  Nine = '9',
  Ten = '10',
  Jack = 'J',
  Queen = 'Q',
  King = 'K',
  Ace = 'A'
}

export class Card {
  constructor(
    public readonly rank: Rank,
    public readonly suit: Suit
  ) {}

  get value(): number {
    switch (this.rank) {
      case Rank.Ace:
        return 11;
      case Rank.Jack:
      case Rank.Queen:
      case Rank.King:
        return 10;
      default:
        return parseInt(this.rank);
    }
  }

  get isAce(): boolean {
    return this.rank === Rank.Ace;
  }

  get color(): 'red' | 'black' {
    return this.suit === Suit.Hearts || this.suit === Suit.Diamonds ? 'red' : 'black';
  }

  toString(): string {
    return `${this.rank}${this.suit}`;
  }

  toUnicode(): string {
    const suitSymbols: Record<Suit, string> = {
      [Suit.Spades]: '♠',
      [Suit.Hearts]: '♥',
      [Suit.Diamonds]: '♦',
      [Suit.Clubs]: '♣'
    };
    return `${this.rank}${suitSymbols[this.suit]}`;
  }
}