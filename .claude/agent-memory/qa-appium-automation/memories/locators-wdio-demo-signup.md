---
name: locators-wdio-demo-signup
description: Locators e regras de validação da aba Sign up (dentro da tela de Login) do WebdriverIO Demo App, verificados em 2026-09-14
metadata:
  type: project
---

# Aba Sign up (dentro da tela de Login) — verificado em 2026-09-14

App `com.wdiodemoapp` v1.0.8. Sign up **não é uma tela**: é uma aba dentro de `~Login-screen`, então
o acesso é `goToTab(baseElements.tab_login)` + clique em `~button-sign-up-container`. Page objects
ficam em `tests/pages/login/` — **não criar `tests/pages/signup/`**.

## Campos — a aba tem exatamente três

| Elemento                     | Locator                  |
| :--------------------------- | :----------------------- |
| Campo e-mail (compartilhado) | `~input-email`           |
| Campo senha (compartilhado)  | `~input-password`        |
| Campo confirmar senha        | `~input-repeat-password` |
| Botão SIGN UP                | `~button-SIGN UP`        |

Todos com `accessibility id` limpo (nível 1). Os três inputs compartilham o mesmo
`resourceId: RNE__Input__text-input`, então o `id` não desambigua — igual ao Login.

**Re-verificado em 2026-09-17 na BrowserStack** (Google Pixel 7 Pro / Android 13, device real):
`generate_locators` devolveu exatamente os mesmos `accessibility id` do emulador, e os dois xpath de
alerta (`You successfully signed up!` e `You are logged in!`) mais o `OK` resolveram igual. Até agora
**nenhum locator deste app divergiu entre emulador e device real da BS** — a re-inspeção na BS foi
confirmação, não correção. Armadilhas do MCP nesse ambiente em
[[mcp-na-browserstack-gestos-limitados]].

## Validações reais do formulário (confirmadas no app)

Diferente da tela de Forms, esta aba **valida de verdade**:

| Cenário                        | Mensagem em vermelho, abaixo do campo            |
| :----------------------------- | :----------------------------------------------- |
| Confirmação diferente da senha | `Please enter the same password`                 |
| E-mail sem `@` **ou vazio**    | `Please enter a valid email address`             |
| Tudo válido                    | alerta nativo `You successfully signed up!` + OK |

E-mail vazio e e-mail inválido produzem **a mesma** mensagem — não rendem dois cenários distintos.
As mensagens não têm accessibility id (são `TextView` só com texto), daí o xpath
`@text or @label` — nível 4 da prioridade, é o melhor disponível. Recomendação para a squad:
adicionar `testID` nas mensagens de erro.

## Quirk importante: a mensagem de erro não é limpa por navegação

O estado do formulário (valores **e** mensagens de erro) sobrevive a:

- trocar de aba inferior (Home → Login) e voltar;
- trocar entre as abas Login ↔ Sign up;
- digitar um valor válido no campo (a mensagem continua na tela).

A mensagem só é recalculada **no submit**. Consequência prática, e é o que sustenta os asserts:
qualquer mensagem visível **logo depois de um clique em SIGN UP** reflete aquele submit, nunca um
resíduo. Por isso não precisei de reset de app no `Before` — mas todo assert de erro tem de vir
depois do submit do próprio cenário, e eu somo um `I.dontSeeElement(text_signUpSuccess)` para provar
que o cadastro foi bloqueado. Ver [[estado-do-app-nao-reseta]] e
[[estado-de-tela-persiste-entre-abas]].

Outro efeito: o app reabre na **última aba usada** (Login ou Sign up), então o `Before` tem de
clicar explicitamente na aba desejada.

## Onde está automatizado

`tests/specs/signup_tests.ts` (5 cenários), page object em
`tests/pages/login/login.page.ts` (`goToSignUpTab`, `validateSignUpScreen`, `fillSignUpForm`,
`doSignUp`, `doSignUpWithMismatchedPassword`, `doSignUpWithInvalidEmail`, `validateSignUpSuccess`,
`validatePasswordMismatchError`, `validateInvalidEmailError`).

O 5º cenário (2026-09-17) encadeia cadastro + login com as mesmas credenciais e leva três tags,
`@poc` + `@login` + `@signup`: a tela é Login pela _Resolução por tela_, mas o spec é o de signup.
Ele reusa `doSignUp` + `validateSignUpSuccess` + `doLogin` + `validateLoginSuccess` sem nenhum
método novo — `validateSignUpSuccess` já fecha o alerta antes da troca de aba, que é o que a
observação do CT pedia. Para rodar só ele: `npm run test:bs -- 'Cadastra um usuario'` (grep por
título; qualquer uma das três tags arrastaria cenários vizinhos).

`basePage.closeAlert(time = 10)` passou a aceitar um tempo — o `Before` usa `closeAlert(3)` para não
gastar 10 s esperando um alerta que quase nunca existe.
