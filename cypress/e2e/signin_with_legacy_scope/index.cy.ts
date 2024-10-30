//

describe("sign-in with legacy scope", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("should sign-in", function () {
    cy.visit("http://localhost:4000");
    cy.setCustomParams({
      scope: "openid email profile phone organizations",
    });
    cy.get("button#custom-connection").click({ force: true });

    cy.login("unused1@yopmail.com");

    cy.contains("standard-client");
    cy.contains("unused1@yopmail.com");
    cy.contains("Commune de lamalou-les-bains");

    // then it should prompt for organization
    cy.visit("http://localhost:4000");
    cy.get("button.proconnect-button").click();
    cy.contains("Votre organisation de rattachement");
    cy.get(".fr-grid-row .fr-col-12:first-child .fr-tile__link").click();
    cy.contains("standard-client");
    cy.contains("Commune de lamalou-les-bains - Mairie");
  });
});
