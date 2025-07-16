describe("add 2fa authentication", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("should add 2fa authentication on account user", function () {
    cy.visit("/connection-and-account");

    cy.login("lion.eljonson@darkangels.world");

    cy.contains("Double authentification");

    cy.get('[href="/double-authentication"]')
      .contains("Configurer la double authentification")
      .click();

    cy.contains("Choisir votre méthode de double authentification");

    cy.contains("Code à usage unique (TOTP)").click();

    cy.get("#webauthn-submit-button").contains("Continuer").click();

    cy.contains("Installer votre outil d’authentification");

    cy.get('label[for="is-totp-installed"]').click();

    cy.get("#is-totp-installed").should("be.checked");

    cy.get("#continue-button")
      .should("not.have.attr", "aria-disabled", "true")
      .click();

    cy.get("[name=totpToken]").type("123456");
    cy.get('[action="/totp-configuration"] [type="submit"]').click();

    cy.contains("Code invalide.");

    // Extract the code from the front to generate the TOTP key
    cy.fillAndSubmitTotpForm("/totp-configuration");

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
});
