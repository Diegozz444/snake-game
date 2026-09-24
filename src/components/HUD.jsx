import { STATUS } from '../game/constants.js'

const BUTTON_LABEL = {
  [STATUS.READY]: 'Empezar',
  [STATUS.PLAYING]: 'Pausar',
  [STATUS.PAUSED]: 'Reanudar',
  [STATUS.GAME_OVER]: 'Jugar otra vez',
  [STATUS.WON]: 'Jugar otra vez',
}

function HUD({ score, best, status, onButton }) {
  function handleClick(event) {
    // Sin esto el botón conserva el foco y el siguiente Espacio lo "pulsaría" otra vez.
    event.currentTarget.blur()
    onButton()
  }

  return (
    <div className="hud">
      <div className="stat">
        <span className="stat-label">Puntos</span>
        <span className="stat-value">{score}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Récord</span>
        <span className="stat-value">{best}</span>
      </div>
      <button type="button" className="hud-button" onClick={handleClick}>
        {BUTTON_LABEL[status]}
      </button>
    </div>
  )
}

export default HUD
