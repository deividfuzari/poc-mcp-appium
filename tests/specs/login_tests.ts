import baseElements from "../pages/base/base.elements";
import basePage from "../pages/base/base.page";
import homePage from "../pages/home/home.page";
import loginPage from "../pages/login/login.page";

const { I } = inject();

Feature("Login - POC MCP Appium");

// Com NO_RESET=true o app mantém a última tela aberta entre execuções,
// então garantimos o estado inicial voltando para a Home.
Before(() => {
  basePage.goToTab(baseElements.tab_home);
});

Scenario("Valida a home do app", () => {
  homePage.validateHome();
})
  .tag("@poc")
  .tag("@home");

Scenario("Login com sucesso", () => {
  homePage.validateHome();
  basePage.goToTab(baseElements.tab_login);
  loginPage.validateLoginScreen();
  loginPage.doLogin();
  loginPage.validateLoginSuccess();
})
  .tag("@poc")
  .tag("@login");
