//

describe("sign-in with legacy scope", () => {
  before(cy.seed);

  it("should return empty organizations list when SP is asking for legacy organizations scope", function () {
    cy.visit("http://localhost:4000");

    cy.title().should("equal", "standard-client - ProConnect");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      scope: "openid email profile phone organizations",
    }));
    cy.get("button#custom-connection").click({ force: true });

    cy.title().should("equal", "S'inscrire ou se connecter - ProConnect");
    cy.login("unused1@yopmail.com");
    cy.title().should("include", "Choisir une organisation - ");
    cy.getByLabel(
      "Commune de lamalou-les-bains - Mairie (choisir cette organisation)",
    ).click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains("standard-client");
    cy.contains("unused1@yopmail.com");
    cy.contains("Commune de lamalou-les-bains").should("not.exist");
    cy.contains(`"organizations": []`);
    cy.contains('"scope": "openid email profile phone organizations",');
  });
});
