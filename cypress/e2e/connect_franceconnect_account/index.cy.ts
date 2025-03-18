describe("Connect FranceConnect account", () => {
  it("Should update personal information with FranceConnect data", function () {
    cy.visit("/personal-information");

    cy.login("god-emperor@mankind.world");

    cy.visit("/personal-information");

    cy.title().should("include", "Informations personnelles -");

    cy.seeInField("Prénom", "God");
    cy.seeInField("Nom", "Emperor");

    cy.contains("S’identifier avec").click();

    cy.origin("http://localhost:8600", () => {
      cy.contains("Edit").click();
      cy.contains("label", "family_name").click();
      cy.focused().clear().type("De La Rose");
      cy.contains("Je suis Jean De La Rose").click();
    });

    cy.title().should("include", "Informations personnelles -");
    cy.contains("Nous avons bien récupéré vos données via FranceConnect.");

    cy.seeInField("Prénom", "Jean");
    cy.seeInField("Nom", "De La Rose");
  });
});
