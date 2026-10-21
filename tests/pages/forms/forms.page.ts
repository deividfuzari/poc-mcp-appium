import basePage from "../base/base.page";
import formsElements from "./forms.elements";

const { I } = inject();

export class formsPage {
  validateFormsScreen() {
    I.waitForElement(formsElements.screen_forms, 30);
    I.seeElement(formsElements.screen_forms);
  }

  fillInputField(text: any) {
    basePage.fillFormInElement(formsElements.field_input, text);
    basePage.hideKeyboardGlobal();
  }

  validateInputResult(text: any) {
    I.waitForText(text, 30, formsElements.text_inputResult);
    I.see(text, formsElements.text_inputResult);
  }

  // O app não reseta o estado da tela entre execuções nem ao trocar de aba,
  // então o switch é forçado para desligado antes do cenário.
  ensureSwitchOff() {
    tryTo(() => {
      I.waitForElement(formsElements.text_switchOn, 3);
      I.click(formsElements.switch_form);
    });
  }

  toggleSwitch() {
    basePage.clickInElement(formsElements.switch_form);
  }

  validateSwitchOff() {
    I.waitForElement(formsElements.text_switchOff, 30);
    I.seeElement(formsElements.text_switchOff);
  }

  validateSwitchOn() {
    I.waitForElement(formsElements.text_switchOn, 30);
    I.seeElement(formsElements.text_switchOn);
  }

  selectDropdownOption(option: any) {
    basePage.clickInElement(formsElements.btn_dropdown);
    basePage.clickInElement(formsElements.option_dropdown(option));
  }

  validateDropdownSelected(option: any) {
    I.waitForElement(formsElements.text_dropdownSelected(option), 30);
    I.seeElement(formsElements.text_dropdownSelected(option));
  }

  clickActiveButton() {
    basePage.clickInElement(formsElements.btn_active);
  }

  validateActiveAlert() {
    I.waitForElement(formsElements.text_activeAlert, 30);
    I.seeElement(formsElements.text_activeAlert);
    basePage.closeAlert();
  }

  clickInactiveButton() {
    basePage.clickInElement(formsElements.btn_inactive);
  }

  validateNoAlert() {
    I.seeElement(formsElements.screen_forms);
    I.dontSeeElement(formsElements.text_activeAlert);
  }
}

export default new formsPage();
