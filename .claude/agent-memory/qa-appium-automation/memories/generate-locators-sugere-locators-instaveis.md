---
name: generate-locators-sugere-locators-instaveis
description: generate_locators lista todas as estratégias possíveis sem filtrar qualidade — inclui locators derivados do valor atual de campos e índices posicionais, verificado em 2026-09-10
metadata:
  type: project
---

# `generate_locators` não filtra qualidade — eu filtro

Verificado em **2026-09-10** contra `com.wdiodemoapp` v1.0.8, tela de Login, appium-mcp 1.94.0.

**Why:** a tool devolve _todas_ as estratégias que consegue montar para cada elemento. Algumas são
derivadas de conteúdo transitório da tela. Copiar a sugestão sem julgar produz um locator que passa
hoje e quebra na próxima execução.

**How to apply:** ao ler a saída de `generate_locators`, pegar sempre o `accessibility id` quando
existir e descartar as linhas abaixo. Validar a escolha com `appium_find_element` antes de escrever
no `.elements.ts`.

## O caso concreto

O campo de e-mail estava preenchido com os dados de um teste anterior. A saída veio assim:

```json
{
  "contentDesc": "input-email",
  "resourceId": "RNE__Input__text-input",
  "locators": {
    "accessibility id": "input-email", // ✅ usar este
    "xpath": "//android.widget.EditText[@content-desc=\"input-email\"]",
    "-android uiautomator": "new UiSelector().text(\"qa.poc@smartfit.com\")" // ❌ valor digitado
  }
}
```

O campo de senha veio com `new UiSelector().text("••••••••")` — pior ainda, porque muda com o
tamanho da senha.

## Padrões a rejeitar

| Padrão                  | Exemplo real desta tela                                          |
| :---------------------- | :--------------------------------------------------------------- |
| Valor atual de um input | `new UiSelector().text("qa.poc@smartfit.com")`                   |
| Máscara de senha        | `new UiSelector().text("••••••••")`                              |
| Índice posicional       | `.instance(4)` · `(//android.widget.TextView[@text="Login"])[1]` |
| Xpath absoluto longo    | `//...ViewGroup[4]/android.widget.TextView[2]`                   |
| Class name sozinho      | `android.widget.ScrollView`                                      |

## Observação sobre `resourceId`

`RNE__Input__text-input` (React Native Elements) se repete nos dois inputs da tela — o `id` não
desambigua aqui. É mais um motivo para o `accessibility id` ser o nível 1.

Relacionado: [[locators-wdio-demo-app]], [[estado-do-app-nao-reseta]].
