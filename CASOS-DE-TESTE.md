# CASOS DE TESTE — poc-mcp-appium

Este arquivo é a **entrada de trabalho** do agente `qa-appium-automation`. Aqui eu escrevo o caso de
teste em passo a passo, em português, sem falar de código; o agente lê, inspeciona o app real pelo
Appium MCP e escreve o spec CodeceptJS.

- Este arquivo diz **o que** testar (briefing + passos + validações).
- O [`skills.md`](.claude/agent-memory/qa-appium-automation/skills.md) diz **como** escrever
  (locators, POM, tags, estilo). Em conflito, **`skills.md` sempre ganha** — inclusive contra
  qualquer coisa escrita aqui.

**Princípio do briefing:** eu escrevo **Tela + Estado inicial** e mais nada de estrutura. Arquivo do
spec, page objects, tab de acesso e tag **são derivados da tela** pela
[tabela de resolução](#resolução-por-tela). Nenhum caminho fica chumbado dentro de um CT — troco
`Forms` por `Swipe` no cabeçalho e todo o resto muda com ele.

## Como usar

O [**CT-01**](#ct-01) é um **slot de trabalho reutilizável** — sempre existe um, e é sempre ele que
mando automatizar. Não acumulo fila numerada: terminei um caso, apago os dados do CT-01 e escrevo o
próximo ali mesmo.

1. Preencho os campos do [CT-01](#ct-01) (os passos que eu não usar, deixo em branco).
2. Chamo o agente:

   > Use o agente qa-appium-automation: leia `CASOS-DE-TESTE.md` e automatize o **CT-01**.

3. O agente devolve os arquivos criados, o resultado real da execução e o que ficou pendente.
4. Caso pronto: registro na tabela [Automatizados](#automatizados) e limpo os dados do CT-01.

O agente automatiza **o CT-01 e só ele**. A seção [Exemplo](#exemplo-de-briefing) é modelo de
formato — nunca fila de trabalho.

## Briefing — o que eu escrevo no CT

| Campo              | Obrigatório               | Valores                                                                                                                                     |
| :----------------- | :------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------ |
| **Tela**           | sim                       | Home · Login · Forms · Swipe · Drag · WebView                                                                                               |
| **Plataforma**     | não (default Android)     | Android · iOS · ambas                                                                                                                       |
| **Ambiente**       | não (default `local`)     | `local` = emulador do Android Studio · `browserstack` = device real no BS (aparelho vem de `BS_DEVICE`/`BS_OS_VERSION` do `.env.app`)       |
| **Estado inicial** | sim                       | `Home` (o `Before` garante) · `logado` · `na própria tela`                                                                                  |
| **Dados de teste** | quando aplicável          | "e-mail de `.env.app`" · "senha de `.env.app`" · "texto qualquer" — nunca valor literal sensível                                            |
| **Limpeza (pós)**  | quando aplicável          | "nada a limpar" · "fechar o alerta" · "voltar para Home"                                                                                    |
| **Observações**    | opcional                  | teclado cobre o campo, elemento fora da tela, alerta nativo                                                                                 |
| **Destino**        | opcional — só para forçar | `adicionar em: <arquivo>` · `novo: <nome>_tests.ts`. Vazio = o agente decide pela regra do `skills.md` › _New spec file, or a new Scenario_ |

Nunca escrevo no CT: caminho de page object, nome de elemento, locator, tag do cenário, comando de
execução. Tudo isso sai da tabela abaixo — se eu escrever, viro fonte de erro quando a estrutura
mudar.

## Resolução por tela

O agente lê o campo **Tela** e resolve esta linha. É a única fonte desses caminhos.

| Tela        | Tab de acesso              | Page objects                     | Tags                | Locators já mapeados? |
| :---------- | :------------------------- | :------------------------------- | :------------------ | :-------------------- |
| **Home**    | `baseElements.tab_home`    | `tests/pages/home/`              | `@poc` + `@home`    | ✅ sim                |
| **Login**   | `baseElements.tab_login`   | `tests/pages/login/`             | `@poc` + `@login`   | ✅ sim                |
| **Forms**   | `baseElements.tab_forms`   | `tests/pages/forms/` _(criar)_   | `@poc` + `@forms`   | ❌ inspecionar        |
| **Swipe**   | `baseElements.tab_swipe`   | `tests/pages/swipe/` _(criar)_   | `@poc` + `@swipe`   | ❌ inspecionar        |
| **Drag**    | `baseElements.tab_drag`    | `tests/pages/drag/` _(criar)_    | `@poc` + `@drag`    | ❌ inspecionar        |
| **WebView** | `baseElements.tab_webview` | `tests/pages/webview/` _(criar)_ | `@poc` + `@webview` | ❌ inspecionar        |

Regras que valem para qualquer linha:

- **Spec vai em** `tests/specs/<tela em minúsculo>_tests.ts`.
- **Todo cenário leva `@poc`** mais a tag da tela — é o que faz `npm run test:poc` continuar
  rodando a POC inteira.
- **Acesso à tela** é sempre `basePage.goToTab(baseElements.tab_<tela>)`, nunca clique em locator
  solto.
- **Page object novo** segue a dupla obrigatória `<tela>.elements.ts` + `<tela>.page.ts`
  (formato em `skills.md` › _Page object shape_).

## Vocabulário dos passos

Uso sempre estes verbos — cada um tem uma tradução previsível:

| Verbo no passo            | O agente traduz para                                                                                             |
| :------------------------ | :--------------------------------------------------------------------------------------------------------------- |
| **Acessar**               | `basePage.goToTab(baseElements.tab_<tela>)`                                                                      |
| **Tocar**                 | `basePage.clickInElement(elemento)` — já embute wait + seeElement                                                |
| **Preencher**             | `basePage.fillFormInElement(elemento, dado)`                                                                     |
| **Deslizar**              | gesto de swipe (direção e elemento de referência no passo)                                                       |
| **Arrastar**              | drag and drop de um elemento para outro                                                                          |
| **Esconder teclado**      | `basePage.hideKeyboardGlobal()`                                                                                  |
| **Fechar alerta**         | `basePage.closeAlert()`                                                                                          |
| **Alternar para WebView** | troca de contexto `NATIVE_APP` → `WEBVIEW_*`                                                                     |
| **Validar**               | `I.seeElement` / `I.see` — **todo caso precisa de pelo menos uma**                                               |
| **Aguardar**              | `I.waitForElement`. **Nunca `I.wait` fixo** — só se eu escrever "aguardar N segundos (espera fixa)" e justificar |

Regras de escrita que eu sigo:

- Um comportamento por caso de teste. Dois "Validar" sem relação = dois casos.
- **Listo explicitamente os campos que quero.** Se a tela de Forms tem 6 campos e eu só quero input
  e switch, escrevo só esses dois passos — o agente não completa o resto por conta.
- Dado sensível nunca vai literal no passo; digo de onde vem (`.env.app`).
- Se não souber o texto exato de um botão, escrevo o que aparece na tela entre aspas e deixo o
  agente confirmar no app. Se divergir, ele corrige e me avisa.
- "Abrir o app" não é passo — o Appium já faz isso. Começo em "Acessar".

## Modelo para copiar

```markdown
**Título:** <título curto no infinitivo>

- **Tela:** Forms
- **Plataforma:** Android
- **Ambiente:** local
- **Estado inicial:** Home
- **Dados de teste:** —
- **Limpeza (pós):** nada a limpar
- **Observações:** —

1. Acessar a tela <Tela>
2. Tocar em '<texto do elemento>'
3. Preencher <campo> com <dado>
4. Validar que '<mensagem esperada>' está visível
```

## Exemplo de briefing

> Modelo de **formato**, não fila de trabalho — o agente nunca automatiza isto. É o caso do login,
> já automatizado em [`login_tests.ts`](tests/specs/login_tests.ts). Repare que o cabeçalho tem 6
> linhas e **nenhum caminho**.

### Exemplo — Fazer login com credenciais válidas

- **Tela:** Login
- **Plataforma:** Android
- **Ambiente:** local
- **Estado inicial:** Home
- **Dados de teste:** e-mail e senha de `.env.app`
- **Limpeza (pós):** fechar o alerta
- **Observações:** o teclado cobre o botão de login; precisa esconder antes de tocar

1. Acessar a tela Login
2. Tocar na aba 'Login'
3. Preencher o campo de e-mail com o e-mail de `.env.app`
4. Preencher o campo de senha com a senha de `.env.app`
5. Esconder o teclado
6. Tocar em 'LOGIN'
7. Validar que a mensagem 'You are logged in!' está visível
8. Fechar alerta

---

## CT-01

> **Slot de trabalho.** É este — e só este — que o agente automatiza. Preencho os campos e os passos
> que preciso; o que sobrar em branco é ignorado. Terminado o caso, apago os dados e escrevo o
> próximo aqui.

**Título:** Cadastrar um usuário e fazer login com ele

- **Tela:** Login
- **Plataforma:** Android
- **Ambiente:** browserstack
- **Estado inicial:** Home
- **Dados de teste:** e-mail e senha de `.env.app` — os mesmos no cadastro e no login
- **Limpeza (pós):** fechar o alerta
- **Observações:** o alerta de sucesso do cadastro precisa ser fechado antes de trocar de aba; o
  teclado cobre os botões, então esconder antes de tocar; o app não reseta entre execuções, então a
  aba pode reabrir com os campos já preenchidos
- **Destino:** adicionar em: tests/specs/signup_tests.ts

1. Acessar a tela Login
2. Tocar na aba 'Sign up'
3. Preencher os campos de e-mail, senha e confirmação de senha com o e-mail e a senha de `.env.app`
4. Esconder o teclado
5. Tocar em 'SIGN UP'
6. Validar que a mensagem 'You successfully signed up!' está visível e fechar alerta
7. Tocar na aba 'Login' e fazer login com o mesmo e-mail e senha usados no cadastro
8. Validar que a mensagem 'You are logged in!' está visível e fechar alerta

---

## Automatizados

> Histórico do que já foi automatizado. Sem numeração: o id `CT-01` é reciclado no slot.

| Título                              | Tela  | Spec                         | Tags            |
| :---------------------------------- | :---- | :--------------------------- | :-------------- |
| Validar a home do app               | Home  | `tests/specs/login_tests.ts` | `@poc` `@home`  |
| Fazer login com credenciais válidas | Login | `tests/specs/login_tests.ts` | `@poc` `@login` |
