//

import { defineConfig } from "cypress";

//
const RECORD = process.env["CYPRESS_RECORD"] === "true";

export default defineConfig({
  chromeWebSecurity: false,
  defaultCommandTimeout: 60000,
  experimentalModifyObstructiveThirdPartyCode: true,
  pageLoadTimeout: 60000,
  e2e: {
    baseUrl: "http://localhost:3000",
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      on("before:browser:launch", (browser, launchOptions) => {
        if (browser.family === "chromium" && browser.name !== "electron") {
          launchOptions.args.push(
            "--disable-features=WebAuthenticationEnforcePermissionsPolicy",
          );
        }
        return launchOptions;
      });
      on("task", {
        log(message) {
          console.log(message);

          return null;
        },
      });
      return config;
    },
  },
  env: {
    MAILDEV_PROTOCOL: "http",
    MAILDEV_HOST: "localhost",
    MAILDEV_SMTP_PORT: "1025",
    MAILDEV_API_PORT: "1080",
  },
  video: RECORD,
});
