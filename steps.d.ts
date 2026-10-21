/// <reference types='codeceptjs' />
type steps_file = typeof import("./steps_file");
type AppiumGestures = import("./helpers/appium_gestures");

declare namespace CodeceptJS {
  interface SupportObject {
    I: I;
    current: any;
  }
  interface Methods extends Appium, AppiumGestures {}
  interface I extends ReturnType<steps_file>, WithTranslation<Methods> {}
  namespace Translation {
    interface Actions {}
  }
}
