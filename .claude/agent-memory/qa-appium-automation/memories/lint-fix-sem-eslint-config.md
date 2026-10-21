---
name: lint-fix-sem-eslint-config
description: npm run lint / lint:fix falha no projeto por falta de eslint.config.js (ESLint 9); e npm run format reformata TODO o repo, inclusive CASOS-DE-TESTE.md
metadata:
  type: project
---

# `npm run lint:fix` está quebrado; `npm run format` alcança o repo inteiro

Verificado em 2026-09-11.

- **`npm run lint` / `lint:fix`** morrem com
  `ESLint couldn't find an eslint.config.(js|mjs|cjs) file` — o projeto não tem nenhum config de
  ESLint (nem flat, nem `.eslintrc.*`), embora o plugin e o parser estejam no `package.json`.
  Problema pré-existente, não relacionado a nenhum spec. Rodar `npm run format` e relatar o lint
  como indisponível, em vez de tentar criar um config por conta.
- **`npm run format`** é `prettier --write "**/*.{ts,js,json,md}"` — sem `.prettierrc` e sem
  `.prettierignore`, então ele reescreve **todos** os arquivos do repo, inclusive `README.md` e
  `CASOS-DE-TESTE.md` (que o usuário mantém à mão). O efeito nos `.md` é só cosmético (alinhamento
  de tabela, aspas/ponto-e-vírgula nos `.ts`), mas **avisar** o usuário quando isso acontecer.

**How to apply:** ao finalizar uma automação, rodar `npm run format`, tentar `npm run lint:fix` e,
se ele quebrar por falta de config, reportar como pendência de ambiente.
