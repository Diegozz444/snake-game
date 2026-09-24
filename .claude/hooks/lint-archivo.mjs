// Hook PostToolUse: después de que Claude edite un .js/.jsx de src/, le pasa oxlint.
// Si hay problemas, sale con código 2: Claude Code le enseña a Claude el mensaje de stderr
// para que los corrija en el momento.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const entrada = JSON.parse(readFileSync(0, 'utf8'))
const archivo = entrada.tool_input?.file_path ?? ''
const proyecto = process.env.CLAUDE_PROJECT_DIR ?? process.cwd()
const ruta = relative(proyecto, archivo)

if (!/^src\/.*\.jsx?$/.test(ruta)) process.exit(0)

try {
  execFileSync(join(proyecto, 'node_modules/.bin/oxlint'), ['--deny-warnings', ruta], {
    cwd: proyecto,
    encoding: 'utf8',
  })
} catch (error) {
  console.error(`oxlint encontró problemas en ${ruta}. Corrígelos:\n${error.stdout ?? error.message}`)
  process.exit(2)
}
