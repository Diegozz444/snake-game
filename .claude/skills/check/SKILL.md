---
name: check
description: Ejecuta los tests y el lint del proyecto y resume si está listo para commit.
disable-model-invocation: true
allowed-tools: Bash(npm test), Bash(npm run lint)
---

# Comprobar el proyecto

Cambios actuales en git:

!`git status --short`

1. Ejecuta `npm test` y después `npm run lint`.
2. Responde en español con este formato, sin nada más:

   - **Tests:** ✅ N pasan / ❌ N fallan (nombra los que fallan)
   - **Lint:** ✅ sin errores / ❌ N problemas (archivo y línea)
   - **Veredicto:** listo para commit, o qué hay que arreglar primero.

3. Si algo falla, explica la causa probable en una o dos frases.
   **No modifiques ningún archivo**: solo informa. El usuario decide si arreglarlo.
