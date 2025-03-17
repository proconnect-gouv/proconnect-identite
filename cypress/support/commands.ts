//

import { generateToken } from "@sunknudsen/totp";
import { checkA11y } from "./a11y/checkA11y";

//

declare global {
  namespace Cypress {
    interface Chainable {
      fillLoginFields(options: {
        email: string;
        password?: string;
        totpSecret?: string;
      }): Chainable<void>;
      fillTotpFields(totpSecret?: string): Chainable<void>;
      login(email: string): Chainable<void>;
      mfaLogin(email: string): Chainable<void>;
      seeInField: typeof seeInFieldCommand;
      setCustomParams(customParams: any): Chainable<void>;
      setRequestedAcrs(requestedAcrs?: string[]): Chainable<void>;
      getDescribed: typeof getDescribedCommand;
    }
  }
}

//

Cypress.Commands.overwrite("checkA11y", checkA11y);

const defaultTotpSecret = "din5ncvbluqpx7xfzqcybmibmtjocnsf";
const defaultPassword = "password123";

Cypress.Commands.add("fillTotpFields", (totpSecret = defaultTotpSecret) => {
  const totp = generateToken(totpSecret);
  cy.get("[name=totpToken]").type(totp);
  cy.get(
    '[action="/users/2fa-sign-in-with-authenticator-app"] [type="submit"]',
  ).click();
});

Cypress.Commands.add(
  "fillLoginFields",
  ({ email, password = defaultPassword, totpSecret }) => {
    // Sign in with the existing inbox
    cy.get('[name="login"]').type(email);
    cy.get('[type="submit"]').click();

    cy.get('[name="password"]').type(password);
    cy.get('[action="/users/sign-in"]  [type="submit"]')
      .contains("S’identifier")
      .click();

    if (totpSecret) {
      // redirect to the TOTP login page
      cy.contains("Valider avec la double authentification");

      cy.fillTotpFields(totpSecret);
    }
  },
);

Cypress.Commands.add("login", (email) => {
  cy.fillLoginFields({ email, password: defaultPassword });
});

Cypress.Commands.add("mfaLogin", (email) => {
  cy.fillLoginFields({
    email,
    password: defaultPassword,
    totpSecret: defaultTotpSecret,
  });
});

function seeInFieldCommand(field: string, value: string) {
  return cy
    .contains("label", field)
    .invoke("attr", "for")
    .then((id) => {
      cy.get(`#${id}`).should("have.value", value);
    });
}
Cypress.Commands.add("seeInField", seeInFieldCommand);

Cypress.Commands.add("setCustomParams", (customParams) => {
  cy.get('[name="custom-params"]')
    .clear({ force: true })
    .type(JSON.stringify(customParams), {
      delay: 0,
      parseSpecialCharSequences: false,
      force: true,
    });
});

Cypress.Commands.add("setRequestedAcrs", (requestedAcrs) => {
  const customParams = {
    claims: {
      id_token: {
        amr: { essential: true },
        acr: { essential: true },
      },
    },
  };

  if (requestedAcrs) {
    // @ts-ignore
    customParams.claims.id_token.acr["values"] = requestedAcrs;
  }

  cy.setCustomParams(customParams);
});

function getDescribedCommand(text: string) {
  return cy
    .contains(text)
    .closest("[id]")
    .invoke("attr", "id")
    .then((id) => {
      return cy.get(`[aria-describedby="${id}"]`).as(`${text}`);
    });
}
Cypress.Commands.add("getDescribed", getDescribedCommand);
