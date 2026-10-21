import baseElements from "./base.elements";

const { I } = inject();

export class basePage {
  clickInElement(element: any, time: any = 30) {
    I.waitForElement(element, time);
    I.seeElement(element);
    I.click(element);
  }

  fillFormInElement(element: any, text: any) {
    I.waitForElement(element, 30);
    I.fillField(element, text);
  }

  tryToElement(element: any, time: any = 10) {
    tryTo(() => {
      this.clickInElement(element, time);
    });
  }

  hideKeyboardGlobal() {
    I.runOnAndroid({}, () => {
      I.hideDeviceKeyboard();
    });

    I.runOnIOS({}, () => {
      I.pressKey("Return");
    });
  }

  goToTab(tab: any) {
    this.clickInElement(tab);
  }

  closeAlert(time: any = 10) {
    this.tryToElement(baseElements.btn_alert_ok, time);
  }
}

export default new basePage();
