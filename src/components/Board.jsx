import { STATUS } from '../game/constants.js'

const OVERLAY_TEXT = {
  [STATUS.READY]: 'Pulsa una flecha o Espacio para empezar',
  [STATUS.PAUSED]: 'Pausa',
  [STATUS.GAME_OVER]: 'Game over',
  [STATUS.WON]: '¡Has ganado!',
}

function Board({ game }) {
  const { size, snake, food, status } = game
  // Set de "x,y" para saber en O(1) si una celda es parte de la serpiente.
  const body = new Set(snake.map(({ x, y }) => `${x},${y}`))
  const head = snake[0]

  const cells = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let className = 'cell'
      if (head.x === x && head.y === y) className += ' cell--head'
      else if (body.has(`${x},${y}`)) className += ' cell--snake'
      else if (food && food.x === x && food.y === y) className += ' cell--food'
      cells.push(<div key={`${x},${y}`} className={className} />)
    }
  }

  const overlay = OVERLAY_TEXT[status]

  return (
    <div className="board-wrapper">
      <div
        className="board"
        style={{ '--size': size }}
        role="img"
        aria-label={`Tablero de Snake, ${snake.length} casillas de largo`}
      >
        {cells}
      </div>
      {overlay && <div className="overlay">{overlay}</div>}
    </div>
  )
}

export default Board
