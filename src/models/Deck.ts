import { Card, Suit, Rank } from './Card';
import { createSyncDeterministicRandom } from '../utils/provablyFair';

export class Deck {
  private cards: Card[] = [];
  private dealtIndex: number = 0;
  public readonly deckCount: number;

  constructor(numberOfDecks: number = 6) {
    this.deckCount = numberOfDecks;
    this.initializeDeck();
  }

  private initializeDeck(): void {
    this.cards = [];
    const suits = Object.values(Suit);
    const ranks = Object.values(Rank);

    for (let deck = 0; deck < this.deckCount; deck++) {
      for (const suit of suits) {
        for (const rank of ranks) {
          this.cards.push(new Card(rank as Rank, suit as Suit));
        }
      }
    }
  }

  shuffle(serverSeed: string, clientSeed: string): void {
    const rng = createSyncDeterministicRandom(serverSeed, clientSeed);
    
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
    
    this.dealtIndex = 0;
  }

  deal(): Card | null {
    if (this.dealtIndex >= this.cards.length) {
      return null;
    }
    return this.cards[this.dealtIndex++];
  }

  getCardsRemaining(): number {
    return this.cards.length - this.dealtIndex;
  }

  getPenetration(): number {
    return this.dealtIndex / this.cards.length;
  }

  needsReshuffle(penetrationThreshold: number = 0.75): boolean {
    return this.getPenetration() >= penetrationThreshold;
  }

  reset(): void {
    this.initializeDeck();
    this.dealtIndex = 0;
  }

  getDealtCards(): Card[] {
    return this.cards.slice(0, this.dealtIndex);
  }

  getAllCards(): Card[] {
    return [...this.cards];
  }
}