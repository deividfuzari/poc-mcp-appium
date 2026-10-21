# Memory — qa-appium-automation

Index only. Every note lives in [`memories/`](memories/) as `<slug>.md` — keep this file as a
one-line-per-note pointer list, never as a place to store content.

- [skills.md](skills.md) — **read this first, every task**: prioridade de locator, arquitetura
  (elements/page/spec), helpers do `base.page`, tagging, fluxo de inspeção pelo MCP, self-healing.

## Locators verificados

- [WebdriverIO Native Demo App](memories/locators-wdio-demo-app.md) — `com.wdiodemoapp` v1.0.8: tab
  bar, Home e Login com accessibility id limpo; Swipe/Drag/Webview ainda não mapeados
  (verificado 2026-09-10).
- [Aba Sign up](memories/locators-wdio-demo-signup.md) — 3 campos (`~input-repeat-password` é o novo);
  valida senha divergente e e-mail inválido de verdade, e a mensagem de erro só é recalculada no
  submit (verificado 2026-09-14; re-confirmado idêntico no device real da BS em 2026-09-17).
- [Tela Forms](memories/locators-wdio-demo-forms.md) — input, switch, dropdown e botões
  Active/Inactive; opções do dropdown só por texto e o Inactive não faz nada (verificado
  2026-09-11).
- [Tela Drag and Drop](memories/locators-wdio-demo-drag.md) — `~drag-<pos>` / `~drop-<pos>` nas 9
  posições; bandeja embaralhada, peça sai da árvore ao encaixar e `~renew` não funciona na tela de
  sucesso (verificado 2026-09-14).

## Armadilhas de locator

- [`generate_locators` não filtra qualidade](memories/generate-locators-sugere-locators-instaveis.md)
  — sugere locator derivado do valor atual do campo (`text("qa.poc@smartfit.com")`) e índices
  posicionais; sempre validar com `appium_find_element` (verificado 2026-09-10).

- [Elemento coberto some da árvore](memories/elemento-sumido-da-arvore.md) — teclado/modal fazem o
  `find_element` falhar com o locator **certo**; dispensar o obstáculo e revalidar antes de trocar
  o locator (verificado 2026-09-10).

## Gestos e arquitetura de teste

- [Drag and drop no CodeceptJS](memories/drag-and-drop-no-codeceptjs.md) — o helper Appium não tem
  `dragAndDrop`; o gesto vive em `helpers/appium_gestures.ts` como `I.dragElementToElement` e exige
  regenerar `steps.d.ts` (criado 2026-09-14).

## Comportamento do app / ambiente

- [O app não reseta entre execuções](memories/estado-do-app-nao-reseta.md) — com `NO_RESET=true`
  reabre na última tela, com formulários preenchidos; todo spec precisa de `Before`.
- [Estado de tela persiste entre abas](memories/estado-de-tela-persiste-entre-abas.md) — o `Before`
  garante a tela, não o estado dos componentes; forçar estado inicial com `tryTo` (2026-09-11).
- [MCP na BrowserStack tem gestos limitados](memories/mcp-na-browserstack-gestos-limitados.md) —
  `mobile: hideKeyboard` não existe no driver do device (mas `I.hideDeviceKeyboard()` funciona) e o
  gesto `back` sem teclado navega o app e disfarça de locator quebrado (2026-09-17).
- [MCP e suíte em sessões separadas](memories/mcp-e-testes-em-sessoes-separadas.md) — MCP usa driver
  embarcado (dispensa `npm run start:appium`), disputa o device com a suíte, e precisa de
  `action=delete` ao terminar.
- [`io.appium.settings` quebra a suíte](memories/io-appium-settings-quebra-a-suite.md) — depois do
  MCP, a sessão não sobe; `adb uninstall io.appium.settings` resolve (2026-09-11).
- [`npm run lint:fix` está quebrado](memories/lint-fix-sem-eslint-config.md) — o projeto não tem
  `eslint.config.js`; só `npm run format` funciona (2026-09-11).

## Como o usuário quer que eu trabalhe

- [Rodar só a tag nova](memories/rodar-so-a-tag-nova.md) — ao encerrar, executar apenas a tag dos
  cenários novos; `test:poc` e `npm test` são comandos do usuário, não do meu fluxo (2026-09-14).
