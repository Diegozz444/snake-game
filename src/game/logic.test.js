import { describe, expect, it } from 'vitest'
import { STATUS } from './constants.js'
import { changeDirection, createInitialState, randomFood, step } from './logic.js'

// Estado en juego con la serpiente y la comida que queramos.
function playing(overrides = {}) {
  return { ...createInitialState(10, () => 0), status: STATUS.PLAYING, ...overrides }
}

describe('createInitialState', () => {
  it('crea una serpiente de 3 en el centro mirando a la derecha', () => {
    const state = createInitialState(20, () => 0)
    expect(state.snake).toEqual([
      { x: 10, y: 10 },
      { x: 9, y: 10 },
      { x: 8, y: 10 },
    ])
    expect(state.direction).toBe('RIGHT')
    expect(state.score).toBe(0)
    expect(state.status).toBe(STATUS.READY)
  })

  it('no pone la comida encima de la serpiente', () => {
    const state = createInitialState(20, () => 0)
    expect(state.snake).not.toContainEqual(state.food)
  })
})

describe('changeDirection', () => {
  it('permite girar 90°', () => {
    expect(changeDirection(playing(), 'UP').nextDirection).toBe('UP')
  })

  it('ignora el giro de 180°', () => {
    expect(changeDirection(playing(), 'LEFT').nextDirection).toBe('RIGHT')
  })

  it('no permite media vuelta con dos teclas rápidas en el mismo tick', () => {
    // Va a la derecha: ↑ y luego ← antes del siguiente tick.
    const state = changeDirection(changeDirection(playing(), 'UP'), 'LEFT')
    expect(state.nextDirection).toBe('UP')
  })

  it('ignora direcciones que no existen', () => {
    const state = playing()
    expect(changeDirection(state, 'DIAGONAL')).toBe(state)
  })
})

describe('step', () => {
  it('mueve la serpiente una casilla sin cambiar su longitud', () => {
    const next = step(playing({ food: { x: 0, y: 0 } }))
    expect(next.snake).toEqual([
      { x: 6, y: 5 },
      { x: 5, y: 5 },
      { x: 4, y: 5 },
    ])
  })

  it('aplica la dirección pedida', () => {
    const next = step(changeDirection(playing({ food: { x: 0, y: 0 } }), 'DOWN'))
    expect(next.snake[0]).toEqual({ x: 5, y: 6 })
    expect(next.direction).toBe('DOWN')
  })

  it('no hace nada si no se está jugando', () => {
    for (const status of [STATUS.READY, STATUS.PAUSED, STATUS.GAME_OVER, STATUS.WON]) {
      const state = playing({ status })
      expect(step(state)).toBe(state)
    }
  })

  it('al comer crece, suma un punto y pone comida nueva en una celda libre', () => {
    const next = step(playing({ food: { x: 6, y: 5 } }))
    expect(next.snake).toHaveLength(4)
    expect(next.snake[0]).toEqual({ x: 6, y: 5 })
    expect(next.score).toBe(1)
    expect(next.status).toBe(STATUS.PLAYING)
    expect(next.snake).not.toContainEqual(next.food)
  })

  it.each([
    ['RIGHT', { x: 9, y: 5 }],
    ['LEFT', { x: 0, y: 5 }],
    ['UP', { x: 5, y: 0 }],
    ['DOWN', { x: 5, y: 9 }],
  ])('game over al chocar con la pared yendo a %s', (direction, head) => {
    const state = playing({
      snake: [head],
      direction,
      nextDirection: direction,
      food: { x: 1, y: 1 },
    })
    expect(step(state).status).toBe(STATUS.GAME_OVER)
  })

  it('game over al chocar consigo misma', () => {
    // Cabeza en (5,5) mirando abajo; la casilla de abajo es su cuerpo.
    const state = playing({
      snake: [
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 6, y: 6 },
        { x: 5, y: 6 },
        { x: 4, y: 6 },
      ],
      direction: 'DOWN',
      nextDirection: 'DOWN',
      food: { x: 0, y: 0 },
    })
    expect(step(state).status).toBe(STATUS.GAME_OVER)
  })

  it('puede entrar en la casilla que deja libre la cola', () => {
    // Serpiente en cuadrado 2x2: la cabeza va hacia donde está la cola.
    const state = playing({
      snake: [
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 6, y: 6 },
        { x: 5, y: 6 },
      ],
      direction: 'DOWN',
      nextDirection: 'DOWN',
      food: { x: 0, y: 0 },
    })
    const next = step(state)
    expect(next.status).toBe(STATUS.PLAYING)
    expect(next.snake[0]).toEqual({ x: 5, y: 6 })
  })

  it('gana al llenar el tablero', () => {
    // Tablero 2x2 con 3 casillas ocupadas: al comer la última, no queda sitio.
    const state = {
      ...playing(),
      size: 2,
      snake: [
        { x: 0, y: 1 },
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
      food: { x: 1, y: 1 },
    }
    const next = step(state)
    expect(next.status).toBe(STATUS.WON)
    expect(next.food).toBeNull()
  })
})

describe('randomFood', () => {
  it('siempre devuelve una celda libre', () => {
    const snake = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
    ]
    for (const r of [0, 0.5, 0.999]) {
      expect(randomFood(snake, 2, () => r)).toEqual({ x: 1, y: 1 })
    }
  })

  it('devuelve null si el tablero está lleno', () => {
    const snake = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ]
    expect(randomFood(snake, 2)).toBeNull()
  })
})
