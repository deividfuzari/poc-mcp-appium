import baseElements from "../pages/base/base.elements";
import basePage from "../pages/base/base.page";
import formsPage from "../pages/forms/forms.page";

Feature("Forms - POC MCP Appium");

// Com NO_RESET=true o app mantém a última tela (e o estado dos campos) entre execuções.
// Fecha um alerta eventualmente aberto, volta para a Home e entra na tela de Forms.
Before(() => {
  basePage.tryToElement(baseElements.btn_alert_ok, 2);
  basePage.goToTab(baseElements.tab_home);
  basePage.goToTab(baseElements.tab_forms);
  formsPage.validateFormsScreen();
});

Scenario("Preenche o campo de texto e vê o texto digitado", () => {
  formsPage.fillInputField("Smart Fit QA POC");
  formsPage.validateInputResult("Smart Fit QA POC");
})
  .tag("@poc")
  .tag("@forms");

Scenario("Liga o switch e vê o texto de estado atualizado", () => {
  formsPage.ensureSwitchOff();
  formsPage.validateSwitchOff();
  formsPage.toggleSwitch();
  formsPage.validateSwitchOn();
})
  .tag("@poc")
  .tag("@forms");

Scenario("Seleciona uma opção no dropdown", () => {
  formsPage.selectDropdownOption("Select an item...");
  formsPage.validateDropdownSelected("Select an item...");
  formsPage.selectDropdownOption("webdriver.io is awesome");
  formsPage.validateDropdownSelected("webdriver.io is awesome");
})
  .tag("@poc")
  .tag("@forms");

Scenario("Botão Active abre o alerta nativo", () => {
  formsPage.clickActiveButton();
  formsPage.validateActiveAlert();
})
  .tag("@poc")
  .tag("@forms");

Scenario("Botão Inactive não abre alerta", () => {
  formsPage.clickInactiveButton();
  formsPage.validateNoAlert();
})
  .tag("@poc")
  .tag("@forms");
