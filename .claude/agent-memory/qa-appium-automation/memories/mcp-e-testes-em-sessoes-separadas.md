---
name: mcp-e-testes-em-sessoes-separadas
description: O appium-mcp roda drivers embarcados e cria sessão própria sem servidor Appium; a suíte CodeceptJS usa um servidor separado — as duas competem pelo mesmo device
metadata:
  type: project
---

# MCP e suíte rodam em sessões Appium separadas

Verificado em **2026-09-10**, appium-mcp 1.94.0.

**Why:** é a diferença estrutural entre este setup e o do `artemis` (Playwright MCP + Cypress). Quem
assume que o MCP conversa com a suíte perde tempo procurando estado que não existe, ou trava o
device com uma sessão pendurada.

**How to apply:** inspecionar pelo MCP → `appium_session_management action=delete` → só então rodar
`npm run test:*`.

## Os dois modos

| Modo                  | Quando                | Precisa `npm run start:appium`?               |
| :-------------------- | :-------------------- | :-------------------------------------------- |
| **Embedded** (padrão) | sem `remoteServerUrl` | ❌ o MCP embarca `appium-uiautomator2-driver` |
| **Remote**            | com `remoteServerUrl` | ✅                                            |

Prova coletada: com a porta 4723 sem nada respondendo, `appium_session_management action=create`
funcionou e apareceu no device um processo
`io.appium.uiautomator2.server.test/androidx.test.runner.AndroidJUnitRunner` — o driver instalado e
subido pelo próprio MCP.

## Consequências práticas

- O login que eu fizer inspecionando **não** existe para a suíte, e vice-versa.
- As duas sessões disputam o mesmo emulador. Sessão do MCP viva = suíte falhando ou device travado.
- O MCP **não sobe emulador**. `adb devices` tem que listar algo antes de `select_device`.
- `APPIUM_MCP_ON_CLIENT_DISCONNECT` tem default `delete_all`, mas não depender disso: encerrar
  explicitamente.

## Custo de contexto das tools de inspeção

Medido na tela de Login: o page source tem ~22 KB (~5,6k tokens), 63 nós, dos quais só 31 têm
`content-desc` ou `text`. `generate_locators` devolve só os interagíveis, já com as quatro
estratégias e `clickable`/`enabled`/`displayed`. Por isso `generate_locators` é o padrão para
mapear, e `appium_get_page_source` fica como exceção.
