import { GameTable } from './components/GameTable';
import { useGame } from './hooks/useGame';
import './styles/index.css';

function App() {
  const {
    gameState,
    placeBet,
    hit,
    stand,
    double,
    split,
    surrender,
    takeInsurance,
    startNewRound,
    getAvailableActions
  } = useGame();

  if (!gameState) {
    return (
      <div className="min-h-screen table-felt flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <GameTable
      gameState={gameState}
      onPlaceBet={placeBet}
      onHit={hit}
      onStand={stand}
      onDouble={double}
      onSplit={split}
      onSurrender={surrender}
      onInsurance={takeInsurance}
      onNewRound={startNewRound}
      availableActions={getAvailableActions()}
    />
  );
}

export default App;