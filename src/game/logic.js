import {
  BOARD_SIZE,
  DIRECTIONS,
  INITIAL_LENGTH,
  OPPOSITE,
  STATUS,
} from './constants.js'

const samePosition = (a, b) => a.x === b.x && a.y === b.y

const isOutOfBounds = ({ x, y }, size) =>
  x < 0 || y < 0 || x >= size || y >= size

// Devuelve una celda libre al azar, o null si el tablero está lleno.
// `random` se inyecta para poder testear sin azar real.
export function randomFood(snake, size = BOARD_SIZE, random = Math.random) {
  const free = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!snake.some((part) => part.x === x && part.y === y)) {
        free.push({ x, y })
      }
    }
  }
  if (free.length === 0) return null
  return free[Math.floor(random() * free.length)]
}

// Serpiente horizontal en el centro, mirando a la derecha. La cabeza es snake[0].
export function createInitialState(size = BOARD_SIZE, random = Math.random) {
  const center = Math.floor(size / 2)
  const snake = Array.from({ length: INITIAL_LENGTH }, (_, i) => ({
    x: center - i,
    y: center,
  }))

  return {
    size,
    snake,
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    food: randomFood(snake, size, random),
    score: 0,
    status: STATUS.READY,
  }
}

// Se compara con `direction` (la del último movimiento real), no con `nextDirection`:
// así, pulsar dos teclas rápidas dentro del mismo tick no permite dar media vuelta.
export function changeDirection(state, newDirection) {
  if (!DIRECTIONS[newDirection]) return state
  if (OPPOSITE[state.direction] === newDirection) return state
  return { ...state, nextDirection: newDirection }
}

// Avanza el juego un tick.
export function step(state, random = Math.random) {
  if (state.status !== STATUS.PLAYING) return state

  const direction = state.nextDirection
  const { x, y } = DIRECTIONS[direction]
  const head = state.snake[0]
  const newHead = { x: head.x + x, y: head.y + y }

  if (isOutOfBounds(newHead, state.size)) {
    return { ...state, direction, status: STATUS.GAME_OVER }
  }

  const eats = samePosition(newHead, state.food)
  // Si no come, la cola se mueve en este mismo tick, así que su celda queda libre.
  const body = eats ? state.snake : state.snake.slice(0, -1)

  if (body.some((part) => samePosition(part, newHead))) {
    return { ...state, direction, status: STATUS.GAME_OVER }
  }

  const snake = [newHead, ...body]

  if (!eats) {
    return { ...state, snake, direction }
  }

  const food = randomFood(snake, state.size, random)
  return {
    ...state,
    snake,
    direction,
    food,
    score: state.score + 1,
    status: food ? STATUS.PLAYING : STATUS.WON,
  }
}
