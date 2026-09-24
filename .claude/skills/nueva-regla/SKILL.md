---
name: nueva-regla
description: Flujo para añadir o cambiar una regla o mecánica del juego Snake (velocidad, puntuación, obstáculos, atravesar paredes...). Úsala siempre que la tarea cambie cómo se juega.
argument-hint: "[descripción de la regla]"
---

# Añadir o cambiar una regla del juego

Regla pedida: $ARGUMENTS

Sigue estos pasos en orden:

1. **Diseño.** Decide qué cambia en el estado del juego y en qué funciones de `src/game/`.
   Si la regla es ambigua (por ejemplo, cuánto sube la velocidad), pregunta antes de programar.
2. **Test primero.** Añade en `src/game/logic.test.js` los tests que describen la regla.
   Ejecuta `npm test` y comprueba que **fallan** (si pasan, no están probando nada nuevo).
3. **Implementa** la regla en `src/game/` con funciones puras. Las constantes nuevas van en `constants.js`.
4. **Conecta con React** solo si hace falta: el hook `useSnakeGame.js` y, si hay algo nuevo que mostrar,
   los componentes. Si cambia el reducer, añade su test en `src/hooks/useSnakeGame.test.js`.
5. **Verifica.** `npm test` y `npm run lint` deben pasar.
6. **Documenta.** Añade la regla a los requisitos de `docs/ONBOARDING.md`.
7. **Resume** en español qué cambió y cómo probarlo a mano en el navegador. No hagas commit sin que te lo pidan.
