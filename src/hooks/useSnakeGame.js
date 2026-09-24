import { useCallback, useEffect, useReducer } from 'react'
import { STATUS, TICK_MS } from '../game/constants.js'
import { changeDirection, createInitialState, step } from '../game/logic.js'

const BEST_KEY = 'snake-best'

const KEY_TO_DIRECTION = {
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',
  w: 'UP',
  s: 'DOWN',
  a: 'LEFT',
  d: 'RIGHT',
}

// localStorage puede fallar (modo privado, bloqueado...): el juego debe funcionar igual.
function loadBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

function saveBest(best) {
  try {
    localStorage.setItem(BEST_KEY, String(best))
  } catch {
    // Sin persistencia; el récord vive solo en esta sesión.
  }
}

function newGame(status) {
  return { ...createInitialState(), status }
}

export function reducer(state, action) {
  switch (action.type) {
    case 'TICK': {
      const game = step(state.game)
      return { game, best: Math.max(state.best, game.score) }
    }
    case 'TURN': {
      const { status } = state.game
      if (status === STATUS.PAUSED || status === STATUS.GAME_OVER || status === STATUS.WON) {
        return state
      }
      const game = changeDirection(state.game, action.direction)
      // La primera flecha también arranca la partida.
      return { ...state, game: { ...game, status: STATUS.PLAYING } }
    }
    case 'SPACE': {
      const { status } = state.game
      if (status === STATUS.PLAYING) {
        return { ...state, game: { ...state.game, status: STATUS.PAUSED } }
      }
      if (status === STATUS.READY || status === STATUS.PAUSED) {
        return { ...state, game: { ...state.game, status: STATUS.PLAYING } }
      }
      return { ...state, game: newGame(STATUS.PLAYING) }
    }
    default:
      return state
  }
}

function init() {
  return { game: newGame(STATUS.READY), best: loadBest() }
}

export function useSnakeGame() {
  const [{ game, best }, dispatch] = useReducer(reducer, undefined, init)

  // Reloj: solo corre mientras se juega.
  useEffect(() => {
    if (game.status !== STATUS.PLAYING) return
    const id = setInterval(() => dispatch({ type: 'TICK' }), TICK_MS)
    return () => clearInterval(id)
  }, [game.status])

  useEffect(() => {
    saveBest(best)
  }, [best])

  useEffect(() => {
    function onKeyDown(event) {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
      const direction = KEY_TO_DIRECTION[key]
      if (direction) {
        event.preventDefault()
        dispatch({ type: 'TURN', direction })
      } else if (key === ' ') {
        event.preventDefault()
        dispatch({ type: 'SPACE' })
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const pressSpace = useCallback(() => dispatch({ type: 'SPACE' }), [])

  return { game, best, pressSpace }
}
