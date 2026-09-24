import Board from './components/Board.jsx'
import HUD from './components/HUD.jsx'
import { useSnakeGame } from './hooks/useSnakeGame.js'

function App() {
  const { game, best, pressSpace } = useSnakeGame()

  return (
    <main className="app">
      <h1 className="title">Snake</h1>
      <HUD score={game.score} best={best} status={game.status} onButton={pressSpace} />
      <Board game={game} />
      <p className="help">Flechas o WASD para moverte · Espacio para pausar</p>
    </main>
  )
}

export default App
