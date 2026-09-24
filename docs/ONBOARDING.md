# Onboarding de Claude Code: construyendo un Snake con React

Esta guía documenta, paso a paso, cómo se construyó este proyecto usando **Claude Code**.
La idea no es solo tener un Snake funcionando, sino entender cada pieza de Claude Code
por el camino: `CLAUDE.md`, la carpeta `.claude/`, permisos, skills, subagentes, hooks y MCPs.

> Entorno usado: WSL2 (Linux) · Node v22.23 · npm 10.9 · git 2.43 · Claude Code 2.1.281

---

## Hoja de ruta

| # | Paso | Concepto de Claude Code que se aprende |
|---|------|----------------------------------------|
| 0 | Qué es Claude Code | El modelo mental: agente + herramientas + permisos |
| 1 | Planteamiento del juego | Planificar antes de programar (plan mode) |
| 2 | Crear el proyecto (Vite + React) y git | Claude ejecutando comandos en tu terminal |
| 3 | `CLAUDE.md` | Memoria del proyecto: las "instrucciones de la casa" |
| 4 | Carpeta `.claude/` y `settings.json` | Permisos y configuración compartida |
| 5 | Programar el juego | El ciclo leer → editar → probar |
| 6 | Tests | Que Claude verifique su propio trabajo |
| 7 | Slash commands y skills | Automatizar tareas que repites |
| 8 | Subagentes | Delegar tareas (ej. un revisor de código) |
| 9 | Hooks | Acciones automáticas (ej. formatear al guardar) |
| 10 | MCPs | Conectar Claude con herramientas externas |
| 11 | Cierre | Resumen y chuleta de comandos |

---

## Paso 0 — ¿Qué es Claude Code?

Claude Code es **Claude (el modelo) viviendo en tu terminal**, con acceso a tu proyecto.
A diferencia de un chat normal, no solo te *dice* qué código escribir: lo **hace**.

Funciona como un bucle:

```
Tú pides algo  →  Claude piensa  →  usa una herramienta  →  mira el resultado  →  repite  →  te responde
```

Las **herramientas** son sus "manos". Las principales:

| Herramienta | Qué hace |
|-------------|----------|
| `Read` | Leer archivos |
| `Write` / `Edit` | Crear o modificar archivos |
| `Bash` | Ejecutar comandos (`npm install`, `git`, tests...) |
| `Grep` / `Glob` | Buscar en el código |
| `Agent` | Lanzar subagentes para tareas en paralelo |
| MCP tools | Herramientas externas que tú conectas (GitHub, navegador, bases de datos...) |

Y todo pasa por un sistema de **permisos**: tú decides qué puede hacer sin preguntarte
y qué necesita tu aprobación. Más adelante lo configuramos en `.claude/settings.json`.

**Idea clave:** Claude Code es tan bueno como el contexto que le das. Por eso existen
`CLAUDE.md`, las skills, etc.: son formas de darle contexto sin repetirte en cada conversación.

---

## Paso 1 — Planteamiento del juego

Antes de escribir código, se define **qué** vamos a construir. Esto es buena práctica
con o sin IA, pero con Claude Code es especialmente útil: un plan claro = menos idas y vueltas.

> 💡 En Claude Code existe el **plan mode** (se activa con `Shift+Tab` hasta ver "plan mode").
> En ese modo Claude solo investiga y propone un plan; no toca archivos hasta que lo apruebas.
> Ideal para tareas grandes o cuando quieres revisar el enfoque antes.

### Requisitos del Snake (MVP)

- Tablero en cuadrícula de 20×20.
- La serpiente se mueve sola en una dirección; se controla con flechas / WASD.
- No se puede girar 180° de golpe (ir de derecha a izquierda directamente).
- Aparece comida en una celda libre aleatoria; al comerla, la serpiente crece y sumas puntos.
- Game over al chocar con una pared o consigo misma.
- Pausa con `Espacio`, reiniciar tras game over.
- Récord (high score) guardado en `localStorage`.

### Decisiones técnicas

| Decisión | Elección | Por qué |
|----------|----------|---------|
| Lenguaje | JavaScript (sin TypeScript) | Lo pediste así; más simple para aprender |
| Framework | React | Pedido |
| Bundler | Vite | Rápido, estándar actual para React (Create React App está deprecado) |
| Render | CSS Grid (divs) | Más fácil de entender que `<canvas>` para empezar |
| Tests | Vitest | Se integra de forma nativa con Vite |

### Arquitectura

La regla de oro: **separar la lógica del juego de la interfaz**.

```
src/
├── game/
│   ├── logic.js        ← funciones puras: mover, comer, colisiones (sin React)
│   └── logic.test.js   ← tests de esas funciones
├── hooks/
│   └── useSnakeGame.js ← conecta la lógica con React (estado, intervalo, teclado)
├── components/
│   ├── Board.jsx       ← dibuja el tablero
│   └── HUD.jsx         ← puntuación, récord, estado
└── App.jsx
```

¿Por qué así? Porque las funciones puras (`logic.js`) son **fáciles de testear**, y
eso le permite a Claude comprobar por sí mismo que su código funciona. Esto será
importante en el paso 6.

### Cómo se hizo el plan (usando plan mode de verdad)

1. Se pidió "quiero crear el plan" y Claude activó **plan mode** (pidiendo permiso).
2. En plan mode Claude **no puede modificar el proyecto**: solo leer, investigar y preguntar.
3. Claude hizo preguntas con opciones (herramienta `AskUserQuestion`). Respuestas:
   - Render → **CSS Grid con divs**
   - Estilo → **minimalista claro**
   - Extras → ninguno, **solo MVP** (los extras se usarán luego para practicar)
4. Claude escribió el plan en `~/.claude/plans/<nombre>.md` y lo presentó para **aprobación**.
5. Al aprobarlo, se sale de plan mode y empieza la implementación.

> 💡 Puedes entrar tú mismo en plan mode con `Shift+Tab` (cicla entre: normal → auto-aceptar ediciones → plan).

---

## Paso 2 — Crear el proyecto (Vite + React) y git

### ¿Qué es Vite?
Una herramienta que crea y sirve proyectos web. En desarrollo arranca al instante y recarga
los cambios en caliente (**HMR**: guardas un archivo y el navegador se actualiza solo).
Para producción, empaqueta todo en la carpeta `dist/`.

### Lo que hizo Claude (y por qué)

| Acción | Motivo |
|--------|--------|
| Generar el proyecto con `npm create vite@latest -- --template react` en una carpeta temporal y copiarlo | Vite no quiere crear en una carpeta no vacía (ya teníamos `docs/`) |
| **Leer lo generado antes de usarlo** | Esta versión de Vite trae `oxlint` en lugar de ESLint: hay que saber qué tenemos |
| Borrar logos, `App.css` y el contador de ejemplo | Empezar limpio |
| `npm install` + `npm i -D vitest` + script `"test": "vitest run"` | Dependencias y framework de tests |
| Verificar: `npm run build`, `npm run lint`, arrancar el servidor | **Nunca dar un paso por terminado sin comprobarlo** |
| `git init` + primer commit | Ver abajo |

### Archivos del proyecto

```
snake-game/
├── index.html         ← la única página HTML; carga src/main.jsx
├── package.json       ← dependencias y scripts (dev, build, lint, test)
├── vite.config.js     ← configuración de Vite (plugin de React)
├── .oxlintrc.json     ← reglas del linter (oxlint, un linter muy rápido escrito en Rust)
├── .gitignore         ← lo que git ignora (node_modules, dist...)
├── public/            ← archivos estáticos tal cual (favicon)
├── src/
│   ├── main.jsx       ← punto de entrada: monta <App /> en el #root del HTML
│   ├── App.jsx        ← componente principal (de momento solo un título)
│   └── index.css      ← estilos globales
└── docs/ONBOARDING.md ← esta guía
```

### Scripts disponibles

| Comando | Qué hace |
|---------|----------|
| `npm run dev` | Servidor de desarrollo en http://localhost:5173 |
| `npm run build` | Compila para producción en `dist/` |
| `npm run lint` | Revisa el código con oxlint |
| `npm test` | Ejecuta los tests con Vitest |

### ¿Por qué git es tan importante con Claude Code?
Claude modifica archivos de verdad. Con git:
- Cada paso queda guardado en un **commit** → si algo sale mal, se vuelve atrás.
- Puedes ver exactamente qué cambió Claude con `git diff`.
- Claude usa el historial para entender el proyecto.

> 💡 Claude Code también tiene **checkpoints**: pulsando `Esc` dos veces (o `/rewind`) puedes
> rebobinar la conversación y los cambios de archivos. Pero git es la red de seguridad de verdad.

---

## Paso 3 — `CLAUDE.md`: la memoria del proyecto

### El problema
Cada sesión de Claude Code empieza **sin recordar nada** de las anteriores. Sin ayuda, tendrías que
repetir siempre "usa JavaScript, los tests se lanzan con `npm test`, la lógica va separada...".

### La solución
`CLAUDE.md` es un archivo Markdown que Claude Code **carga automáticamente al inicio de cada sesión**.
Es el documento de bienvenida para alguien nuevo en el equipo: cómo funciona el proyecto y cómo se trabaja en él.

### Dos formas de crearlo
| Forma | Cuándo |
|-------|--------|
| `/init` | Claude analiza el código y genera un borrador. Ideal en proyectos existentes |
| A mano | Proyectos nuevos o cuando ya tienes claras las reglas (nuestro caso) |

Lo normal es combinarlas: `/init` para el borrador y luego editarlo a mano.

### Qué poner (y qué no)
✅ **Sí:**
- Comandos (cómo arrancar, testear, hacer lint).
- Decisiones de arquitectura que no son obvias leyendo el código.
- Convenciones del equipo ("no añadir dependencias sin preguntar").
- El flujo de trabajo esperado ("pasa los tests antes de terminar").
- Trampas del proyecto (ej.: "usamos oxlint, no ESLint").

❌ **No:**
- Cosas que Claude deduce leyendo el código.
- Documentación larga: todo lo que hay en `CLAUDE.md` ocupa contexto en **cada** conversación.
- Secretos o contraseñas.

> Regla práctica: si te ves corrigiendo a Claude en lo mismo dos veces, eso va al `CLAUDE.md`.

### Jerarquía de memoria
Claude Code lee varios `CLAUDE.md` y los combina:

| Archivo | Alcance | ¿Va en git? |
|---------|---------|-------------|
| `~/.claude/CLAUDE.md` | Todos tus proyectos (tus preferencias personales) | No |
| `./CLAUDE.md` | Este proyecto, compartido con el equipo | **Sí** |
| `./CLAUDE.local.md` | Este proyecto, solo para ti | No (añádelo al `.gitignore`) |
| `subcarpeta/CLAUDE.md` | Se carga cuando Claude trabaja en esa carpeta | Sí |

### Trucos
- `/memory` → ver y editar los archivos de memoria cargados.
- Puedes importar otros archivos con `@ruta`, p. ej. `@docs/arquitectura.md`. Úsalo con
  cuidado: lo importado también ocupa contexto siempre.
- También puedes pedírselo a Claude: *"añade al CLAUDE.md que..."*.

### Nuestro `CLAUDE.md`
Secciones: **Comandos**, **Arquitectura** (lógica pura en `src/game/`, el hook como único puente,
componentes solo de presentación), **Convenciones** (JS, sin dependencias nuevas sin preguntar,
estilo minimalista, español) y **Flujo de trabajo** (tests + lint antes de terminar, actualizar esta guía).

Fíjate en que describe carpetas que **todavía no existen** (`src/game/`, `src/hooks/`). No pasa nada:
así, cuando Claude programe el juego en el Paso 5, ya sabrá dónde va cada cosa.

---

## Paso 4 — La carpeta `.claude/` y los permisos

### Dos carpetas `.claude`
| Carpeta | Para qué |
|---------|----------|
| `~/.claude/` (tu home) | Configuración **personal y global**: tus ajustes, credenciales, historial, planes, checkpoints |
| `./.claude/` (el proyecto) | Configuración **del proyecto**, compartida con el equipo vía git |

Lo que hay en `~/.claude/`:
```
~/.claude/
├── settings.json       ← tus ajustes globales (tema, permisos...)
├── CLAUDE.md           ← tu memoria global (opcional)
├── .credentials.json   ← tu sesión. ¡NUNCA compartir!
├── plans/              ← planes creados en plan mode
├── file-history/       ← checkpoints para /rewind
├── projects/           ← historial de conversaciones y memoria por proyecto
└── skills/             ← tus skills personales
```

Y lo que tendrá el `.claude/` del proyecto al final del onboarding:
```
.claude/
├── settings.json        ← permisos y hooks del equipo (va en git)
├── settings.local.json  ← tus ajustes personales en este proyecto (NO va en git)
├── skills/              ← skills del proyecto (Paso 7)
└── agents/              ← subagentes del proyecto (Paso 8)
```

### Precedencia de los settings (de más a menos prioridad)
1. Políticas de empresa (si las hay)
2. Argumentos de la línea de comandos
3. `.claude/settings.local.json` → personal, este proyecto
4. `.claude/settings.json` → equipo, este proyecto
5. `~/.claude/settings.json` → personal, global

### Permisos: `allow`, `ask`, `deny`
Cada vez que Claude quiere usar una herramienta, Claude Code comprueba estas reglas:

| Lista | Efecto |
|-------|--------|
| `allow` | Se ejecuta **sin preguntar** |
| `ask` | **Siempre** pregunta, aunque otra regla lo permita |
| `deny` | **Prohibido**, siempre gana a las demás |

Nuestro `.claude/settings.json`:
```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": ["Bash(npm run *)", "Bash(npm test)", "Bash(npm test *)",
              "Bash(git status)", "Bash(git diff *)", "Bash(git log *)"],
    "ask":   ["Bash(npm install *)", "Bash(git push *)"],
    "deny":  ["Read(./.env)", "Read(./.env.*)"]
  }
}
```

Por qué cada regla:
- **allow**: comandos seguros que Claude usa constantemente (tests, lint, build, ver el estado de git).
  Así no te interrumpe cada dos por tres.
- **ask**: instalar paquetes cambia las dependencias, y `git push` publica código. Mejor revisarlo.
- **deny**: los `.env` suelen tener claves secretas. Claude no debe leerlos.
- `$schema`: le da autocompletado y validación en VS Code.

Sintaxis de las reglas: `Herramienta(patrón)`. Ejemplos: `Bash(npm run *)`, `Read(./src/**)`,
`Edit(./docs/**)`, `WebFetch(domain:react.dev)`, `mcp__github` (todas las herramientas de un MCP).

### `.gitignore`
Vite ignora `*.local`, pero `settings.local.json` y `CLAUDE.local.md` no terminan en `.local`.
Se añadieron a mano al `.gitignore`.

### Modos de permisos (`Shift+Tab` los cambia)
| Modo | Comportamiento |
|------|----------------|
| Normal | Pregunta antes de editar archivos o ejecutar comandos no permitidos |
| Auto-accept edits | Edita archivos sin preguntar; los comandos siguen pasando por las reglas |
| Plan mode | Solo lee y planifica, no modifica nada |

Además, cuando Claude pide permiso y eliges *"Yes, and don't ask again"*, la regla se guarda
automáticamente en `.claude/settings.local.json`.

### Comandos útiles
- `/permissions` → ver y editar las reglas activas y de dónde viene cada una.
- `/config` → ajustes generales (tema, modelo, etc.).
- `/status` → versión, modelo y archivos de configuración cargados.

---

## Paso 5 — Programar el juego

Se divide en tres partes: **5a** lógica, **5b** hook de React, **5c** componentes.

### 5a — La lógica (`src/game/`)

**`constants.js`**: tamaño del tablero (20), velocidad (150 ms por tick), longitud inicial (3),
vectores de dirección, direcciones opuestas y los estados posibles del juego
(`ready`, `playing`, `paused`, `gameOver`, `won`).

**`logic.js`**: cuatro funciones **puras**, sin React y sin modificar nada; reciben un estado y devuelven uno nuevo.

| Función | Qué hace |
|---------|----------|
| `createInitialState()` | Serpiente de 3 en el centro mirando a la derecha, comida al azar |
| `changeDirection(state, dir)` | Cambia la dirección, salvo si es un giro de 180° |
| `step(state)` | Avanza un tick: mueve, come y crece, detecta choques |
| `randomFood(snake)` | Elige una celda libre al azar, o `null` si el tablero está lleno |

Forma del estado:
```js
{
  size: 20,
  snake: [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }], // snake[0] es la cabeza
  direction: 'RIGHT',      // dirección del último movimiento
  nextDirection: 'RIGHT',  // dirección pedida por el jugador (se aplica en el siguiente tick)
  food: { x: 5, y: 3 },
  score: 0,
  status: 'ready',
}
```

Detalles de diseño que evitan bugs clásicos del Snake:
- **Doble tecla rápida:** si vas a la derecha y pulsas ↑ y ← muy rápido, sin cuidado la serpiente
  daría media vuelta y se mordería. Por eso el giro de 180° se compara con `direction` (el último
  movimiento real) y no con `nextDirection`.
- **La cola se mueve:** si no comes, la cola deja su celda libre en ese mismo tick, así que la cabeza
  puede entrar en ella. Por eso la colisión se comprueba contra el cuerpo **sin la cola**.
- **Azar inyectable:** `random` es un parámetro (por defecto `Math.random`). En los tests se pasa
  una función fija, como `() => 0`, y el resultado es predecible.
- **Victoria:** si no queda ninguna celda libre para la comida, el estado pasa a `won`.

**Verificación:** antes de los tests formales (Paso 6), Claude escribió un script temporal
(fuera del proyecto, en su carpeta *scratchpad*) que simula jugadas: moverse, bloquear el giro de 180°,
comer, chocar con la pared, morderse y tablero lleno. Todo correcto, y `npm run lint` sin errores.

> 💡 **El ciclo de Claude Code:** escribir → **ejecutar para comprobar** → corregir si falla.
> Un código que "parece correcto" no está terminado hasta que se ha comprobado.

### 5b — El hook `useSnakeGame` (`src/hooks/useSnakeGame.js`)

La lógica sabe **qué** pasa en cada movimiento; el hook decide **cuándo** y lo conecta con React.

| Responsabilidad | Cómo |
|-----------------|------|
| Estado | `useReducer` con `{ game, best }` |
| Reloj | `useEffect` + `setInterval` cada 150 ms, **solo** mientras `status === 'playing'` |
| Teclado | `keydown` en `window`: flechas/WASD → `TURN`, Espacio → `SPACE` |
| Récord | Se carga de `localStorage` al iniciar y se guarda cuando cambia |

#### Acciones del reducer
| Acción | Efecto |
|--------|--------|
| `TICK` | Llama a `step()` y actualiza el récord si hace falta |
| `TURN` | Llama a `changeDirection()`; la primera flecha **arranca** la partida; se ignora en pausa o fin |
| `SPACE` | ready → jugar · jugando → pausa · pausa → jugar · fin → partida nueva |

#### Diagrama de estados
```
          flecha / espacio             espacio
 ready ─────────────────────▶ playing ◀────────▶ paused
                                 │
                   choque        │   tablero lleno
                 ┌───────────────┴──────────────┐
                 ▼                              ▼
             gameOver ──── espacio ────▶ (partida nueva, playing)
                                                ▲
                                   won ─────────┘ espacio
```

#### Decisiones
- **`useReducer` en vez de varios `useState`**: todas las transiciones están en un solo sitio, y
  como `reducer` se exporta, se puede probar sin navegador.
- **El intervalo depende de `game.status`**: al pausar o morir se limpia (`clearInterval`) y al
  volver a jugar se crea otro. Así no quedan intervalos "fantasma".
- **`localStorage` dentro de `try/catch`**: en modo privado o con el almacenamiento bloqueado puede
  fallar, y el juego tiene que seguir funcionando.
- **`event.preventDefault()`**: evita que las flechas y el Espacio hagan scroll en la página.
- **Nota sobre StrictMode**: en desarrollo React ejecuta el reducer dos veces para detectar efectos
  secundarios. `step()` usa `Math.random` para la comida, pero no pasa nada: React se queda con uno
  solo de los resultados y ambos parten del mismo estado.

**Verificación:** script temporal que lanza acciones contra el `reducer` exportado y comprueba cada
transición (ready → playing → paused → playing → gameOver → partida nueva). Lint sin errores.

### 5c — Los componentes (`src/components/`, `App.jsx`, `index.css`)

```
App.jsx ── useSnakeGame() ──▶ { game, best, pressSpace }
   ├── <HUD score best status onButton />   ← puntos, récord, botón
   └── <Board game />                       ← cuadrícula 20×20 + mensaje superpuesto
```

| Archivo | Qué hace |
|---------|----------|
| `Board.jsx` | Pinta 400 `<div>` en un CSS Grid. Cada celda recibe su clase: `cell--head`, `cell--snake`, `cell--food` o ninguna. Muestra un mensaje encima según el estado (empezar, pausa, game over, victoria) |
| `HUD.jsx` | Puntos, récord y un botón cuyo texto cambia según el estado (Empezar / Pausar / Reanudar / Jugar otra vez) |
| `App.jsx` | Llama al hook y reparte los datos. No tiene lógica propia |
| `index.css` | Estilo minimalista claro. Los colores son variables CSS en `:root`, fáciles de cambiar |

Detalles:
- **`Set` para el cuerpo**: en vez de recorrer la serpiente para cada una de las 400 celdas, se crea un
  `Set` con las posiciones `"x,y"` y cada consulta es instantánea.
- **`grid-template-columns: repeat(var(--size), 1fr)`**: el tamaño del tablero llega desde JS con una
  variable CSS. Si cambias `BOARD_SIZE`, el grid se adapta solo.
- **`aspect-ratio: 1` + `width: min(100%, 480px)`**: el tablero siempre es cuadrado y cabe en el móvil.
- **Bug evitado en el botón**: tras hacer clic, el botón conserva el foco. Al pulsar Espacio, el navegador
  lo "pulsaría" otra vez **y además** saltaría nuestro atajo de teclado: doble acción. Se soluciona con `blur()`.

### Verificación (y un error por el camino)
- `npm run lint` y `npm run build` ✅.
- No hay navegador headless disponible, así que Claude renderizó `App` en Node con **Vite SSR**
  (`renderToString`) y contó las celdas: 400 celdas, 1 cabeza, 2 de cuerpo, 1 comida, mensaje y botón correctos.
- **Primer intento fallido:** `Cannot find package 'vite'`. El script estaba en la carpeta temporal y
  Node buscaba los paquetes allí. Se arregló ejecutándolo con `node --input-type=module < script`
  desde la carpeta del proyecto.

> 💡 Así trabaja Claude Code: cuando algo falla, lee el error, entiende la causa y lo corrige.
> Tú ves todo el proceso, errores incluidos.

> ⚠️ **Limitación:** Claude todavía no puede *ver* el juego ni jugarlo. Eso se resuelve en el
> **Paso 10** con un MCP de navegador (Playwright). Mientras tanto, la prueba visual la haces tú.

### Prueba manual
`npm run dev` → http://localhost:5173 y comprobar:
- [ ] Una flecha o Espacio arranca la partida.
- [ ] Flechas y WASD mueven la serpiente; no se puede dar media vuelta.
- [ ] Al comer crece y suma un punto.
- [ ] Chocar con la pared o consigo misma → "Game over".
- [ ] Espacio pausa y reanuda; tras el game over, empieza otra partida.
- [ ] El récord se mantiene al recargar la página.

---

## Paso 6 — Tests: que Claude verifique su propio trabajo

### ¿Por qué son tan importantes con Claude Code?
En el Paso 5 Claude verificó el código con **scripts temporales** que luego se borraban. Los tests son esa
misma verificación, pero **permanente**:
- Cada vez que alguien cambie algo, `npm test` dice en un segundo si se ha roto algo.
- Le dan a Claude un **objetivo claro y comprobable**: si le pides una mejora y los tests siguen en verde,
  sabe que no ha roto lo anterior.
- El `CLAUDE.md` lo exige: *"antes de dar una tarea por terminada, `npm test` debe pasar"*.

### Qué se testea
| Archivo | Tests | Qué cubre |
|---------|-------|-----------|
| `src/game/logic.test.js` | 19 | Estado inicial, giros (incluido el de 180° y la doble tecla rápida), movimiento, comer, choques con las 4 paredes y consigo misma, entrar en la casilla de la cola, victoria, comida en celda libre |
| `src/hooks/useSnakeGame.test.js` | 13 | Todas las transiciones del `reducer`: `SPACE`, `TURN` y `TICK`, y el récord |

No se testean los componentes: solo pintan lo que reciben y no tienen reglas. Probarlos exigiría un
navegador simulado (una dependencia nueva) y aportaría poco.

### Trucos que hacen los tests fáciles
- **Funciones puras**: entra un estado, sale otro. Sin navegador, sin esperas, sin mocks.
- **Azar inyectado**: `createInitialState(10, () => 0)` siempre da el mismo resultado.
- **Tablero pequeño** (10×10, o 2×2 para la victoria): los casos límite son fáciles de montar.
- **Helpers** como `playing({ ... })`: crean un estado en juego y solo cambias lo que importa en cada test.
- **`it.each`**: un mismo test con varios datos (las 4 paredes, los estados de `SPACE`...).

### La prueba de fuego: romper el código a propósito
Un test que nunca falla no sirve para nada. Claude borró la regla del giro de 180° en `changeDirection`
y ejecutó `npm test`:

```
× ignora el giro de 180°
× no permite media vuelta con dos teclas rápidas en el mismo tick
AssertionError: expected 'LEFT' to be 'RIGHT'
Tests  2 failed | 17 passed (19)
```

Los tests detectaron el fallo al momento y dijeron **qué** se esperaba y **qué** llegó. Después se restauró
el archivo con `git checkout -- src/game/logic.js` y todo volvió a verde. (Otra razón para usar git.)

### Un tropiezo: `!` con procesos que no terminan
A mitad de este paso se lanzó `! npm run dev` dentro de Claude Code. El servidor **no termina nunca**,
así que la sesión se quedó bloqueada esperándolo y, al interrumpirla, se cortó el trabajo.

> 💡 El prefijo `!` es para comandos que **terminan** (`git status`, `npm test`, `ls`). Para procesos que se
> quedan corriendo, como `npm run dev`, usa **otra terminal** (en VS Code: `` Ctrl+` ``).

> 💡 **Retomar una sesión**: `claude --continue` (o `/resume`) recupera la última conversación. Si empiezas
> una nueva, basta con decir *"me quedé en los tests"*: Claude lee `git status`, el historial de commits y
> esta guía, y reconstruye dónde estaba.

### Resultado
`npm test` → **32 tests en verde** · `npm run lint` → sin errores.

---

## Paso 7 — Slash commands y skills

### El problema
Hay instrucciones que repites a menudo: *"pasa los tests y el lint y dime si puedo hacer commit"*.
Escribirlas cada vez es lento, y cada vez las dirás de forma distinta.

### Skills = slash commands
Una **skill** es una carpeta con un archivo `SKILL.md`: instrucciones guardadas que Claude carga
**solo cuando hacen falta**. A diferencia de `CLAUDE.md`, que ocupa contexto siempre, de cada skill
solo se carga su `description`. El resto se lee cuando se usa.

Cada skill se convierte también en un **slash command**: `.claude/skills/check/` → `/check`.

> 💡 Antes existía `.claude/commands/<nombre>.md` para los comandos. Sigue funcionando, pero ahora
> se usan skills porque pueden hacer lo mismo y más, como incluir varios archivos o que Claude las active sola.

| Dónde | Alcance |
|-------|---------|
| `.claude/skills/<nombre>/SKILL.md` | Este proyecto, compartida con el equipo vía git |
| `~/.claude/skills/<nombre>/SKILL.md` | Todos tus proyectos, solo para ti |

### Anatomía de un `SKILL.md`
```markdown
---
name: check                         ← nombre del comando (/check)
description: Ejecuta los tests...   ← Claude la lee para decidir cuándo usarla
disable-model-invocation: true      ← solo la lanzas tú, Claude nunca por su cuenta
allowed-tools: Bash(npm test), ...  ← permisos extra mientras se ejecuta
argument-hint: "[regla]"            ← pista que ves al escribir el comando
---
Instrucciones en Markdown. $ARGUMENTS = lo que escribas tras el comando.
!`git status --short`  ← se ejecuta ANTES y su salida se inserta en el texto
```

### Dos tipos de skill (las dos están en este proyecto)
| | `/check` | `nueva-regla` |
|---|----------|---------------|
| ¿Quién la activa? | **Solo tú**, escribiendo `/check` | **Claude, por su cuenta**, cuando la tarea encaja con la `description` (o tú con `/nueva-regla ...`) |
| Clave | `disable-model-invocation: true` | Una `description` que explica **cuándo** usarla |
| Qué hace | Lanza `npm test` + `npm run lint` y da un veredicto, **sin tocar archivos** | Impone el flujo del proyecto: test que falla → implementar → verificar → documentar |
| Por qué ese tipo | Es una acción que decides tú, en el momento que tú quieras | Es una forma de trabajar que Claude debe seguir siempre que cambie el juego |

Detalles de diseño:
- **`/check` inyecta `git status`** con `` !`...` ``: Claude ya ve qué archivos han cambiado sin gastar un paso en preguntarlo.
- **`/check` no arregla nada**: solo informa. Una skill que "solo mira" no debe tener efectos inesperados.
- **`nueva-regla` pide que el test falle primero**: si un test nuevo pasa antes de escribir el código, no está
  probando nada nuevo (la misma idea que al romper el código en el Paso 6).

### Cómo usarlas
- `/check` → resumen de tests y lint.
- `/nueva-regla la velocidad aumenta cada 5 puntos` → la lanzas tú con un argumento.
- *"Haz que la serpiente pueda atravesar las paredes"* → Claude reconoce que es una regla del juego y carga `nueva-regla` sola.
- Escribe `/` en Claude Code para ver todos los comandos, incluidos los tuyos.

> 💡 Regla práctica: si le pides a Claude lo mismo por **tercera vez**, conviértelo en una skill.

### Un tropiezo: "no me sale `/check`"
Al probarlo, `/check` no aparecía. La sesión se había abierto desde `~` (la carpeta personal) y no desde
el proyecto. Claude Code carga `CLAUDE.md`, `.claude/settings.json` y `.claude/skills/` **de la carpeta
donde lo arrancas**, así que no veía nada del proyecto.

> 💡 Abre siempre Claude Code **desde la carpeta del proyecto**: `cd ~/PROYECTS/snake-game && claude`.
> Ojo: `claude --continue` retoma la última conversación **de esa carpeta**, no la última en general.

---

*(Continúa en el Paso 8)*
