---
name: drag-and-drop-no-codeceptjs
description: O helper Appium do CodeceptJS não tem dragAndDrop — o gesto vive em helpers/appium_gestures.ts como I.dragElementToElement, criado e validado em 2026-09-14
metadata:
  type: project
---

# Drag and drop no CodeceptJS + Appium

O helper `Appium` do CodeceptJS **não expõe `dragAndDrop`**. O gesto foi implementado em
`helpers/appium_gestures.ts` como `I.dragElementToElement(origem, destino)` e registrado em
`codecept.conf.ts` (`AppiumGestures: { require: "./helpers/appium_gestures.ts" }`).
Criado e validado em **2026-09-14** com a tela Drag ([[locators-wdio-demo-drag]]).

**Why:** o gesto precisa do centro de dois elementos, ou seja **dois `await` de bounding rect antes
de uma única ação**. Em um step do ator (`steps_file.ts`) esses awaits entram na fila do cenário
fora de ordem e o gesto dispara com o destino vazio — falha silenciosa, sem erro. Dentro de um
helper o driver é acessado direto (`this.helpers["Appium"].browser`), os awaits são promises comuns
na ordem escrita, e o gesto inteiro vira **um passo atômico** — então os page objects continuam
síncronos, sem `async`/`await`.

**How to apply:**

- Qualquer gesto que o helper Appium não tenha e que precise de coordenadas de elemento vai em
  `helpers/appium_gestures.ts`, **nunca** em `steps_file.ts`.
- **Depois de mexer em `helpers/` ou `steps_file.ts`, regenerar os tipos** ou o `tsc` não conhece o
  método novo: `npx dotenv -e .env.app -- codeceptjs def -c ./codecept.conf.ts`. O
  `steps.d.ts` passa a trazer `interface Methods extends Appium, AppiumGestures {}`.
- O helper aceita os mesmos locators do CodeceptJS (`~accessibility-id`, xpath) porque repassa a
  string para `driver.$()` do WebdriverIO.

## A sequência que funciona

W3C `performActions` com `pointerType: "touch"`: `pointerMove` para a origem → `pointerDown` →
`pause` 800 ms (o long press que inicia o arrasto) → `pointerMove` de 1200 ms até o destino →
`pause` 200 ms → `pointerUp`, e `releaseActions()` no fim. É a mesma forma do
`appium_drag_and_drop` do MCP, que serviu de referência na inspeção.

O `pause` inicial não é enfeite: sem o long press o React Native não entra em modo de arrasto e o
gesto vira um tap.

## Não confundir com o helper do MCP

`mcp__appium-mcp__appium_drag_and_drop` é ferramenta de **inspeção** — serve para descobrir se o
arrasto funciona e o que aparece na tela depois. O entregável é sempre
`I.dragElementToElement`. Ver [[mcp-e-testes-em-sessoes-separadas]].
