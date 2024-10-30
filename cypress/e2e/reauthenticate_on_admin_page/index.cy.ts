describe("force recent connexion + 2FA on admin pages", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("should be redirected after long connexion", function () {
    cy.visit("/");

    cy.login("unused1@yopmail.com");

    cy.contains("Votre compte ProConnect");

    cy.visit("/connection-and-account");

    cy.contains("merci de valider votre deuxième étape de connexion");

    cy.fillTotpFields();

    cy.contains("Compte et connexion");

    // Wait for connexion to last
    cy.wait(5 * 1000);

    cy.getDescribed("Code à usage unique").within(() => {
      cy.contains("Supprimer").click();
    });

    cy.contains("merci de vous identifier à nouveau");

    cy.mfaLogin("unused1@yopmail.com");

    cy.contains("Compte et connexion");
  });
});
