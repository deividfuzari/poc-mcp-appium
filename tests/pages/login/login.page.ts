// Locators levantados via `adb shell uiautomator dump` (baseline da POC).
// O objetivo do projeto é substituir esse mapeamento manual pelo appium-mcp.
import basePage from "../base/base.page";
import loginElements from "./login.elements";

const { I } = inject();

const email = process.env.USER_DEMO_APP || "";
const password = process.env.PASSWORD_DEMO_APP || "";

// Derivado do e-mail do .env.app (sem o "@") para não chumbar dado no código.
const invalidEmail = email.replace("@", "-");

export class loginPage {
  validateLoginScreen() {
    I.waitForElement(loginElements.screen_login, 30);
    I.seeElement(loginElements.screen_login);
  }

  doLogin() {
    basePage.clickInElement(loginElements.tab_login);
    basePage.fillFormInElement(loginElements.field_email, secret(email));
    basePage.fillFormInElement(loginElements.field_password, secret(password));
    basePage.hideKeyboardGlobal();
    basePage.clickInElement(loginElements.btn_login);
  }

  validateLoginSuccess() {
    I.waitForElement(loginElements.text_loginSuccess, 30);
    I.seeElement(loginElements.text_loginSuccess);
    basePage.closeAlert();
  }

  // A aba Sign up fica dentro da tela de Login; o app reabre na última aba
  // usada, então sempre forçamos a aba antes de preencher.
  goToSignUpTab() {
    I.waitForElement(loginElements.screen_login, 30);
    basePage.clickInElement(loginElements.tab_signUp);
  }

  validateSignUpScreen() {
    I.waitForElement(loginElements.field_repeatPassword, 30);
    I.seeElement(loginElements.field_email);
    I.seeElement(loginElements.field_password);
    I.seeElement(loginElements.field_repeatPassword);
    I.seeElement(loginElements.btn_signUp);
  }

  // Os três campos da aba Sign up. O botão fica atrás do teclado, por isso o
  // hideKeyboardGlobal antes de submeter.
  fillSignUpForm(emailValue: any, passwordValue: any, confirmValue: any) {
    basePage.fillFormInElement(loginElements.field_email, secret(emailValue));
    basePage.fillFormInElement(
      loginElements.field_password,
      secret(passwordValue),
    );
    basePage.fillFormInElement(
      loginElements.field_repeatPassword,
      secret(confirmValue),
    );
    basePage.hideKeyboardGlobal();
    basePage.clickInElement(loginElements.btn_signUp);
  }

  doSignUp() {
    this.fillSignUpForm(email, password, password);
  }

  doSignUpWithMismatchedPassword() {
    this.fillSignUpForm(email, password, `${password}-divergente`);
  }

  doSignUpWithInvalidEmail() {
    this.fillSignUpForm(invalidEmail, password, password);
  }

  validateSignUpSuccess() {
    I.waitForElement(loginElements.text_signUpSuccess, 30);
    I.seeElement(loginElements.text_signUpSuccess);
    basePage.closeAlert();
  }

  // O app recalcula as mensagens de erro a cada submit, então o dontSeeElement
  // garante que o cadastro foi realmente bloqueado.
  validatePasswordMismatchError() {
    I.waitForElement(loginElements.text_errorPasswordMismatch, 30);
    I.seeElement(loginElements.text_errorPasswordMismatch);
    I.dontSeeElement(loginElements.text_signUpSuccess);
  }

  validateInvalidEmailError() {
    I.waitForElement(loginElements.text_errorInvalidEmail, 30);
    I.seeElement(loginElements.text_errorInvalidEmail);
    I.dontSeeElement(loginElements.text_signUpSuccess);
  }
}

export default new loginPage();
