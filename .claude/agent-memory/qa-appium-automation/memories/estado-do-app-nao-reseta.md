---
name: estado-do-app-nao-reseta
description: Com NO_RESET=true o app reabre exatamente na tela onde parou, incluindo formulários preenchidos — todo spec precisa de um Before que force o estado inicial
metadata:
  type: project
---

# O app reabre onde parou — todo spec precisa de `Before`

Verificado em **2026-09-10**, `com.wdiodemoapp` v1.0.8.

**Why:** `NO_RESET=true` em `.env.app` (e `appium:noReset` no `capabilities.json` do MCP) mantém o
app instalado e **não** limpa o estado. Diferente da web, onde `cy.visit` / `browser_navigate` sempre
recomeça do zero, aqui a sessão nova encontra o app exatamente na última tela — com campos
preenchidos, modais abertos e navegação no meio de um fluxo.

**How to apply:** todo `Feature` começa com um `Before` que força a tela inicial. Nunca assumir onde
o app está, nem no spec nem ao inspecionar pelo MCP.

```typescript
Before(() => {
  basePage.goToTab(baseElements.tab_home);
});
```

## Como isso apareceu

1. Primeira execução da suíte: os dois cenários falharam com
   `element (~Home-screen) still not present on page after 30 sec`. O app estava na tela de Login
   porque foi onde o mapeamento manual tinha parado. O screenshot em `output/` mostrou isso na hora.
2. Depois de adicionar o `Before`, os dois passaram em ~10 s.
3. Mais tarde, a sessão do MCP abriu o app **na tela de Login já preenchida** com
   `qa.poc@smartfit.com` — resíduo do teste que tinha acabado de rodar. Foi isso que gerou o locator
   ruim descrito em [[generate-locators-sugere-locators-instaveis]].

## Quando desligar

`NO_RESET=false` só quando o teste realmente precisar de instalação limpa. Custa ~30 s por sessão
com este APK de 28 MB.
