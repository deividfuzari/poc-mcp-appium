---
name: locators-wdio-demo-app
description: Locators verificados do WebdriverIO Native Demo App v1.0.8 (com.wdiodemoapp) — tab bar, Home e Login, verificados em 2026-09-10
metadata:
  type: project
---

# WebdriverIO Native Demo App — locators verificados

App: `com.wdiodemoapp` v1.0.8 · activity `com.wdiodemoapp.MainActivity` · verificado em
**2026-09-10** via `generate_locators` (appium-mcp 1.94.0) e `adb shell uiautomator dump`.

**Why:** este é o app da POC. Todas as telas expõem `accessibility id` limpo, então o nível 1 da
prioridade resolve tudo — não precisei descer para xpath em nenhum elemento interativo.

**How to apply:** já estão escritos em `tests/pages/*/*.elements.ts`. Reusar de lá; só re-verificar
se o APK for trocado de versão.

## Tab bar (presente em todas as telas)

`~Home` · `~Webview` · `~Login` · `~Forms` · `~Swipe` · `~Drag` — todas `clickable: true`.
Em `tests/pages/base/base.elements.ts` como `tab_home`, `tab_webview`, etc.

## Home

| Elemento          | Locator                                        |
| :---------------- | :--------------------------------------------- |
| Container da tela | `~Home-screen`                                 |
| Título            | `//*[@text="WEBDRIVER" or @label="WEBDRIVER"]` |
| Link Support      | `//*[@text="Support" or @label="Support"]`     |

O título e o Support **não** têm accessibility id — são `TextView` só com texto, daí o xpath.

## Login

| Elemento          | Locator                                                          |
| :---------------- | :--------------------------------------------------------------- |
| Container da tela | `~Login-screen`                                                  |
| Aba Login         | `~button-login-container`                                        |
| Aba Sign up       | `~button-sign-up-container`                                      |
| Campo e-mail      | `~input-email`                                                   |
| Campo senha       | `~input-password`                                                |
| Botão LOGIN       | `~button-LOGIN`                                                  |
| Botão SIGN UP     | `~button-SIGN UP`                                                |
| Alerta de sucesso | `//*[@text="You are logged in!" or @label="You are logged in!"]` |

⚠️ Os dois inputs compartilham `resourceId: RNE__Input__text-input` (React Native Elements), então o
`id` não desambigua — usar sempre o `accessibility id`. E cuidado com as sugestões de
`-android uiautomator` desta tela: ver [[generate-locators-sugere-locators-instaveis]].

Após o login o app abre um alerta nativo; `basePage.closeAlert()` fecha pelo botão OK.

A aba **Sign up** desta mesma tela tem um terceiro campo (`~input-repeat-password`) e validações
próprias — está detalhada em [[locators-wdio-demo-signup]].

## Outras telas

- `Forms` — mapeada, ver [[locators-wdio-demo-forms]] (2026-09-11).
- `Drag` — mapeada, ver [[locators-wdio-demo-drag]] (2026-09-14).

## Telas ainda não mapeadas

`Swipe` e `Webview` — a Webview vai exigir `appium_context` para trocar de `NATIVE_APP` para o
contexto `WEBVIEW_*`.
