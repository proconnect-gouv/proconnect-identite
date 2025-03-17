import { generateToken } from "@sunknudsen/totp";

describe("add 2fa authentication", () => {
  it("should add 2fa authentication on account user", function () {
    cy.visit("/connection-and-account");

    cy.login("lion.eljonson@darkangels.world");

    cy.contains("Double authentification");

    cy.get('[href="/double-authentication"]')
      .contains("Configurer la 2FA")
      .click();

    cy.contains(
      "Choisissez une de ces deux méthodes de validation supplémentaire",
    );

    cy.get('[href="/configuring-single-use-code"]')
      .contains("Code à usage unique")
      .click();

    cy.contains("Configurer un code à usage unique (OTP)");

    cy.get('label[for="is-authenticator-app-installed"]').click();

    cy.get("#is-authenticator-app-installed").should("be.checked");

    cy.get("#continue-button")
      .should("not.have.attr", "aria-disabled", "true")
      .click();

    // Extract the code from the front to generate the TOTP key
    cy.get("#humanReadableTotpKey")
      .invoke("text")
      .then((text) => {
        const humanReadableTotpKey = text.trim().replace(/\s+/g, "");
        const totp = generateToken(humanReadableTotpKey);
        cy.get("[name=totpToken]").type(totp);
        cy.get(
          '[action="/authenticator-app-configuration"] [type="submit"]',
        ).click();
      });

    cy.contains("L’application d’authentification a été configurée.");

    cy.maildevGetMessageBySubject("Double authentification activée").then(
      (email) => {
        cy.maildevVisitMessageById(email.id);
        cy.contains(
          "Votre compte ProConnect lion.eljonson@darkangels.world est à présent protégé par la double authentification.",
        );
        cy.maildevDeleteMessageById(email.id);
      },
    );
  });

  it("should see an help link on third failed attempt", function () {
    cy.visit("/connection-and-account");

    cy.login("unused1@yopmail.com");

    cy.contains("Double authentification");

    cy.get('[href="/double-authentication"]')
      .contains("Configurer la 2FA")
      .click();

    cy.contains(
      "Choisissez une de ces deux méthodes de validation supplémentaire",
    );

    cy.get('[href="/configuring-single-use-code"]')
      .contains("Code à usage unique")
      .click();

    cy.contains("Configurer un code à usage unique (OTP)");

    cy.get('label[for="is-authenticator-app-installed"]').click();

    cy.get("#is-authenticator-app-installed").should("be.checked");

    cy.get("#continue-button")
      .should("not.have.attr", "aria-disabled", "true")
      .click();

    cy.get("[name=totpToken]").type("123456");
    cy.get(
      '[action="/authenticator-app-configuration"] [type="submit"]',
    ).click();

    cy.contains("Code invalide.");
  });
});
