//

import { TOTP } from "otpauth";

//

const defaultPassword = "password123";
const defaultTotpSecret = "din5ncvbluqpx7xfzqcybmibmtjocnsf";

//

export function fillLoginFields({
  email,
  password = defaultPassword,
  totpSecret,
}: {
  email: string;
  password?: string;
  totpSecret?: string;
}) {
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
}

export function fillTotpFields(totpSecret = defaultTotpSecret) {
  const totp = new TOTP({
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: totpSecret,
  });
  const token = totp.generate();
  cy.get("[name=totpToken]").type(token);
  cy.get('[action="/users/2fa-sign-in-with-totp"] [type="submit"]').click();
}

export function fillAndSubmitTotpForm(action: string) {
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

export function login(email: string) {
  cy.fillLoginFields({ email, password: defaultPassword });
}

export function mfaLogin(email: string) {
  cy.fillLoginFields({
    email,
    password: defaultPassword,
    totpSecret: defaultTotpSecret,
  });
}

export function magicLinkLogin(email: string) {
  cy.contains("Email professionnel").click();
  cy.focused().type(email);
  cy.contains("Valider").click();

  cy.contains("Recevoir un lien d’identification").click();
  cy.maildevGetMessageBySubject("Lien de connexion à ProConnect").then(
    (email) => {
      cy.maildevVisitMessageById(email.id);
      cy.origin("http://localhost:1080", () => {
        cy.contains(
          "Vous avez demandé un lien d'identification à ProConnect. Utilisez le bouton ci-dessous pour vous connecter instantanément.",
        );
        cy.contains("Se connecter")
          .get("a")
          .invoke("attr", "target", "")
          .click();
      });
      cy.maildevDeleteMessageById(email.id);
    },
  );
}
