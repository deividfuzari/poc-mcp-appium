---
name: io-appium-settings-quebra-a-suite
description: Depois de usar o MCP, a suíte falha com "Cannot start the io.appium.settings application" — a correção é adb uninstall io.appium.settings
metadata:
  type: project
---

# `io.appium.settings` quebra a criação de sessão depois do MCP

Sintoma (visto em 2026-09-11, ao rodar a suíte logo depois de uma inspeção pelo MCP):

```
Cannot start the 'io.appium.settings' application ...
Error: Activity class {io.appium.settings/io.appium.settings.Settings} does not exist.
Error: Can't connect to WebDriver.
```

O CodeceptJS ainda mostra por cima um `Cannot read properties of undefined (reading 'waitUntil')`
no primeiro `waitForElement` do `Before` — **isso é ruído**: a sessão nunca subiu, não é problema
de locator.

**Why:** o `appium-mcp` roda drivers embarcados com sua própria versão do
`appium-uiautomator2-driver` e instala o helper `io.appium.settings` do emulador. Quando a versão
que o servidor Appium local (`npm run start:appium`) espera é outra, o pacote fica meio instalado —
presente em `pm list packages`, mas sem a activity `Settings`.

**How to apply:** ao ver esse erro, não mexa no spec nem nos locators:

```bash
adb uninstall io.appium.settings   # o driver reinstala a versão certa na próxima sessão
npm run test:tags '@forms'
```

Relacionado a [[mcp-e-testes-em-sessoes-separadas]] — é o mesmo conflito MCP × suíte, mas indo além
da disputa pelo device: o MCP deixa resíduo de estado no emulador.
