---
name: mcp-na-browserstack-gestos-limitados
description: Duas armadilhas do appium-mcp contra device real da BrowserStack — mobile hideKeyboard não existe no driver e o gesto back navega o app — verificadas em 2026-09-17
metadata:
  type: project
---

# appium-mcp na BrowserStack — o que não funciona igual ao emulador

Verificado em **2026-09-17**, sessão MCP remota no Google Pixel 7 Pro / Android 13 (build
`mcp-inspection-ct01`), app `com.wdiodemoapp`.

**Why:** perdi duas rodadas de chamadas achando que era locator quebrado no device real. Não era —
eram limitações do gesto do MCP naquele driver.

## 1. `appium_mobile_keyboard action=hide` falha — e isso NÃO significa que a suíte vai falhar

```
WebDriverError: Unknown mobile command "hideKeyboard".
Only shell,...,performEditorAction,...,unlock commands are supported.
```

O uiautomator2 daquele device não registra `mobile: hideKeyboard`, que é o que o MCP chama. O
CodeceptJS **não** usa esse caminho: `I.hideDeviceKeyboard()` (via `basePage.hideKeyboardGlobal()`)
bate no endpoint legado `/appium/device/hide_keyboard`, que o mesmo device suporta — rodou limpo no
`npm run test:bs` logo depois, no mesmo aparelho.

**How to apply:** falha de `appium_mobile_keyboard` na BS é ruído da inspeção. Não trocar
`hideKeyboardGlobal()` por outra coisa no page object por causa dela.

## 2. `appium_gesture action=back` sem teclado aberto navega o app

`appium_set_value` preenche o campo **sem abrir o teclado**. Mandei `back` para "esconder o teclado"
que não existia e o app voltou da aba Sign up para a **Home** — o `find_element` seguinte de
`~button-SIGN UP` falhou com `could not be located` usando o locator **correto**.

**How to apply:** é a linha 1 da tabela de diagnóstico do `skills.md` ao contrário — antes de culpar
o locator, `appium_screenshot` para ver em que tela o app está. E só usar `back` depois de confirmar
o teclado com `appium_mobile_keyboard action=is_shown`; com `set_value` ele normalmente nem sobe.
Ver [[elemento-sumido-da-arvore]].

## 3. O estado da aba sobrevive dentro da sessão, mesmo com device limpo

Na BS cada sessão instala o app do zero (o `noReset` do `codecept.conf.ts` só vale no local), mas
**dentro** da sessão o quirk continua: voltei para a Home e reentrei em Login, e o app reabriu na
aba Sign up com os três campos ainda preenchidos. Vale o mesmo `Before` de sempre.
Ver [[estado-de-tela-persiste-entre-abas]].
