// Locators levantados via `adb shell uiautomator dump` (baseline da POC).
// O objetivo do projeto é substituir esse mapeamento manual pelo appium-mcp.
import basePage from "../base/base.page";
import homeElements from "./home.elements";

const { I } = inject();

export class homePage {
  validateHome() {
    I.waitForElement(homeElements.screen_home, 30);
    I.seeElement(homeElements.screen_home);
    I.seeElement(homeElements.text_title);
  }

  goToSupport() {
    basePage.clickInElement(homeElements.link_support);
  }
}

export default new homePage();
