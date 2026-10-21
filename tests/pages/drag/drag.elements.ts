// Locators mapeados via appium-mcp (generate_locators + appium_get_page_source +
// appium_find_element) em 2026-09-14, app com.wdiodemoapp v1.0.8.
// Peças e alvos expõem accessibility id (`drag-<pos>` / `drop-<pos>`), então não
// há índice posicional em nenhum locator — a ordem da bandeja é embaralhada e
// só o accessibility id sobrevive a ela.
export const dragElements = {
  screen_drag: "~Drag-drop-screen",

  // As 9 posições do tabuleiro: coluna (l/c/r) + linha (1/2/3).
  positions: ["l1", "c1", "r1", "l2", "c2", "r2", "l3", "c3", "r3"],

  // Peça na bandeja. Desaparece da árvore quando é encaixada no alvo certo.
  piece: (position: any) => `~drag-${position}`,
  // Alvo correspondente na grade.
  target: (position: any) => `~drop-${position}`,

  // Reinicia o tabuleiro. Presente na árvore também na tela de sucesso, mas
  // lá o toque não tem efeito — ver btn_retry.
  btn_renew: "~renew",

  // Tela de sucesso: substitui o tabuleiro inteiro quando as 9 peças entram.
  btn_retry: "~button-Retry",
  text_congratulations:
    '//*[@text="Congratulations" or @label="Congratulations"]',
  text_success:
    '//*[@text="You made it, click retry if you want to try it again." or @label="You made it, click retry if you want to try it again."]',
};

export default dragElements;
