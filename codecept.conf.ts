import { setCommonPlugins } from "@codeceptjs/configure";

const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, ".env.app") });

setCommonPlugins();

const apk = process.env.APK_NAME || "wdio-native-demo-app.apk";
const apkPath = path.resolve(__dirname, "./app", apk);

// Destino da execução: device/emulador local (default) ou BrowserStack.
// Alterne com `npm run test:bs -- '@tag'` (que define RUN_ON=browserstack).
const isBS = process.env.RUN_ON === "browserstack";

const bsDevice = process.env.BS_DEVICE || "Google Pixel 7 Pro";
const bsOsVersion = process.env.BS_OS_VERSION || "13.0";

console.log(
  isBS
    ? `☁️  BrowserStack | ${bsDevice} (Android ${bsOsVersion}) | app: ${process.env.BS_APP_URL}`
    : `🤖 Local | ${process.env.DEVICE_NAME} | APK: ${apkPath}`,
);

require("ts-node/register");

export const config: CodeceptJS.MainConfig = {
  name: "poc-mcp-appium",
  tests: "./tests/specs/*_tests.ts",
  output: "./output",
  helpers: {
    Appium: {
      appiumV2: true,
      // Local: caminho do APK. BrowserStack: id `bs://` devolvido pelo upload.
      app: isBS ? process.env.BS_APP_URL : apkPath,
      platform: "Android",
      protocol: isBS ? "https" : "http",
      host: isBS
        ? process.env.BS_HOST || "hub-cloud.browserstack.com"
        : process.env.APPIUM_HOST || "127.0.0.1",
      port: isBS ? 443 : Number(process.env.APPIUM_PORT || 4723),
      path: process.env.APPIUM_PATH || "/wd/hub",
      // Só no modo BS, para não enviar credencial undefined na sessão local.
      ...(isBS && { user: process.env.BS_USER, key: process.env.BS_KEY }),
      desiredCapabilities: {
        platformName: process.env.PLATFORM_NAME || "Android",
        "appium:automationName": process.env.AUTOMATION_NAME || "UIAutomator2",
        "appium:appPackage": process.env.APP_PACKAGE || "",
        "appium:appActivity": process.env.APP_ACTIVITY || "",
        "appium:autoGrantPermissions": true,
        "appium:newCommandTimeout": 300000,
        "appium:appWaitDuration": 300000,
        "appium:disableWindowAnimation": true,
        "appium:waitForIdleTimeout": 0,
        // Locators vindos do MCP são usados como estão (sem autocomplete de id)
        "appium:disableIdLocatorAutocompletion": true,
        ...(isBS
          ? {
              // Na BS o aparelho é alocado por bstack:options, não por deviceName.
              "bstack:options": {
                deviceName: bsDevice,
                osVersion: bsOsVersion,
                projectName: "poc-mcp-appium",
                buildName: process.env.BS_BUILD || "local-run",
                // Default da BS é 90s de ociosidade antes de matar a sessão
                // (status TIMEOUT). 300s é o teto e evita morrer em pause()/debug.
                idleTimeout: 300,
                // Gera o vídeo da execução na página da sessão no dashboard.
                video: true,
                // Libera o botão "Interactive Debugging" na sessão em andamento:
                // permite assistir e interagir com o device ao vivo.
                // Exige video: true junto.
                interactiveDebugging: true,
              },
            }
          : {
              "appium:deviceName": process.env.DEVICE_NAME || "",
              "appium:androidInstallTimeout": 90000,
              // Mantém o app instalado entre execuções — acelera muito a POC.
              // Troque para false quando precisar de um estado 100% limpo.
              // Só local: na BS cada sessão já sobe num device limpo.
              "appium:noReset": process.env.NO_RESET === "true",
            }),
      },
    },
    // Gestos que o helper Appium não expõe (drag and drop).
    AppiumGestures: {
      require: "./helpers/appium_gestures.ts",
    },
  },
  include: {
    I: "./steps_file.ts",
  },
  plugins: {
    retryFailedStep: {
      enabled: true,
    },
    screenshotOnFail: {
      enabled: true,
    },
    tryTo: {
      enabled: true,
    },
  },
  require: ["ts-node/register"],
};
