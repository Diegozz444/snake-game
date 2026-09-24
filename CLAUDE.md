# Snake Game

Juego de Snake en React 19 + JavaScript (sin TypeScript), con Vite. Proyecto de aprendizaje de Claude Code:
el proceso se documenta en `docs/ONBOARDING.md`.

## Comandos

- `npm run dev` — servidor de desarrollo (http://localhost:5173)
- `npm test` — tests con Vitest (una ejecución, sin modo watch)
- `npm run lint` — linter (oxlint, no ESLint)
- `npm run build` — build de producción

## Arquitectura

- `src/game/` — lógica del juego en **funciones puras**, sin React ni efectos secundarios. Toda regla del juego va aquí.
- `src/hooks/useSnakeGame.js` — único puente entre la lógica y React (estado, intervalo, teclado, localStorage).
- `src/components/` — componentes de presentación; no contienen reglas del juego.
- Render con CSS Grid (divs), no `<canvas>`.

## Convenciones

- JavaScript con componentes funcionales y hooks. Archivos de componentes en `.jsx`.
- No añadir dependencias nuevas sin preguntar.
- Estilo visual minimalista claro: fondo blanco, colores planos, sin librerías de UI.
- Textos de la interfaz y mensajes de commit en español.

## Flujo de trabajo

- Toda función nueva de `src/game/` lleva su test en `src/game/*.test.js`.
- Antes de dar una tarea por terminada: `npm test` y `npm run lint` deben pasar.
- Al completar un paso del onboarding, añadir su sección a `docs/ONBOARDING.md`.
