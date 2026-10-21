# skills.md — qa-appium-automation

My own best-practices file for automating **poc-mcp-appium** (CodeceptJS + Appium + TypeScript,
Android). I read this before every task and I keep it up to date as I learn.

The conventions here mirror the SmartFit mobile suites (`glados`, `nexus`) so that everything I
write here transfers to those projects unchanged.

## Where the task comes from

`CASOS-DE-TESTE.md` in the project root is the **work intake** (same pattern as `artemis`). It is
the _what_; this file is the _how_ — **this file wins on any conflict**.

- **`CT-01` is a single reusable work slot**, not a queue position. The user always says _"automatize
  o CT-01"_ — it is the only case I ever automate. The _Exemplo de briefing_ section (the login
  case) is a format model, already automated: **never** automate it.
- **A blank step or field does not exist.** The slot ships with eight numbered lines and empty
  briefing fields; I automate only what is actually filled in, and never invent steps to round out a
  screen. If a required field (Tela, Estado inicial) is blank, I ask.
- The **Tela** field resolves page objects, access tab, tags and spec path through that file's
  _Resolução por tela_ table. Never hardcode those in a spec from the CT text.
- **A `Tela` that is not a row in that table is usually a tab inside one.** `sign up` is an inner
  tab of the Login screen, not a screen: it reuses `tests/pages/login/` and is reached with
  `goToTab(tab_login)` + a click on `~button-sign-up-container`. Before creating a new
  `tests/pages/<x>/`, check whether the "screen" is really a sub-tab of an existing one.
- **Only the steps that are written get automated.** If the screen has six fields and the case lists
  two, automate two — do not fill in the rest.
- A task typed straight into chat, with no CT, still works; ask for the missing briefing fields
  (screen, initial state, test data) instead of guessing.

### Reading order before touching the MCP (non-negotiable)

1. **This file** — the conventions.
2. `MEMORY.md` + the matching note in `memories/`. **If the locator is already in
   [[locators-wdio-demo-app]], do not re-inspect the screen** — a page source costs ~5.6k tokens.
3. `CASOS-DE-TESTE.md` — the CT-01 slot, that screen's row in _Resolução por tela_, and the
   **`Ambiente`** field, which decides local emulator vs BrowserStack (section below).
4. `tests/specs/login_tests.ts` (reference spec) and the page objects it uses.

Only then: `select_device` (**local only** — skipped when `Ambiente: browserstack`) →
`appium_session_management action=create` → `generate_locators` → write/extend `*.elements.ts` and
`*.page.ts` → **close the MCP session** → write the `*_tests.ts` → run it with the command for that
`Ambiente` → `npx prettier --write <touched files>`.

## Locator priority (always in this order)

| #   | Strategy                     | CodeceptJS                                    | Notes                                                                                                    |
| :-- | :--------------------------- | :-------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| 1   | `accessibility id`           | `'~input-email'`                              | cross-platform, survives redesigns, **always prefer**                                                    |
| 2   | `id` (Android resource-id)   | `'#btnNext'`                                  | Android-only; `disableIdLocatorAutocompletion: true` is set, so use the id exactly as the app exposes it |
| 3   | `-android uiautomator`       | `'android=new UiSelector().description("x")'` | Android-only escape hatch                                                                                |
| 4   | Text xpath on static content | `'//*[@text="LOGIN" or @label="LOGIN"]'`      | the `@text or @label` pair keeps it valid on Android **and** iOS                                         |

**Reality check:** the demo app used in this POC exposes clean accessibility ids on every screen.
The real SmartFit apps largely do **not** — expect to land on levels 3–4 there, and every time I do,
I note it here and recommend the squad add a `testID` (React Native) / `contentDescription`.

### Never introduce — even when `generate_locators` suggests it

`generate_locators` returns **every** strategy it can build for an element, including garbage. I am
the filter, not the tool.

| Rejected                                 | Real example seen here                                            | Why                                                |
| :--------------------------------------- | :---------------------------------------------------------------- | :------------------------------------------------- |
| Locator from a field's **current value** | `new UiSelector().text("qa.poc@smartfit.com")` for `~input-email` | that's what the last test typed, not an identifier |
| Masked password value                    | `new UiSelector().text("••••••••")`                               | same problem, plus it changes with length          |
| Positional index                         | `.instance(4)`, `(//android.widget.TextView[@text="Login"])[1]`   | breaks when the layout shifts one node             |
| Long absolute xpath                      | `//...ViewGroup[4]/android.widget.TextView[2]`                    | breaks on any hierarchy change                     |
| Class name alone                         | `android.widget.TextView`                                         | matches half the screen                            |

Verified on 2026-09-10 — details in [[generate-locators-sugere-locators-instaveis]].

**Disambiguate by scoping, never by index.** Each screen has its own accessibility id
(`~Home-screen`, `~Login-screen`) — scope to it instead of reaching for `[1]`.

**Confirm before committing — this is a gate, not a suggestion.** I do not write a locator into a
`.elements.ts` unless I resolved it with `appium_find_element` **in this session**. A locator that
never resolved is a guess, no matter how good it looked in the `generate_locators` output.

### When `appium_find_element` fails

A failure is not automatic proof that the locator is bad. Diagnose before downgrading it — I have
already thrown away time by assuming the worst case.

| Error                                                                       | Likely cause                                             | What I do                                                                                                                                       |
| :-------------------------------------------------------------------------- | :------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| `could not be located` **and** the keyboard is open, or a modal/alert is up | the element left the UI tree because something covers it | dismiss it (`appium_gesture action=back`, `appium_mobile_keyboard action=hide`, `appium_alert`) and re-validate — **do not** change the locator |
| `could not be located` on a long screen or list                             | it is outside the viewport                               | `appium_gesture action=scroll_to_element` with the same strategy/selector                                                                       |
| `could not be located` on a clean, idle screen                              | the locator really is wrong                              | drop one level in the priority table and try again                                                                                              |
| `does not exist in DOM anymore`                                             | I reused a stale handle                                  | the screen changed; call `find_element` again — the locator itself is fine                                                                      |

Only after ruling out the first three do I conclude the locator is bad. The keyboard case is the one
that bites most often — details in [[elemento-sumido-da-arvore]]. Whenever a screen turns out to
need a dismiss-then-retry, I record it as an app quirk in my memory.

## Where the work runs — the `Ambiente` field

The CT carries an **`Ambiente`** field. **Blank means `local`**, and `local` is exactly the flow
described in the rest of this file — none of it changes. `browserstack` swaps the device out from
under the same flow: same tools, same locator priority, same page object rules.

|                 | `local` (default)              | `browserstack`                                       |
| :-------------- | :----------------------------- | :--------------------------------------------------- |
| Device          | emulator from Android Studio   | real device on BrowserStack                          |
| Prerequisite    | `adb devices` lists it         | `BS_USER`/`BS_KEY`/`BS_APP_URL` filled in `.env.app` |
| `select_device` | yes                            | **never** — the device isn't on this machine         |
| Session         | embedded driver, no URL        | `remoteServerUrl` on the BS hub                      |
| `appium:app`    | comes from `capabilities.json` | **must** be overridden with `BS_APP_URL`             |
| Suite command   | `npm run test:tags '<tag>'`    | `npm run test:bs -- '<tag>'`                         |

### The `browserstack` branch

```
# no adb, no select_device
appium_session_management action=create
  platform: android
  remoteServerUrl: https://$BS_USER:$BS_KEY@hub-cloud.browserstack.com/wd/hub
  capabilities: {
    "appium:app": "<BS_APP_URL>",
    "bstack:options": {
      "deviceName": "<BS_DEVICE>", "osVersion": "<BS_OS_VERSION>",
      "projectName": "poc-mcp-appium", "buildName": "mcp-inspection",
      "idleTimeout": 300, "video": true, "interactiveDebugging": true
    }
  }
generate_locators / appium_find_element   # unchanged from the local flow
appium_session_management action=delete   # frees the single parallel slot
```

- Values come from `.env.app`. I read the file; I **never** print `BS_KEY` in a response or a log.
- **`appium:app` is not optional.** `capabilities.json` is merged into remote sessions too, and its
  `appium:app` is a local filesystem path — BrowserStack rejects a path that isn't `bs://`.
  Confirmed in the `appium-mcp` source on 2026-09-17: `isRemoteServer` only suppresses the local
  udid, not the config file.
- **I do not pause after creating the session — I keep going.** I state the sessionId and the
  `buildName` in my next message and go straight into mapping. The user already knows the dashboard
  path and opens the live view himself while I work; waiting for him would only burn the idle
  timeout. I pause only when he asks for it in that specific task.
- **This plan allows one parallel session.** An MCP session and the suite can never run at the same
  time; the second one queues. So deleting my session isn't just hygiene here — it's what unblocks
  `npm run test:bs`.
- **`BROWSERSTACK_IDLE_TIMEOUT` is not a locator problem.** 300s is BrowserStack's ceiling and it
  counts _idle_ time, not run time, so long pauses while I reason kill the session. I recreate it and
  continue; I never downgrade a locator over it.
- **A locator can genuinely differ from the emulator** — OEM builds change view hierarchies. One
  that works locally and fails here is a finding worth a memory note, not a mapping mistake.

## Discovering locators with the Appium MCP server

Inspection only — the deliverable is always CodeceptJS code. The block below is the **`local`**
branch; for `Ambiente: browserstack` the session creation is the one in the section above and
everything after it is identical.

```
adb devices                      # a device must already be attached; I cannot boot an emulator
select_device (platform=android)
appium_session_management action=create
appium_gesture action=tap        # navigate to the target screen
generate_locators                # map the screen
appium_find_element              # validate each locator I intend to use
appium_session_management action=delete   # ALWAYS, before the suite runs
```

- `generate_locators` over `appium_get_page_source` as the default: the page source for a single
  screen here is ~22 KB / ~5.6k tokens with 63 nodes, only 31 of them meaningful. `generate_locators`
  returns just the interactable elements, each already carrying all four strategies plus
  `clickable` / `enabled` / `displayed`. Reach for the page source only when `generate_locators`
  genuinely isn't enough.
- The MCP marks `generate_locators` as "PRIORITY 3" and `appium_find_element` as primary. Not a
  contradiction: `find_element` is for when I already know the target; `generate_locators` is for
  discovering a whole screen, which is what mapping work is.
- **Never `appium_generate_tests`** — it emits Java/TestNG. It is excluded from my allowed tools.

## Acting on an element — the three-step cycle

`appium_gesture` does not accept a selector; it takes `elementUUID` or raw coordinates. So every
interaction is **three** calls, not two:

```
1. appium_find_element(strategy, selector)                → elementId
2. appium_gesture(action=tap, elementUUID)                → the touch fires
3. appium_find_element(something on the resulting screen) → the effect is confirmed
```

### What each response actually proves

| Response                                     | Proves                                                                                       | Does NOT prove                  |
| :------------------------------------------- | :------------------------------------------------------------------------------------------- | :------------------------------ |
| `elementId '0000...'`                        | the element exists in the tree right now and the selector resolves                           | —                               |
| `Successfully tapped element ...`            | the command reached `uiautomator2.server` on the device and the touch fired without throwing | **that the app reacted at all** |
| a locator from the resulting screen resolves | the action had the intended effect                                                           | —                               |

⚠️ **`Successfully tapped` is not a success assertion.** Verified on 2026-09-10: tapping the static
`TextView` "Login / Sign up Form" — `clickable: false`, no handler, does nothing — returned the exact
same success message as tapping the Login tab that actually navigated. The gesture reports "I
touched there", never "the app responded".

**The MCP never tells me what changed on screen.** Side effects are invisible in the response — the
tap that opened the keyboard reported plain success and only surfaced when the _next_ lookup failed
([[elemento-sumido-da-arvore]]). If I want to know the current state, I have to ask again.

**Shortcut that saves a call:** the next `find_element` in the flow doubles as the verification of
the previous action. Going to Login and then filling the email? `find_element(~input-email)` confirms
both that the navigation worked and that the field is there. I only add a dedicated verification
call when the flow has nothing to look up next.

## The MCP session is not the test session

The MCP runs Appium drivers **embedded** and needs no running Appium server. The CodeceptJS suite
connects to a **separate** server started with `npm run start:appium`. They share nothing and they
compete for the same device — so I delete my MCP session before the suite runs.
See [[mcp-e-testes-em-sessoes-separadas]].

## Project architecture

```
codecept.conf.ts            # Appium helper + AppiumGestures, caps from .env.app
.env.app                    # device, APK, package/activity, credentials, NO_RESET
steps_file.ts               # actor customizations (kept empty; logic lives in base.page)
steps.d.ts                  # GENERATED — see below, never hand-edit
helpers/appium_gestures.ts  # gestures the Appium helper doesn't expose (drag and drop)
tests/
├── pages/<feature>/<feature>.elements.ts   # locators only
├── pages/<feature>/<feature>.page.ts       # actions + validate* assertions
└── specs/<feature>_tests.ts                # orchestration, zero raw selectors
```

### Gestures the Appium helper lacks → custom helper, never a custom actor step

The CodeceptJS Appium helper has **no `dragAndDrop`**. When I need a gesture built from element
coordinates, it goes in `helpers/appium_gestures.ts`, **not** in `steps_file.ts`.

The reason is a real trap I hit on 2026-09-14: two `grabElementBoundingRect` awaits inside an actor
step run **out of order** — the second grab queues behind every step the scenario already enqueued,
so the gesture fires with an empty destination and silently does nothing. In a helper the driver is
reached directly (`this.helpers["Appium"].browser`), the awaits are plain promises, and the whole
gesture is one atomic step — so page objects stay synchronous. Details and the log signature in
[[drag-and-drop-no-codeceptjs]].

**After touching `steps_file.ts` or `helpers/`, regenerate the types** or `tsc` fails on the new
method: `npx dotenv -e .env.app -- codeceptjs def -c ./codecept.conf.ts`.

Spec glob is `./tests/specs/*_tests.ts` — a file named `*.spec.ts` is silently not collected.

### Page object shape (non-negotiable)

```typescript
// tests/pages/login/login.elements.ts
export const loginElements = {
  screen_login: "~Login-screen",
  field_email: "~input-email",
  btn_login: "~button-LOGIN",
};
export default loginElements;

// tests/pages/login/login.page.ts
import basePage from "../base/base.page";
import loginElements from "./login.elements";

const { I } = inject();

export class loginPage {
  doLogin(email: any, password: any) {
    basePage.fillFormInElement(loginElements.field_email, secret(email));
    basePage.clickInElement(loginElements.btn_login);
  }
}
export default new loginPage();
```

- Elements and page in **separate files**, always.
- Class name lowercase, `export default new xPage()` at the bottom, spec imports the instance.
- **No `private`, no `async`/`await`, no `abstract`.** CodeceptJS chains promises internally.
- Naming: `btn_`, `field_`, `screen_`, `text_`, `tab_`, `link_`. Dynamic ones are functions:
  `btn_next_index: (i: any) => \`#btnNext${i}\``.

### base.page helpers — reuse, don't re-implement

| Method                          | Does                                                         |
| :------------------------------ | :----------------------------------------------------------- |
| `clickInElement(el, time = 30)` | `waitForElement` + `seeElement` + `click`                    |
| `fillFormInElement(el, text)`   | `waitForElement` + `fillField`                               |
| `tryToElement(el, time = 10)`   | same, wrapped in `tryTo` — for optional UI                   |
| `hideKeyboardGlobal()`          | `hideDeviceKeyboard` on Android, `pressKey('Return')` on iOS |
| `goToTab(tab)`                  | bottom tab navigation                                        |
| `closeAlert()`                  | dismisses a native OK alert                                  |

## Specs

```typescript
Feature("Login - POC MCP Appium");

Before(() => {
  basePage.goToTab(baseElements.tab_home); // never assume the starting screen
});

Scenario("Login com sucesso", () => {
  loginPage.doLogin();
  loginPage.validateLoginSuccess();
})
  .tag("@poc")
  .tag("@login");
```

- Tags chained as `.tag('@area').tag('@scenario')`, minimum two. Existing tags: `@poc`, `@home`,
  `@login`, `@forms`, `@signup`, `@smoke`, `@drag`. A new tag name silently breaks the grep npm
  scripts — check siblings first.
- **`test:tags` is `--grep`, i.e. a substring/regex over the test title, not a tag matcher.** A tag
  that is a prefix of another runs both sets: `@forms-flow` was tried for the Forms smoke on
  2026-09-11 and made `npm run test:tags '@forms'` run 6 scenarios instead of 5. Renamed to
  `@smoke`. Never pick a tag name that is a prefix of an existing one; anchoring the grep
  (`'@forms$'`) works but is a trap for whoever runs the command without knowing.
- One behaviour per `Scenario`, at least one real assertion. No test that only navigates.
- Credentials via `process.env` + `secret(...)`. Never hardcoded.

### New spec file, or a new Scenario in an existing one?

The CT's **Destino** field overrides this; when it is blank I decide:

- **New `Scenario` in the existing spec** when it is the same screen and the same initial state.
- **New file** `tests/specs/<screen>_tests.ts` when the screen has no spec, **or** it needs a
  different `Before`, **or** the screen's spec is past ~200 lines and the case is independent.
- **Never** a second spec for the same screen just to keep things separate — it duplicates hooks
  and scatters the tags across grep scripts.
- On a real tie, propose and ask before creating.

## App state — the mobile trap with no web equivalent

`NO_RESET=true` in `.env.app` keeps the app installed and **reopens it exactly where it was left**,
including filled forms. This is why every spec needs a `Before` that forces the initial state.
Verified the hard way: the first run of the POC failed because the app was sitting on the Login
screen from a previous manual session. See [[estado-do-app-nao-reseta]].

Set `NO_RESET=false` only when a test genuinely needs a clean install — it costs ~30 s per session.

And the `Before` only guarantees the **screen**, never the **state of its components**: switching
tabs does not reset the demo app's switch, input or dropdown either. Any scenario that depends on a
component's state forces it first, idempotently and without `grab` (which would need `async`):
`tryTo(() => { I.waitForElement(<wrong-state locator>, 3); I.click(<toggle>) })`.
See [[estado-de-tela-persiste-entre-abas]].

## Self-healing

- Never `I.wait(n)` as a synchronization tool — `I.waitForElement(el, 30)` / `I.waitForText(t, 30)`.
  A fixed wait is acceptable only with no observable signal, and stays minimal.
- Optional UI (permission dialogs, welcome modals, AB tests) → `basePage.tryToElement(...)`.
- Locator broke after a release → re-inspect live, replace with the highest-priority stable option,
  update the memory note **with the new verification date**.
- `retryFailedStep` and `screenshotOnFail` are enabled in `codecept.conf.ts`; failure screenshots
  land in `output/`. Read the screenshot before theorizing about a failure.
- Never weaken or delete an assertion to make a test pass. A real product bug gets reported as one.

## Running

```bash
adb devices                                       # emulator must be up
npm run app:install                               # first time only
npm run start:appium                              # separate terminal; only for the LOCAL suite (not for the MCP, not for BS)
npm run test:tags '@signup'                       # ONLY the tag I just wrote/changed
npm run test:bs -- '@signup'                      # same, but on the BS device (Ambiente: browserstack)
npx prettier --write <only the files I touched>    # NOT `npm run format`
```

### I only run what I just wrote — never the whole suite

**When I finish an automation I run only the tag of the scenarios I created or changed.** I do
**not** run `npm run test:poc`, `npm test`, or another screen's tag "to check for regressions".

**Why:** every suite run creates a new Appium session and re-enters the screen once per scenario
through the `Before`. Running the whole POC to validate one new scenario burns minutes of emulator
time and tokens without telling me anything about the code I just wrote.

**How to apply:**

- Closing a task = `npm run test:tags '<my new tag>'` and nothing else.
- To prove a scenario is state-independent, I repeat **my own tag**, not the suite.
- `npm run test:poc` and `npm test` are the **user's** commands, not part of my closing flow.
- If I genuinely suspect a regression in another spec (e.g. I touched `base.page`), I **say so in
  the report and suggest the command** — I do not run it on my own initiative.

## Environment gotchas

- **`Cannot start the 'io.appium.settings' application` right after using the MCP** → the embedded
  driver left a half-installed helper on the emulator. `adb uninstall io.appium.settings` and re-run;
  the driver reinstalls it. The `Cannot read properties of undefined (reading 'waitUntil')` that
  CodeceptJS prints on top is noise — the session never started, it is not a locator problem.
  See [[io-appium-settings-quebra-a-suite]].
- **`npm run lint:fix` is broken** (no `eslint.config.js` in the project) and `npm run format`
  rewrites the whole repo, `CASOS-DE-TESTE.md` and `README.md` included — see
  [[lint-fix-sem-eslint-config]]. **Always format with `npx prettier --write <touched files>`
  instead**; the user has asked for this explicitly.
- **I never edit `CASOS-DE-TESTE.md`** — not the CT-01 slot, not the _Automatizados_ table. The user
  clears the slot and records the history himself.
- **The MCP needs Node 22**, and the machine default is now Node 22 (`v22.23.2` via nvm, loaded
  from both `.zshrc` and `.zprofile`). `.mcp.json` therefore carries **no** `PATH` override.
  If the MCP ever fails with `ERR_REQUIRE_ESM`, the session is running on an older Node — check
  `node -v` before touching anything else.
- `appium-mcp` is **installed as a devDependency** (`^1.94.0`), and `.mcp.json` calls plain
  `npx appium-mcp` — no `-y`, no `@version`. That makes npx resolve the local `node_modules`
  instead of downloading, so startup needs no network. The version is pinned by
  `package-lock.json`. Do not add `-y` or `@latest`: it publishes several versions a day, and the
  download is what broke the server once already.
- **Keep an eye on free disk space.** A full disk silently corrupts the npx cache: the package
  extracts halfway and the server dies with `ERR_MODULE_NOT_FOUND` / `Cannot find package`, which
  Claude Code surfaces only as a generic `CONNECT_TIMEOUT`. Fix: `rm -rf ~/.npm/_npx`, free space,
  reinstall.
- After any Node version change, run `rm -rf node_modules && npm install`. Native `.node` binaries
  are compiled against one Node ABI and fail with `NODE_MODULE_VERSION mismatch` otherwise. This
  also applies to `glados` and `nexus`.
