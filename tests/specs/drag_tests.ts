import baseElements from "../pages/base/base.elements";
import basePage from "../pages/base/base.page";
import dragPage from "../pages/drag/drag.page";

Feature("Drag and Drop - POC MCP Appium");

// Com NO_RESET=true o app reabre na última tela, e a tela de Drag guarda o
// tabuleiro como foi deixado (montado ou meio montado). O Before volta para a
// Home, entra em Drag e força o tabuleiro vazio antes do cenário.
Before(() => {
  basePage.goToTab(baseElements.tab_home);
  basePage.goToTab(baseElements.tab_drag);
  dragPage.validateDragScreen();
  dragPage.ensureEmptyBoard();
});

// Limpeza (pós): reinicia o tabuleiro para não deixar a tela de sucesso aberta
// para a próxima execução.
After(() => {
  basePage.tryToElement(baseElements.tab_drag, 3);
  dragPage.restartBoard();
});

Scenario("Monta o quebra-cabeça arrastando todas as peças", () => {
  dragPage.validateEmptyBoard();
  dragPage.solvePuzzle();
  dragPage.validatePuzzleSolved();
})
  .tag("@poc")
  .tag("@drag");
