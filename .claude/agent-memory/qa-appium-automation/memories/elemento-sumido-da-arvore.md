---
name: elemento-sumido-da-arvore
description: Em mobile um elemento coberto (teclado, modal) sai da árvore de UI e find_element falha — não é locator ruim; verificado em 2026-09-10
metadata:
  type: project
---

# Elemento coberto **some** da árvore — falso negativo no `find_element`

Verificado em **2026-09-10**, `com.wdiodemoapp` v1.0.8, appium-mcp 1.94.0.

**Why:** na web, um elemento coberto continua no DOM e o seletor resolve. Em mobile a árvore de UI
é reconstruída conforme o que está efetivamente renderizado — o que está coberto **deixa de
existir** para o Appium. Um `find_element` que falha por isso parece locator ruim, e trocar o
locator "para consertar" é o erro que isso evita.

**How to apply:** ao receber `could not be located`, olhar primeiro o estado da tela (teclado
aberto? modal? alerta?). Se houver algo cobrindo, dispensar e revalidar **com o mesmo locator**.
Só concluir que o locator é ruim com a tela limpa e ociosa.

## Sequência real

```
1. find_element(~input-email)   → elementId ...005c        ✅
2. gesture(tap, ...005c)        → "Successfully tapped"    ✅  (abriu o teclado)
3. find_element(~Home)          → ❌ An element could not be located
4. gesture(action=back)         → fecha o teclado
5. find_element(~Home)          → elementId ...0025        ✅  mesmo locator!
```

O `~Home` do passo 3 e do passo 5 é **idêntico**. A única diferença foi o teclado virtual cobrindo
a tab bar.

## Como dispensar cada obstáculo

| Obstáculo                 | Como remover                                                                        |
| :------------------------ | :---------------------------------------------------------------------------------- |
| Teclado virtual           | `appium_gesture action=back` ou `appium_mobile_keyboard action=hide`                |
| Alerta nativo             | `appium_alert action=accept` / `dismiss`                                            |
| Modal do app              | localizar e tocar no botão de fechar                                                |
| Elemento fora da viewport | `appium_gesture action=scroll_to_element` (não é o mesmo caso, mas dá o mesmo erro) |

## Nos specs

O equivalente no CodeceptJS é `basePage.hideKeyboardGlobal()` antes de interagir com a tab bar ou
com um botão no rodapé. É o que `loginPage.doLogin()` já faz antes de clicar em `~button-LOGIN`.

Relacionado: [[generate-locators-sugere-locators-instaveis]], [[estado-do-app-nao-reseta]].
