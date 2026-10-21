---
name: locators-wdio-demo-drag
description: Locators verificados da tela Drag and Drop do WebdriverIO Native Demo App — peças, alvos, renew e tela de sucesso, verificados em 2026-09-14
metadata:
  type: project
---

# Tela Drag and Drop — locators verificados

App `com.wdiodemoapp` v1.0.8 · verificado em **2026-09-14** via `generate_locators`,
`appium_get_page_source` e `appium_find_element` (appium-mcp 1.94.0). Escritos em
`tests/pages/drag/drag.elements.ts`.

**Why:** era a última tela de gesto não mapeada da POC. Tudo que importa tem `accessibility id`
limpo e **previsível por posição**, então nenhum locator da tela precisa de índice posicional.

**How to apply:** reusar de `drag.elements.ts`. O par peça/alvo é gerado por função a partir da
posição — ver [[locators-wdio-demo-app]] para as outras telas.

## Estrutura

| Elemento          | Locator                                                 |
| :---------------- | :------------------------------------------------------ |
| Container da tela | `~Drag-drop-screen`                                     |
| Peça na bandeja   | `~drag-<pos>`                                           |
| Alvo na grade     | `~drop-<pos>`                                           |
| Reiniciar (ícone) | `~renew`                                                |
| Botão Retry       | `~button-Retry`                                         |
| Título de sucesso | `//*[@text="Congratulations" or @label="..."]`          |
| Texto de sucesso  | `You made it, click retry if you want to try it again.` |

`<pos>` é coluna + linha: `l1 c1 r1 l2 c2 r2 l3 c3 r3` — 9 peças, 9 alvos, nomes espelhados.
Nenhum dos dois textos de sucesso tem accessibility id (são `TextView` só com texto), daí o xpath.

## Quirks da tela

- **A bandeja é embaralhada a cada reinício.** Na inspeção a ordem era
  `l2 r3 r1 c1 c3 r2 / c2 l1 l3`. O `accessibility id` não muda com ela — qualquer locator por
  posição/índice na bandeja quebra na execução seguinte.
- **A peça sai da árvore quando encaixa.** É a prova de que o drag valeu:
  `waitForInvisible('~drag-l1')` passa porque o elemento deixa de existir. Consequência útil:
  **tabuleiro vazio ⇔ as 9 `~drag-*` presentes**.
- **A tela de sucesso substitui o tabuleiro inteiro** — os `~drop-*` e as peças desaparecem, sobram
  Congratulations + texto + `~button-Retry`.
- ⚠️ **`~renew` continua na árvore na tela de sucesso, mas o toque nele não faz nada.** Verificado
  em 2026-09-14: `find_element` resolve, `tap` responde `Successfully tapped`, e a tela de sucesso
  fica exatamente igual. Só `~button-Retry` devolve o tabuleiro. Mais um caso de
  "`Successfully tapped` não prova que o app reagiu".
- **`~renew` funciona no tabuleiro parcial** — devolve as peças já encaixadas para a bandeja.

Daí a ordem de `dragPage.ensureEmptyBoard()`: `tryTo` no Retry **primeiro** (cobre a tela de
sucesso), depois `renew` (limpa encaixe parcial). Ver [[estado-do-app-nao-reseta]].
