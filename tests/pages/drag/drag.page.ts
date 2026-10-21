import basePage from "../base/base.page";
import dragElements from "./drag.elements";

const { I } = inject();

export class dragPage {
  validateDragScreen() {
    I.waitForElement(dragElements.screen_drag, 30);
    I.seeElement(dragElements.screen_drag);
  }

  /**
   * Força o tabuleiro vazio.
   *
   * Com NO_RESET=true a tela reabre exatamente como foi deixada: pode estar na
   * tela de sucesso ou com peças já encaixadas. Na tela de sucesso o `renew`
   * existe na árvore mas o toque nele não tem efeito — só o Retry devolve o
   * tabuleiro; por isso o Retry vem primeiro, e o renew depois limpa encaixes
   * parciais. Idempotente: nos dois cliques o estado final é o mesmo.
   */
  ensureEmptyBoard() {
    basePage.tryToElement(dragElements.btn_retry, 3);
    basePage.clickInElement(dragElements.btn_renew);
    I.waitForElement(dragElements.piece(dragElements.positions[0]), 30);
  }

  validateEmptyBoard() {
    dragElements.positions.forEach((position) => {
      I.waitForElement(dragElements.piece(position), 30);
      I.seeElement(dragElements.piece(position));
    });
  }

  /**
   * Arrasta uma peça da bandeja até o alvo correspondente na grade.
   *
   * A peça sai da árvore quando encaixa, então o waitForInvisible é a prova de
   * que o encaixe valeu — o gesto por si só não garante nada.
   */
  dragPieceToTarget(position: any) {
    I.waitForElement(dragElements.piece(position), 30);
    I.waitForElement(dragElements.target(position), 30);
    I.dragElementToElement(
      dragElements.piece(position),
      dragElements.target(position),
    );
    I.waitForInvisible(dragElements.piece(position), 20);
  }

  solvePuzzle() {
    dragElements.positions.forEach((position) => {
      this.dragPieceToTarget(position);
    });
  }

  validatePuzzleSolved() {
    I.waitForElement(dragElements.text_congratulations, 30);
    I.seeElement(dragElements.text_congratulations);
    I.seeElement(dragElements.text_success);
  }

  restartBoard() {
    basePage.clickInElement(dragElements.btn_retry);
    I.waitForElement(dragElements.piece(dragElements.positions[0]), 30);
  }
}

export default new dragPage();
