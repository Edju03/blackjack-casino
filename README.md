# Professional Blackjack Casino

A professional web-based blackjack game with provably fair shuffling, built using React, TypeScript, and Vite. This implementation follows standard casino rules and provides cryptographically verifiable fairness.

## Live Demo

Visit [https://edju03.github.io/blackjack-casino/](https://edju03.github.io/blackjack-casino/) to play the game.

## Features

### Complete Blackjack Implementation
- **Standard Casino Rules**: Follows official blackjack rules including all player options
- **Player Actions**: Hit, Stand, Double Down, Split, Surrender, Insurance
- **Dealer Rules**: Configurable dealer behavior (stands on all 17s by default)
- **Accurate Payouts**: 3:2 blackjack payout, 2:1 insurance
- **Multiple Hands**: Support for split hands with independent play

### Provably Fair System
- **Cryptographic Fairness**: Uses Web Crypto API for secure random number generation
- **Verifiable Shuffling**: Server seed hash published before play, full seed revealed after
- **Client Seeds**: Players can provide their own seed for shuffle verification
- **Deterministic Shuffling**: Fisher-Yates shuffle with cryptographically secure RNG
- **Verification Tool**: Built-in fairness verification after each round

### Professional Features
- **Multi-deck Shoe**: Configurable deck count (default 6 decks)
- **Penetration Threshold**: Automatic reshuffling at 75% penetration
- **Bankroll Management**: Minimum and maximum bet limits
- **Game History**: Stores fairness data for verification
- **Responsive Design**: Works on desktop and mobile devices

## Game Rules

### Card Values
- Number cards (2-10): Face value
- Face cards (J, Q, K): 10 points
- Aces: 1 or 11 points (automatically adjusted)

### Gameplay
1. **Betting Phase**: Place your bet within table limits
2. **Initial Deal**: Two cards to player, two to dealer (one face down)
3. **Player Actions**: Choose from available actions based on your hand
4. **Dealer Play**: Dealer draws to 17 or higher
5. **Settlement**: Payouts based on final hands

### Player Options
- **Hit**: Take another card
- **Stand**: Keep current hand
- **Double Down**: Double bet, receive one card, and stand
- **Split**: Split matching cards into two hands (requires matching bet)
- **Surrender**: Forfeit half your bet to end the hand
- **Insurance**: Side bet when dealer shows ace (pays 2:1)

### Payouts
- **Blackjack**: 3:2 (1.5x bet)
- **Standard Win**: 1:1 (even money)
- **Insurance**: 2:1 (if dealer has blackjack)
- **Push**: Bet returned (tie)
- **Surrender**: Half bet returned

## Fairness Protocol

### How It Works
1. **Server Seed Generation**: A random server seed is generated for each shuffle
2. **Hash Publication**: The SHA-256 hash of the server seed is shown before play
3. **Client Seed Input**: Players can provide their own random seed
4. **Combined Shuffling**: Seeds are combined using HMAC-SHA256 for deck shuffling
5. **Seed Revelation**: After the round, the server seed is revealed
6. **Verification**: Players can verify the hash matches and recreate the shuffle

### Verification Steps
1. Click "Verify Fairness" after a round completes
2. View the server seed, client seed, and hash
3. The system verifies the server seed hash matches
4. You can independently verify the shuffle sequence

## Technical Architecture

### Technology Stack
- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React hooks with custom game engine
- **Cryptography**: Web Crypto API for secure random generation

### Key Components
- **GameEngine**: Core game logic and state management
- **Card/Deck Models**: Object-oriented card representation
- **Hand Management**: Scoring, soft/hard totals, blackjack detection
- **Fairness Module**: Cryptographic shuffling and verification
- **React Components**: Modular UI components for game table

### Project Structure
```
src/
├── models/          # Game models (Card, Deck, Hand, Player)
├── game/            # Game engine and logic
├── utils/           # Provably fair utilities
├── components/      # React components
├── hooks/           # Custom React hooks
└── styles/          # CSS and styling
```

## Installation & Development

### Prerequisites
- Node.js 18+ and npm
- Git

### Local Development
```bash
# Clone the repository
git clone https://github.com/edju03/blackjack-casino.git
cd blackjack-casino

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment
The game is configured for GitHub Pages deployment:

```bash
# Deploy to GitHub Pages
npm run deploy
```

This will build the project and deploy to `gh-pages` branch.

## Configuration

Game settings can be modified in `src/game/GameEngine.ts`:

```typescript
{
  deckCount: 6,           // Number of decks in shoe
  minBet: 10,            // Minimum bet amount
  maxBet: 1000,          // Maximum bet amount
  penetrationThreshold: 0.75,  // Reshuffle at 75% dealt
  dealerHitsSoft17: false,     // Dealer stands on soft 17
  doubleAfterSplit: true,      // Allow doubling after split
  surrenderAllowed: true,      // Allow surrender option
  insuranceAllowed: true,      // Allow insurance bets
  blackjackPayout: 1.5         // 3:2 payout ratio
}
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires support for:
- Web Crypto API
- ES2020 features
- CSS Grid and Flexbox

## Security Considerations

- All random number generation uses Web Crypto API
- No Math.random() used for game-critical operations
- Server seeds are never exposed before hashing
- Client-side verification available for all rounds
- Game state stored locally, no server communication

## Contributing

Contributions are welcome! Please ensure:
- Code follows TypeScript best practices
- No comments or emojis in production code
- All game rules are accurately implemented
- Fairness verification remains functional
- Tests pass and coverage is maintained

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Casino rules based on standard Las Vegas blackjack
- Provably fair system inspired by cryptocurrency casinos
- Fisher-Yates shuffle algorithm for unbiased shuffling
- React and TypeScript communities for excellent tools