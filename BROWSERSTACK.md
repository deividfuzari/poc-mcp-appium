# BrowserStack — do emulador local para um device real

Runbook do `poc-mcp-appium`: tudo que foi alterado para rodar testes CodeceptJS **e** inspeção pelo
MCP do Appium num Pixel 7 Pro físico, arquivo por arquivo e com o motivo de cada linha.

Verificado em **17/09/2026** · Device **Google Pixel 7 Pro / Android 13.0** · Plano **App Automate
Device Cloud Pro** (1 thread paralela).

---

## O modelo mental: são dois caminhos independentes

Confundir os dois é a origem de quase toda dúvida. O MCP e a suíte de testes **nunca** compartilham
configuração.

|                                   | Inspeção (MCP)                   | Execução (CodeceptJS)           |
| :-------------------------------- | :------------------------------- | :------------------------------ |
| Serve para                        | descobrir locators               | rodar os testes                 |
| Driver                            | embutido no próprio servidor MCP | servidor Appium separado        |
| Decide o destino                  | **por sessão**, num parâmetro    | **por variável de ambiente**    |
| Lê                                | `capabilities.json`              | `codecept.conf.ts` + `.env.app` |
| Precisa de `npm run start:appium` | nunca                            | só no modo local                |

**A regra que resolve 90% das dúvidas:** o interruptor do MCP é a presença de `remoteServerUrl` na
criação da sessão. O interruptor dos testes é `RUN_ON=browserstack`. Não existe um arquivo único que
controle os dois.

---

## Passo zero (fora do código): o APK precisa morar na BrowserStack

A BrowserStack **não aceita caminho de arquivo local** em `appium:app`. O app tem que ser enviado
para os servidores deles e passa a ser referenciado por um id `bs://`.

```bash
npm run bs:upload
# {"app_url":"bs://65119218dfebfded6983e9a6c19c8312b18e184b"}
```

O `app_url` da resposta vai para `BS_APP_URL` no `.env.app`. **Todo APK novo exige upload novo.**

---

## `.env.app` — a fonte única dos valores

Seis variáveis novas. Nada fica chumbado no conf: trocar de aparelho é editar uma linha aqui.

| Variável        | O que é                 | Por que existe                                                |
| :-------------- | :---------------------- | :------------------------------------------------------------ |
| `BS_USER`       | usuário do App Automate | Autenticação no hub. Ficam em _Account & Profile → Settings_. |
| `BS_KEY`        | access key              | idem                                                          |
| `BS_APP_URL`    | id `bs://…` do upload   | Substitui o caminho do APK local, que a BS rejeita.           |
| `BS_DEVICE`     | `Google Pixel 7 Pro`    | Nome **exato** do catálogo. Nome errado = sessão não aloca.   |
| `BS_OS_VERSION` | `13.0`                  | A combinação device + versão precisa existir no catálogo.     |
| `BS_BUILD`      | rótulo da execução      | Agrupa os runs no dashboard. Sem isso tudo cai num build só.  |

Qualquer uma pode ser sobrescrita na hora de rodar, sem editar arquivo, porque o `dotenv` não
sobrepõe variável que já existe no ambiente:

```bash
BS_DEVICE="Samsung Galaxy S23" npm run test:bs -- '@login'
```

---

## `codecept.conf.ts` — o interruptor dos testes

Nenhum spec, page object ou locator foi alterado. Só o bloco `helpers.Appium` e o log de boot — é
isso que faz o mesmo teste rodar nos dois lugares.

### A flag e o log de destino

```ts
const isBS = process.env.RUN_ON === "browserstack";
const bsDevice = process.env.BS_DEVICE || "Google Pixel 7 Pro";
const bsOsVersion = process.env.BS_OS_VERSION || "13.0";

console.log(
  isBS
    ? `☁️  BrowserStack | ${bsDevice} (Android ${bsOsVersion}) | app: ${process.env.BS_APP_URL}`
    : `🤖 Local | ${process.env.DEVICE_NAME} | APK: ${apkPath}`,
);
```

O log não é enfeite. Com dois destinos, o erro clássico é rodar local achando que está na BS e tirar
conclusão errada do resultado. A primeira linha da saída sempre diz onde o teste está.

### A conexão

| Campo          | Local       | BrowserStack                 | Por que muda                                                           |
| :------------- | :---------- | :--------------------------- | :--------------------------------------------------------------------- |
| `protocol`     | `http`      | `https`                      | Campo **novo** — o conf não tinha.                                     |
| `host`         | `127.0.0.1` | `hub-cloud.browserstack.com` | —                                                                      |
| `port`         | `4723`      | `443`                        | —                                                                      |
| `user` / `key` | ausentes    | do `.env.app`                | Entram **só** no ramo BS, para não mandar `undefined` na sessão local. |
| `app`          | `apkPath`   | `BS_APP_URL`                 | Caminho local é rejeitado pela BS.                                     |

### As capabilities, separadas por ramo

| Capability                                  | Ramo     | Por quê                                                                                           |
| :------------------------------------------ | :------- | :------------------------------------------------------------------------------------------------ |
| `appium:deviceName`                         | só local | Mandar `emulator-5554` para a BS confunde a alocação — lá o aparelho vem de `bstack:options`.     |
| `appium:noReset`                            | só local | Na BS cada sessão já sobe num device limpo; a capability é inócua lá.                             |
| `appium:androidInstallTimeout`              | só local | Instalação local; na BS o app já está no servidor.                                                |
| `bstack:options.deviceName` / `.osVersion`  | só BS    | É assim que a BrowserStack aloca o aparelho.                                                      |
| `bstack:options.projectName` / `.buildName` | só BS    | Organizam a execução no dashboard — é por aqui que você acha a sessão depois.                     |
| `bstack:options.idleTimeout: 300`           | só BS    | **O default é 90s de ociosidade e a sessão morre** com status `TIMEOUT`. 300s é o teto permitido. |
| `bstack:options.video: true`                | só BS    | Gera o vídeo na página da sessão.                                                                 |
| `bstack:options.interactiveDebugging: true` | só BS    | Libera o botão de ver e interagir com o device ao vivo. **Exige `video: true` junto.**            |

---

## `package.json` — dois scripts novos

```json
"test:bs": "RUN_ON=browserstack npx dotenv -e .env.app -- codeceptjs run -c ./codecept.conf.ts --steps --grep",
"bs:upload": "npx dotenv -e .env.app -- sh -c 'curl -u \"$BS_USER:$BS_KEY\" -X POST https://api-cloud.browserstack.com/app-automate/upload -F \"file=@./app/$APK_NAME\"'"
```

O `bs:upload` passa pelo `dotenv` de propósito: as credenciais vêm do `.env.app`, então você nunca
digita a access key no terminal (onde ela ficaria no histórico do shell).

O `test:bs` espelha o `test:tags` que já existia — mesmo formato, mesma posição do `--grep`.

---

## `.gitignore` e `.env.app.example` — a credencial não pode ir para o repo

O `.env.app` passou a ter uma access key real e **não estava no `.gitignore`**. Duas mudanças:

- `.env.app` adicionado ao `.gitignore`.
- `.env.app.example` criado como modelo, com `BS_USER`, `BS_KEY` e `BS_APP_URL` em branco e todo o
  resto preenchido.

**Por que o example não atrapalha:** ele **nunca é carregado**. Os scripts apontam explicitamente
para `.env.app` (`dotenv -e .env.app`). O example é documentação de quais variáveis existem, não
configuração ativa — não tem risco de o projeto pegar valor errado dele.

**Se um dia versionar isso:** o `.gitignore` só vale para arquivo ainda não rastreado. Num repo onde
o `.env.app` já foi commitado, é preciso `git rm --cached .env.app` — e a key já exposta deve ser
rotacionada.

---

## `CASOS-DE-TESTE.md` e `skills.md` — ensinando o agente a escolher

Sem isso, todo pedido de inspeção na BS exigia colar um bloco gigante de instruções na mão — porque
nada no projeto dizia que a BrowserStack existia.

### No intake: campo `Ambiente`

Novo campo no briefing do CT, não obrigatório, **default `local`**:

```markdown
- **Tela:** Forms
- **Plataforma:** Android
- **Ambiente:** local # ou: browserstack
- **Estado inicial:** Home
```

O aparelho não vai no CT — sai de `BS_DEVICE`/`BS_OS_VERSION`. Isso segue o princípio que o arquivo
já tinha: nenhum caminho ou config chumbado dentro de um caso de teste.

### No `skills.md`: o ramo remoto

Seção nova com a tabela local vs browserstack e quatro regras que o agente não teria como deduzir:

1. **`select_device` nunca em modo BS** — ele só enumera device local via `adb`; o aparelho não está
   na máquina.
2. **`appium:app` é obrigatório** — ver a pegadinha abaixo.
3. **Uma thread paralela só** — deletar a sessão do MCP não é higiene, é o que desbloqueia o
   `npm run test:bs`.
4. **`BROWSERSTACK_IDLE_TIMEOUT` não é problema de locator** — é a sessão morrendo de ociosidade. Sem
   essa nota o agente degradaria um locator bom achando que errou.

O ramo `local` não foi tocado: é exatamente o fluxo que já estava documentado.

---

## Onde deliberadamente não mexemos: `.mcp.json` e `capabilities.json`

Essa é a parte que mais confunde, então vale fixar: o `CAPABILITIES_CONFIG` continua apontando para o
`capabilities.json` local, para sempre.

O caminho desse arquivo é lido do ambiente do processo do servidor MCP, fixado quando ele sobe — não
há como trocar numa chamada de ferramenta. E apontar para um arquivo da BS quebraria a inspeção
local, porque é um caminho só.

Não precisa: as capabilities passadas na criação da sessão entram **por último** no merge e
sobrescrevem o arquivo. Um `capabilities.browserstack.json` chegou a ser criado e foi **apagado** —
não era lido por nada e só passava a impressão de ser config.

> **A pegadinha que quebra tudo:** o `capabilities.json` é mesclado **também nas sessões remotas** — a
> flag interna de "servidor remoto" só suprime o udid local, não o arquivo. Como o `appium:app` de lá
> é um caminho de filesystem, **toda sessão na BS tem que sobrescrever `appium:app` com o `bs://`**,
> senão a BrowserStack rejeita.

Opcional, e a única coisa que valeria adicionar ao `.mcp.json`: `REMOTE_SERVER_URL_ALLOW_REGEX`, que
trava o MCP para só conectar em hosts permitidos.

---

## Os comandos

```bash
# local — exige emulador ligado e o servidor Appium
adb devices
npm run start:appium          # terminal separado
npm run test:tags -- '@login'

# BrowserStack — não precisa de nenhum dos dois
npm run test:bs -- '@login'

# separando a execução no dashboard
BS_BUILD="regressao-sprint-12" npm run test:bs -- '@login'
```

### Pré-requisitos, lado a lado

| Precisa de…                              | Local | BrowserStack |
| :--------------------------------------- | :---- | :----------- |
| Emulador ligado (`adb devices`)          | sim   | não          |
| `npm run start:appium` (só p/ os testes) | sim   | não          |
| `BS_USER` / `BS_KEY`                     | não   | sim          |
| APK já enviado (`bs://`)                 | não   | sim          |

---

## Ver o device se mexendo ao vivo

Só existe **enquanto a sessão está rodando**. Antes não aparece; depois vira vídeo gravado.

1. Abrir <https://app-automate.browserstack.com/dashboard>.
2. Conferir no topo: **PARALLEL THREADS · Running** deve estar `1/1`. Se estiver `0/1`, não há sessão
   viva e não há nada para ver.
3. Na coluna de builds à esquerda, abrir o build (ex.: `mcp-inspection`).
4. Clicar na **linha da sessão** — a que mostra o aparelho e o status _Running_.
5. Na página da sessão, clicar no botão azul **"Start an interactive session"**.

**Dois detalhes que custam tempo:**

- **Não existe aba "Builds" na barra lateral** — ela é navegação de produto. A lista de builds é a
  coluna dentro da própria página do App Automate.
- **O botão não fica na página do build**, só na página da sessão. E na interface ele se chama "Start
  an interactive session", não "Interactive Debugging" como na documentação.

A tela do aparelho já aparece ao vivo no mockup de celular assim que a página da sessão abre. O botão
adiciona a possibilidade de _você_ tocar na tela junto com a automação.

**Por que isso combina com o MCP e não com teste:** um teste de 33s termina antes de você abrir o
dashboard — a doc da BrowserStack recomenda usar breakpoint no IDE justamente por isso. Com o MCP não
precisa de breakpoint: a sessão fica naturalmente parada entre um comando e outro, enquanto o agente
lê a árvore de elementos e decide o próximo passo.

Duas limitações da sessão interativa, direto da documentação: funciona **só em portrait** e **não
permite inspecionar elementos pelo dashboard**. A segunda não atrapalha — quem inspeciona é o MCP; o
dashboard é só para assistir.

---

## Pegadinhas, em ordem de quanto doem

| Sintoma                                         | Causa real                                                        | O que fazer                                                      |
| :---------------------------------------------- | :---------------------------------------------------------------- | :--------------------------------------------------------------- |
| Sessão rejeitada com erro de app                | `appium:app` foi o caminho local vindo do `capabilities.json`     | Sobrescrever com `BS_APP_URL` na criação da sessão               |
| `BROWSERSTACK_IDLE_TIMEOUT` ou status `TIMEOUT` | Mais de 90s (ou 300s) de _ociosidade_ — conta pausa, não execução | Recriar a sessão. **Não** mexer nos locators                     |
| Teste fica na fila e não roda                   | Plano permite **1 sessão paralela** e há uma sessão do MCP viva   | `appium_session_management action=delete` antes de rodar a suíte |
| Sessão não aloca o aparelho                     | `BS_DEVICE` ou `BS_OS_VERSION` não batem com o catálogo           | Conferir a combinação exata na API de devices                    |
| Botão de sessão interativa não aparece          | Falta `interactiveDebugging: true`, ou falta `video: true` junto  | As duas capabilities são obrigatórias, em par                    |
| Locator funciona local e falha na BS            | Build de fabricante muda hierarquia de view                       | É um **achado**, não erro de mapeamento — registrar e ajustar    |
| Rodou e o resultado não faz sentido             | Pegou o script errado e rodou no destino errado                   | Ler a primeira linha da saída: `☁️ BrowserStack` ou `🤖 Local`   |

---

## O que foi de fato verificado

Nada aqui é suposição — tudo abaixo foi executado contra a conta e o device reais.

| Checagem                                      | Resultado                                                         |
| :-------------------------------------------- | :---------------------------------------------------------------- |
| Credenciais contra a API da BrowserStack      | HTTP 200 · Device Cloud Pro · 1 thread                            |
| Aparelho no catálogo                          | Google Pixel 7 Pro · Android 13.0 · realMobile                    |
| Teste `@login` na BS — 3 execuções            | passou · 38s, 35s, 33s                                            |
| Dry-run nos dois ramos                        | logam o destino correto                                           |
| Sessão MCP remota                             | criada · `5881f67…`                                               |
| Navegação pelo MCP no device real             | `find_element ~Login` → `gesture tap` → `~Login-screen` confirmou |
| Resolução do device na sessão                 | 1080 × 2179                                                       |
| Vazamento de credencial no `.env.app.example` | nenhum                                                            |

O ciclo de três passos do MCP (_localizar → tocar → confirmar na tela seguinte_) é idêntico ao do
emulador. Vale lembrar que `Successfully tapped` prova apenas que o toque disparou, nunca que o app
reagiu — daí a terceira chamada.
