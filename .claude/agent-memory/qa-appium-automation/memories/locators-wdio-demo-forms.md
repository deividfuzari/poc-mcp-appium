---
name: locators-wdio-demo-forms
description: Locators e comportamento da tela Forms do WebdriverIO Native Demo App (com.wdiodemoapp), verificados em 2026-09-11
metadata:
  type: project
---

# WebdriverIO Native Demo App — tela Forms

App `com.wdiodemoapp` v1.0.8 · verificado em **2026-09-11** via `generate_locators` +
`appium_find_element` (appium-mcp 1.94.0). Já escritos em
`tests/pages/forms/forms.elements.ts`. Complementa [[locators-wdio-demo-app]].

| Elemento | Locator | Nível |
| :- | :- | :- |
| Container da tela | `~Forms-screen` | 1 |
| Input de texto | `~text-input` | 1 |
| Resultado do input ("You have typed:") | `~input-text-result` | 1 |
| Switch | `~switch` | 1 |
| Texto de estado do switch | `~switch-text` | 1 |
| Dropdown (abre diálogo nativo) | `~Dropdown` | 1 |
| Botão Active | `~button-Active` | 1 |
| Botão Inactive | `~button-Inactive` | 1 |
| Opção do dropdown | `//android.widget.CheckedTextView[@text="X" or @label="X"]` | 4 |
| Valor selecionado no dropdown | `//android.widget.EditText[@resource-id="text_input" and (@text="X" or @label="X")]` | 4 |

## Comportamento verificado

- **Input:** o texto digitado aparece em `~input-text-result`. Validar com
  `I.waitForText(texto, 30, '~input-text-result')` — um xpath por texto casaria também com o
  próprio `EditText` (dois nós com o mesmo texto).
- **Switch:** o texto é um convite à próxima ação — `Click to turn the switch ON` = switch
  **desligado**; `Click to turn the switch OFF` = **ligado**.
- **Dropdown:** diálogo nativo (`ListView` `android:id/select_dialog_listview`) com
  `Select an item...`, `webdriver.io is awesome`, `Appium is awesome`, `This app is awesome`.
  As linhas são `CheckedTextView` **sem** accessibility id — daí o xpath por texto, escopado na
  classe para não casar com o campo que exibe a seleção. Selecionar `Select an item...` **reseta**
  o campo, o que dá um estado inicial determinístico.
- **Botão Active:** abre alerta nativo (título `This button is`, mensagem
  `This button is active`, botões `ASK ME LATER` / `CANCEL` / `OK`) — `basePage.closeAlert()` fecha.
- **Botão Inactive:** `enabled: true` na árvore, mas **não faz nada** (nenhum alerta, nenhuma
  mudança de tela). É o comportamento esperado do app, não bug.
