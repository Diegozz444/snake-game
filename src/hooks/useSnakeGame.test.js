import { describe, expect, it } from 'vitest'
import { STATUS } from '../game/constants.js'
import { createInitialState } from '../game/logic.js'
import { reducer } from './useSnakeGame.js'

// Estado del reducer con la partida en el estado que queramos.
function withGame(overrides = {}, best = 0) {
  return { game: { ...createInitialState(10, () => 0), ...overrides }, best }
}

describe('reducer: SPACE', () => {
  it.each([
    [STATUS.READY, STATUS.PLAYING],
    [STATUS.PLAYING, STATUS.PAUSED],
    [STATUS.PAUSED, STATUS.PLAYING],
  ])('de %s pasa a %s', (from, to) => {
    const next = reducer(withGame({ status: from }), { type: 'SPACE' })
    expect(next.game.status).toBe(to)
  })

  it.each([STATUS.GAME_OVER, STATUS.WON])('desde %s empieza una partida nueva', (status) => {
    const next = reducer(withGame({ status, score: 7 }, 7), { type: 'SPACE' })
    expect(next.game.status).toBe(STATUS.PLAYING)
    expect(next.game.score).toBe(0)
    expect(next.game.snake).toHaveLength(3)
    expect(next.best).toBe(7)
  })
})

describe('reducer: TURN', () => {
  it('la primera flecha arranca la partida y gira', () => {
    const next = reducer(withGame(), { type: 'TURN', direction: 'UP' })
    expect(next.game.status).toBe(STATUS.PLAYING)
    expect(next.game.nextDirection).toBe('UP')
  })

  it.each([STATUS.PAUSED, STATUS.GAME_OVER, STATUS.WON])('se ignora en %s', (status) => {
    const state = withGame({ status })
    expect(reducer(state, { type: 'TURN', direction: 'UP' })).toBe(state)
  })
})

describe('reducer: TICK', () => {
  it('mueve la serpiente', () => {
    const state = withGame({ status: STATUS.PLAYING, food: { x: 0, y: 0 } })
    const next = reducer(state, { type: 'TICK' })
    expect(next.game.snake[0]).toEqual({ x: 6, y: 5 })
  })

  it('actualiza el récord al superarlo', () => {
    const state = withGame({ status: STATUS.PLAYING, score: 2, food: { x: 6, y: 5 } }, 2)
    expect(reducer(state, { type: 'TICK' }).best).toBe(3)
  })

  it('no baja el récord si la puntuación es menor', () => {
    const state = withGame({ status: STATUS.PLAYING, food: { x: 6, y: 5 } }, 10)
    expect(reducer(state, { type: 'TICK' }).best).toBe(10)
  })
})

it('ignora acciones desconocidas', () => {
  const state = withGame()
  expect(reducer(state, { type: 'NADA' })).toBe(state)
})
