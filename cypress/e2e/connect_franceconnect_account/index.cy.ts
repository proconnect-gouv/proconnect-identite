describe("Connect FranceConnect account", () => {
  it("Should update personal information with FranceConnect data", function () {
    cy.visit("/personal-information");

    cy.login("god-emperor@mankind.world");

    cy.visit("/personal-information");

    cy.title().should("include", "Informations personnelles -");

    cy.seeInField("Prénom", "God");
    cy.seeInField("Nom", "Emperor");

    cy.contains("S’identifier avec").click();

    cy.origin("https://fcp.integ01.dev-franceconnect.fr", () => {
      cy.contains("Démonstration eIDAS faible").click();
    });
    cy.origin("https://fip1-low.integ01.fcp.fournisseur-d-identite.fr", () => {
      cy.contains("Mot de passe").click();
      cy.focused().type("123");
      cy.contains("Valider").click();
    });
    cy.origin("https://fcp.integ01.dev-franceconnect.fr", () => {
      cy.contains("Continuer sur FSPublic").click();
    });

    cy.title().should("include", "Informations personnelles -");
    cy.contains("Nous avons bien récupéré vos données via FranceConnect.");

    cy.seeInField("Prénom", "Angela Claire Louise");
    cy.seeInField("Nom", "DUBOIS");
  });
});
