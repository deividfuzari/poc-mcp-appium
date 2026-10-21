export const loginElements = {
  screen_login: "~Login-screen",

  tab_login: "~button-login-container",
  tab_signUp: "~button-sign-up-container",

  field_email: "~input-email",
  field_password: "~input-password",
  field_repeatPassword: "~input-repeat-password",

  btn_login: "~button-LOGIN",
  btn_signUp: "~button-SIGN UP",

  text_loginSuccess:
    '//*[@text="You are logged in!" or @label="You are logged in!"]',
  text_signUpSuccess:
    '//*[@text="You successfully signed up!" or @label="You successfully signed up!"]',
  text_errorPasswordMismatch:
    '//*[@text="Please enter the same password" or @label="Please enter the same password"]',
  text_errorInvalidEmail:
    '//*[@text="Please enter a valid email address" or @label="Please enter a valid email address"]',
};

export default loginElements;
