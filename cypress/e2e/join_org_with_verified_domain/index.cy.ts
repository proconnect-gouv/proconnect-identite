//

describe("join organizations", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("join suggested organisation", function () {
    cy.visit("/users/join-organization");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.login("lion.eljonson@darkangels.world");

    // The user gets this suggestion because it as darkangels.world as verified domain
    cy.get(".fr-grid-row .fr-col-12:first-child .fr-tile__link").contains(
      "Commune de clamart - Mairie",
    );

    // The user gets this suggestion because last because it has fewer members
    cy.get(".fr-grid-row .fr-col-12:last-child .fr-tile__link").contains(
      "Commune de clamart - Service assainissement",
    );

    cy.getByLabel(
      "Sélectionner l'organisation Commune de clamart - Mairie",
    ).click();

    cy.title().should("include", "Compte créé - ProConnect");
    cy.contains("Continue").click();

    cy.title().should("include", "Accueil - ProConnect");
    cy.contains("Votre compte ProConnect");
  });

  it("join another organisation", function () {
    cy.visit("/users/join-organization");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.login("lion.eljonson@darkangels.world");

    cy.title().should("include", "Rejoindre une organisation - ProConnect");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("13002526500013");
    cy.contains("Enregistrer").click();

    cy.title().should("include", "Rattachement en cours - ProConnect");
    cy.contains(
      "Nous vérifions votre lien à l’organisation, vous recevrez un email de confirmation dès que votre compte sera validé.",
    );

    // Try to change org
    cy.getByLabel("Corriger l'organisation de rattachement").click();

    cy.title().should("include", "Rejoindre une organisation - ProConnect");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("13002526500013");
    cy.contains("Enregistrer").click();

    cy.title().should("include", "Rattachement en cours - ProConnect");
    cy.contains("Demande en cours");

    // Try to change email
    cy.getByLabel("Corriger l'adresse email").click();

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.contains("S’inscrire ou se connecter");
  });
});
