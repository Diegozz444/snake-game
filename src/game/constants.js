export const BOARD_SIZE = 20
export const TICK_MS = 150
export const INITIAL_LENGTH = 3

// Vectores de movimiento: y crece hacia abajo, como en la pantalla.
export const DIRECTIONS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
}

export const OPPOSITE = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
}

export const STATUS = {
  READY: 'ready',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'gameOver',
  WON: 'won',
}
