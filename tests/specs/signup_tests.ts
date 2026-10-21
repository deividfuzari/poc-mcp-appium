import baseElements from "../pages/base/base.elements";
import basePage from "../pages/base/base.page";
import loginPage from "../pages/login/login.page";

Feature("Sign up - POC MCP Appium");

// Com NO_RESET=true o app reabre na última tela e pode ter alerta aberto,
// então fechamos o alerta residual antes de navegar e voltamos para a Home.
Before(() => {
  basePage.closeAlert(3);
  basePage.goToTab(baseElements.tab_home);
  basePage.goToTab(baseElements.tab_login);
  loginPage.goToSignUpTab();
});

Scenario("Valida os campos da aba Sign up", () => {
  loginPage.validateSignUpScreen();
})
  .tag("@poc")
  .tag("@signup");

Scenario("Sign up com sucesso", () => {
  loginPage.doSignUp();
  loginPage.validateSignUpSuccess();
})
  .tag("@poc")
  .tag("@signup");

Scenario("Sign up bloqueado quando a confirmacao de senha divergir", () => {
  loginPage.doSignUpWithMismatchedPassword();
  loginPage.validatePasswordMismatchError();
})
  .tag("@poc")
  .tag("@signup");

Scenario("Sign up bloqueado com e-mail invalido", () => {
  loginPage.doSignUpWithInvalidEmail();
  loginPage.validateInvalidEmailError();
})
  .tag("@poc")
  .tag("@signup");

// Cadastro e login encadeados com as mesmas credenciais do .env.app.
// O alerta do cadastro é fechado dentro do validateSignUpSuccess, antes de
// trocar de aba; o doLogin já força a aba Login e esconde o teclado.
Scenario("Cadastra um usuario e faz login com as mesmas credenciais", () => {
  loginPage.doSignUp();
  loginPage.validateSignUpSuccess();
  loginPage.doLogin();
  loginPage.validateLoginSuccess();
})
  .tag("@poc")
  .tag("@loginBS")
  .tag("@signup");
