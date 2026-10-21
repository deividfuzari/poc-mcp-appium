import baseElements from "../pages/base/base.elements";
import basePage from "../pages/base/base.page";
import formsPage from "../pages/forms/forms.page";

Feature("Forms - fluxo completo - POC MCP Appium");

// Mesmo estado inicial do forms_tests.ts: com NO_RESET=true o app mantém a última tela
// (e o estado dos campos), então fecha alerta residual, volta para a Home e entra em Forms.
Before(() => {
  basePage.tryToElement(baseElements.btn_alert_ok, 2);
  basePage.goToTab(baseElements.tab_home);
  basePage.goToTab(baseElements.tab_forms);
  formsPage.validateFormsScreen();
});

// Smoke da tela inteira: prova que os componentes funcionam em sequência, não só isolados.
// Cada interação é validada antes da próxima.
Scenario("Percorre o fluxo completo da tela de Forms", () => {
  formsPage.fillInputField("Smart Fit QA POC");
  formsPage.validateInputResult("Smart Fit QA POC");

  formsPage.ensureSwitchOff();
  formsPage.toggleSwitch();
  formsPage.validateSwitchOn();

  formsPage.selectDropdownOption("Appium is awesome");
  formsPage.validateDropdownSelected("Appium is awesome");

  formsPage.clickActiveButton();
  formsPage.validateActiveAlert();
})
  .tag("@poc")
  .tag("@smoke");
