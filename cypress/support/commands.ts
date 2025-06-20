//

import { generateToken } from "@sunknudsen/totp";
import { checkA11y } from "./a11y/checkA11y";
import { seed } from "./commands/seed";

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
      setRequestedAcrs(requestedAcrs?: string[]): Chainable<void>;
      getDescribed: typeof getDescribedCommand;
      seed: typeof seed;
      getByLabel: typeof getByLabelCommand;
      updateCustomParams: typeof updateCustomParams;
      getTotpSecret: typeof getTotpSecretCommand;
      verifyEmail: typeof verifyEmailCommand;
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
  cy.get('[action="/users/2fa-sign-in-with-totp"] [type="submit"]').click();
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

const updateCustomParams = (updater: (customParams: any) => any): void => {
  cy.get('[name="custom-params"]')
    .invoke("val")
    .then((customParamsAsText) => {
      const customParams = JSON.parse(customParamsAsText as string);

      const newCustomParams = updater(customParams);
      // note that null property should be set to a falsy
      const newCustomParamsAsText = JSON.stringify(newCustomParams, null, 2);

      cy.get('[name="custom-params"]').clear({ force: true });
      cy.get('[name="custom-params"]').type(newCustomParamsAsText, {
        delay: 0,
        force: true,
        parseSpecialCharSequences: false,
      });
    });
};

Cypress.Commands.add("updateCustomParams", updateCustomParams);

Cypress.Commands.add("setRequestedAcrs", (requestedAcrs) => {
  const newClaims = {
    id_token: {
      amr: { essential: true },
      acr: { essential: true },
    },
  };

  if (requestedAcrs) {
    // @ts-ignore
    newClaims.id_token.acr["values"] = requestedAcrs;
  }

  cy.updateCustomParams((customParams) => ({
    ...customParams,
    claims: newClaims,
  }));
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
Cypress.Commands.add("seed", seed);

function getByLabelCommand(text: string) {
  return cy.get(`[aria-label="${text}"]`);
}
Cypress.Commands.add("getByLabel", getByLabelCommand);

function getTotpSecretCommand(action: string) {
  return cy
    .get("#humanReadableTotpKey")
    .invoke("text")
    .then((text) => {
      const humanReadableTotpKey = text.trim().replace(/\s+/g, "");
      const totp = generateToken(humanReadableTotpKey);
      cy.get("[name=totpToken]").type(totp);
      cy.get(`[action="${action}"] [type="submit"]`).click();
    });
}
Cypress.Commands.add("getTotpSecret", getTotpSecretCommand);

function verifyEmailCommand() {
  return cy
    .maildevGetMessageBySubject("Vérification de votre adresse email")
    .then((email) => {
      cy.maildevVisitMessageById(email.id);
      cy.contains(
        "Pour vérifier votre adresse e-mail, merci de de copier-coller ou de renseigner ce code dans l’interface de connexion ProConnect.",
      );
      cy.go("back");
      cy.maildevDeleteMessageById(email.id);
      return cy.maildevGetOTPCode(email.text, 10);
    })
    .then((code) => {
      if (!code)
        throw new Error("Could not find verification code in received email");
      cy.get('[name="verify_email_token"]').type(code);
      cy.get('[type="submit"]').click();
    });
}
Cypress.Commands.add("verifyEmail", verifyEmailCommand);
