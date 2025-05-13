import "cypress-axe";
import "cypress-maildev";

import "./commands";

const RECORD_FOR_HUMANS = Cypress.env("RECORD_FOR_HUMANS") === true;

if (RECORD_FOR_HUMANS) {
  ["visit", "click", "trigger", "type", "clear", "reload", "select"].forEach(
    (command) => {
      Cypress.Commands.overwrite(
        command as unknown as keyof Cypress.Chainable<any>,
        (originalFn, ...args) => {
          const origVal = originalFn(...args);

          return new Promise((resolve) => {
            setTimeout(
              () => {
                resolve(origVal);
              },
              RECORD_FOR_HUMANS ? 2000 : 0,
            );
          });
        },
      );
    },
  );
  Cypress.config("viewportWidth", 1920);
  Cypress.config("viewportHeight", 1080);
}
