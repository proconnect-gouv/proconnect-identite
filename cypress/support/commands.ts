//

import { checkA11y } from "./a11y/checkA11y";
import {
  fillLoginFields,
  fillTotpFields,
  login,
  mfaLogin,
} from "./commands/login";
import { seed } from "./commands/seed";
import "./webauthn";

//

declare global {
  namespace Cypress {
    interface Chainable {
      fillLoginFields: typeof fillLoginFields;
      fillTotpFields: typeof fillTotpFields;
      login: typeof login;
      mfaLogin: typeof mfaLogin;
      seeInField: typeof seeInFieldCommand;
      setRequestedAcrs(requestedAcrs?: string[]): Chainable<void>;
      getDescribed: typeof getDescribedCommand;
      seed: typeof seed;
      getByLabel: typeof getByLabelCommand;
      updateCustomParams: typeof updateCustomParams;
      fillAndSubmitTotpForm: typeof fillAndSubmitTotpFormCommand;
      verifyEmail: typeof verifyEmailCommand;
    }
  }
}

//

Cypress.Commands.overwrite("checkA11y", checkA11y);

Cypress.Commands.add("fillTotpFields", fillTotpFields);

Cypress.Commands.add("fillLoginFields", fillLoginFields);

Cypress.Commands.add("login", login);

Cypress.Commands.add("mfaLogin", mfaLogin);

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

function fillAndSubmitTotpFormCommand(action: string) {
  return cy
    .get("#humanReadableTotpKey")
    .invoke("text")
    .then((text) => {
      const humanReadableTotpKey = text.trim().replace(/\s+/g, "");
      const totp = new TOTP({
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: humanReadableTotpKey,
      });
      const token = totp.generate();
      cy.get("[name=totpToken]").type(token);
      cy.get(`[action="${action}"] [type="submit"]`).click();
    });
}
Cypress.Commands.add("fillAndSubmitTotpForm", fillAndSubmitTotpFormCommand);

function verifyEmailCommand() {
  return cy
    .maildevGetMessageBySubject("Vérification de votre adresse email")
    .then((email) => {
      cy.maildevVisitMessageById(email.id);
      cy.origin("http://localhost:1080", () => {
        cy.contains(
          "Pour vérifier votre adresse e-mail, merci de de copier-coller ou de renseigner ce code dans l’interface de connexion ProConnect.",
        );
      });
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
