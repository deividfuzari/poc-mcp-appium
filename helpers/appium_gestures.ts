import Helper from "@codeceptjs/helper";

/**
 * Gestos que o helper Appium do CodeceptJS não expõe.
 *
 * Fica em um helper (e não em steps_file.ts) porque aqui o driver é acessado
 * direto: os awaits são promises comuns, na ordem em que foram escritos, e o
 * gesto inteiro vira UM passo atômico. Dentro de um step do ator, dois
 * grabElementBoundingRect seguidos entram na fila do cenário fora de ordem e o
 * gesto dispara com o destino vazio.
 */
class AppiumGestures extends Helper {
  get driver(): any {
    return (this.helpers as any)["Appium"].browser;
  }

  /**
   * Arrasta o elemento de origem até o centro do elemento de destino.
   *
   * Sequência W3C equivalente à do drag and drop nativo: pressiona e segura a
   * origem, move até o destino e solta. Aceita os mesmos locators do
   * CodeceptJS (`~accessibility-id`, `#resource-id`, xpath).
   */
  async dragElementToElement(
    source: string,
    target: string,
    options: { pressMs?: number; moveMs?: number; timeout?: number } = {},
  ) {
    const driver = this.driver;
    const pressMs = options.pressMs ?? 800;
    const moveMs = options.moveMs ?? 1200;
    const timeout = options.timeout ?? 30000;

    const sourceElement = await driver.$(source);
    await sourceElement.waitForExist({ timeout });
    const targetElement = await driver.$(target);
    await targetElement.waitForExist({ timeout });

    const sourceRect = await driver.getElementRect(sourceElement.elementId);
    const targetRect = await driver.getElementRect(targetElement.elementId);

    const from = {
      x: Math.round(sourceRect.x + sourceRect.width / 2),
      y: Math.round(sourceRect.y + sourceRect.height / 2),
    };
    const to = {
      x: Math.round(targetRect.x + targetRect.width / 2),
      y: Math.round(targetRect.y + targetRect.height / 2),
    };

    await driver.performActions([
      {
        type: "pointer",
        id: "finger1",
        parameters: { pointerType: "touch" },
        actions: [
          { type: "pointerMove", duration: 0, x: from.x, y: from.y },
          { type: "pointerDown", button: 0 },
          { type: "pause", duration: pressMs },
          { type: "pointerMove", duration: moveMs, x: to.x, y: to.y },
          { type: "pause", duration: 200 },
          { type: "pointerUp", button: 0 },
        ],
      },
    ]);

    await driver.releaseActions();
  }
}

export = AppiumGestures;
