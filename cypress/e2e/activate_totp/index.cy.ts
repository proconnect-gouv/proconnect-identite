describe("add 2fa authentication", () => {
  it("should add 2fa authentication on account user", function () {
    cy.visit("/connection-and-account");

    cy.login("lion.eljonson@darkangels.world");

    cy.contains("Double authentification");

    cy.get('[href="/double-authentication"]')
      .contains("Configurer la double authentification")
      .click();

    cy.contains("Choisir votre méthode de double authentification");

    cy.get("button#2fa-configuration").click({ force: true });

    cy.contains("Installer votre outil d’authentification");

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

    // Extract the code from the front to generate the TOTP key
    cy.getTotpSecret("/authenticator-app-configuration");

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
