//

describe("join and moderation", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("will be moderated", function () {
    cy.visit("/");

    cy.title().should("include", "S'inscrire ou se connecter -");
    cy.login("lion.eljonson@darkangels.world");

    cy.title().should("include", "Rejoindre une organisation -");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("66204244933106");
    cy.contains("Enregistrer").click();

    cy.title().should("include", "Rattachement en cours -");
    cy.contains("Demande en cours");
    cy.contains(
      "Nous vérifions votre lien à l’organisation, vous recevrez un email de confirmation dès que votre compte sera validé.",
    );
  });

  it("will join with a non blocking moderation", function () {
    cy.visit("/");

    cy.title().should("include", "S'inscrire ou se connecter -");
    cy.login("god-emperor@mankind.world");

    cy.title().should("include", "Rejoindre une organisation -");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("66204244933106");
    cy.contains("Enregistrer").click();

    cy.title().should("include", "Compte créé -");
    cy.contains("Votre compte est créé !");
  });
});
