# POC — Appium MCP + CodeceptJS

Projeto de prova de conceito para validar o uso do Appium MCP na inspeção de elementos nativos e na geração de page objects em CodeceptJS + TypeScript.

A automação cobre o app [WebdriverIO Native Demo App](https://github.com/webdriverio/native-demo-app) e explora cenários de login, forms, drag, swipe e signup.

## Objetivo

- mapear telas com o MCP;
- gerar locators e page objects em padrão reutilizável;
- executar testes em emulador local e em BrowserStack.

## Stack

- Node 22+
- Appium
- CodeceptJS
- TypeScript
- appium-mcp
- Android SDK + adb
- BrowserStack opcional

## Estrutura do projeto

```text
.
├── .claude/
│   └── agent-memory/
│       └── qa-appium-automation/
├── .env.app
├── .env.app.example
├── .gitignore
├── .mcp.json
├── app/
│   └── wdio-native-demo-app.apk
├── capabilities.json
├── BROWSERSTACK.md
├── CASOS-DE-TESTE.md
├── codecept.conf.ts
├── helpers/
│   └── appium_gestures.ts
├── output/
├── package-lock.json
├── package.json
├── README.md
├── steps.d.ts
├── steps_file.ts
├── tests/
│   ├── pages/
│   │   ├── base/
│   │   │   ├── base.elements.ts
│   │   │   └── base.page.ts
│   │   ├── drag/
│   │   │   ├── drag.elements.ts
│   │   │   └── drag.page.ts
│   │   ├── forms/
│   │   │   ├── forms.elements.ts
│   │   │   └── forms.page.ts
│   │   ├── home/
│   │   │   ├── home.elements.ts
│   │   │   └── home.page.ts
│   │   ├── login/
│   │   │   ├── login.elements.ts
│   │   │   └── login.page.ts
│   │   └── ...
│   └── specs/
│       ├── drag_tests.ts
│       ├── forms_flow_tests.ts
│       ├── forms_tests.ts
│       ├── login_tests.ts
│       └── signup_tests.ts
├── tsconfig.json
└── node_modules/
```

## Arquivos principais

- `.mcp.json`: configuração do servidor MCP.
- `capabilities.json`: capabilities usadas pela inspeção do app com MCP.
- `.env.app`: ambiente local e BrowserStack.
- `codecept.conf.ts`: configuração do CodeceptJS/Appium.
- `helpers/appium_gestures.ts`: gestos customizados, como drag/drop.
- `tests/pages`: page objects por feature.
- `tests/specs`: cenários executáveis.

## Requisitos

- Node 22+
- Java 17+
- Android SDK com `adb` no PATH
- emulador Android em execução
- opcional: conta BrowserStack configurada

## Quick start

1. Instalar dependências

```bash
npm install
```

2. Instalar o APK no emulador

```bash
npm run app:install
```

3. Iniciar o Appium local

```bash
npm run start:appium
```

4. Rodar um cenário específico

```bash
npm run test:tags '@login'
```

ou

```bash
npm run test:poc
```

## BrowserStack

O projeto também aceita execução em device real usando BrowserStack. As variáveis esperadas ficam em `.env.app`:

- `BS_USER`
- `BS_KEY`
- `BS_APP_URL`
- `BS_DEVICE`
- `BS_OS_VERSION`

Após configurar, o comando é:

```bash
npm run test:bs -- '@login'
```

A documentação detalhada do fluxo está em [BROWSERSTACK.md](BROWSERSTACK.md).

## Convenções do projeto

- `*.elements.ts` guarda apenas locators.
- `*.page.ts` guarda ações e validações.
- specs ficam em `tests/specs/*_tests.ts`.
- o app mantém estado entre execuções por `NO_RESET=true`.
- os locators priorizam accessibility id, depois id e ui selector.

## Observação

Este repositório é uma POC focada em validar como o Appium MCP pode acelerar a descoberta de elementos e a criação de automações mobile em um projeto realista.
