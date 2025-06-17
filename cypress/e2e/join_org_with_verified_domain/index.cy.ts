//

//

describe("join organizations", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("join suggested organisation", function () {
    cy.visit("/");
    cy.login("lion.eljonson@darkangels.world");

    // The user gets this suggestion because it as darkangels.world as verified domain
    cy.get(".fr-grid-row .fr-col-12:first-child .fr-tile__link").contains(
      "Commune de clamart - Mairie",
    );

    // The user gets this suggestion because last because it has fewer members
    cy.get(".fr-grid-row .fr-col-12:last-child .fr-tile__link").contains(
      "Commune de clamart - Service assainissement",
    );

    // Click on the suggested organization
    cy.get(".fr-grid-row .fr-col-12:first-child .fr-tile__link").click();

    // Click on "continue" on the welcome page
    cy.get('[type="submit"]').click();

    // Check redirection to home page
    cy.contains("Votre compte ProConnect");
  });

  it("join another organisation", function () {
    cy.visit("/users/join-organization");
    cy.login("lion.eljonson@darkangels.world");

    cy.get('[name="siret"]').type("13002526500013");
    cy.get('[type="submit"]').click();

    // Check redirection to moderation block page
    cy.contains(
      "Nous vérifions votre lien à l’organisation, vous recevrez un email de confirmation dès que votre compte sera validé.",
    );

    // Try to change org
    cy.get(
      'button[aria-label="Corriger l\'organisation de rattachement"]',
    ).click();

    cy.url().should("include", "users/join-organization");

    cy.get('[name="siret"]').type("13002526500013");
    cy.get('[type="submit"]').click();
    cy.contains("Demande en cours");

    // Try to change email

    cy.get('button[aria-label="Corriger l\'adresse email"]').click();

    cy.url().should("include", "/users/start-sign-in");
    cy.contains("S’inscrire ou se connecter");
  });
});
