---
name: estado-de-tela-persiste-entre-abas
description: Trocar de aba não reseta o estado da tela no demo app — cenários precisam forçar o estado inicial com tryTo em vez de assumir
metadata:
  type: project
---

# Trocar de aba **não** reseta o estado da tela

Verificado em 2026-09-11 na tela Forms: liguei o switch, fui para a Home, voltei para Forms — o
switch continuava ligado, o input continuava preenchido e o dropdown mantinha a seleção. Somando
isso ao `NO_RESET=true` ([[estado-do-app-nao-reseta]]), o estado sobrevive **ao `Before` e entre
execuções**.

**Why:** o `Before(goToTab(tab_home))` garante em qual *tela* o teste começa, não em que *estado*
os componentes dela estão. Um cenário que faz "toca no switch e valida que ficou ligado" passa na
primeira execução e falha na segunda.

**How to apply:** cenário que depende do estado de um componente precisa forçar esse estado antes
de agir, de forma idempotente e sem `grab` (que exigiria `async/await` no page object):

```typescript
// forma canônica: tryTo corrige só se o estado estiver errado
ensureSwitchOff() {
  tryTo(() => {
    I.waitForElement(formsElements.text_switchOn, 3)   // "turn OFF" = está ligado
    I.click(formsElements.switch_form)
  })
}
```

Outras variantes do mesmo princípio nessa tela: `fillField` já limpa o input antes de digitar
(determinístico de graça) e o dropdown zera selecionando a opção `Select an item...`.
