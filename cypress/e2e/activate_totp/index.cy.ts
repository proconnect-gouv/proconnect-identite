describe("add 2fa authentication", () => {
  before(cy.seed);

  it("should add 2fa authentication on account user", function () {
    cy.visit("/connection-and-account");

    cy.login("lion.eljonson@darkangels.world");

    cy.contains("Double authentification");

    cy.get('[href="/double-authentication-choice"]')
      .contains("Configurer la double authentification")
      .click();

    cy.contains("Choisir votre méthode de connexion renforcée");

    cy.contains("Code à usage unique (TOTP)").click();

    cy.get("#webauthn-registration-button").contains("Continuer").click();

    cy.contains("Configurer votre outil TOTP");

    cy.contains("Quel outil utilisez-vous ?");

    cy.contains("J'ai une application sur mon smartphone").click();

    cy.contains("Confirmer").click();

    cy.contains("Scannez le QR Code avec votre smartphone");

    cy.get("[name=totpToken]").type("123456");
    cy.get('[action="/totp-configuration"] [type="submit"]').click();

    cy.contains("Code invalide.");

    // Extract the code from the front to generate the TOTP key
    cy.fillAndSubmitTotpForm("/totp-configuration");

    cy.title().should("include", "Sauvegardez vos mots de secours");
    cy.contains("Vous avez activé la connexion renforcée (2FA).");
    cy.contains("Ignorer pour le moment").click();

    cy.title().should("include", "Compte et connexion");

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
