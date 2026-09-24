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

*(Continúa en el Paso 4)*
