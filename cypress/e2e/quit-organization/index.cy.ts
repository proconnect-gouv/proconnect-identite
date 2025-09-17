//

describe("quit the organization", () => {
  beforeEach(cy.seed);

  it("quit one of my organizations", function () {
    cy.visit("/");

    cy.title().should("include", "S'inscrire ou se connecter -");
    cy.login("lion.eljonson@yopmail.com");

    cy.title().should("include", "Accueil -");
    cy.contains("Organisations").click();

    cy.title().should("include", "Organisations -");
    cy.getByLabel(
      "Quitter l'organisation Lycee general et technologique chaptal",
    ).click();

    cy.contains("Vous ne faites désormais plus partie de cette organisation.");
  });

  it("quit my last organization and get redirected to join page", function () {
    cy.visit("/");

    cy.title().should("include", "S'inscrire ou se connecter -");
    cy.login("lion.eljonson@yopmail.com");

    cy.title().should("include", "Accueil -");
    cy.contains("Organisations").click();

    cy.title().should("include", "Organisations -");
    cy.getByLabel(
      "Quitter l'organisation Lycee general et technologique chaptal",
    ).click();
    cy.getByLabel(
      "Quitter l'organisation Services de l'etat pour la facturation electronique - Destination etat via chorus pro",
    ).click();

    cy.title().should("include", "Rejoindre une organisation -");
  });
});
