//

describe("sign-in from broken client", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("should fail with invalid redirect uri", function () {
    cy.visit("http://localhost:4000");
    cy.get("button.proconnect-button").click();

    cy.title().should("include", "Erreur 400 - ProConnect");
    cy.contains("Erreur 400");
    cy.contains("invalid_redirect_uri");
  });

  it("should still work with valid clients", function () {
    cy.visit("http://localhost:4001");
    cy.get("button.proconnect-button").click();

    cy.title().should("include", "Choisir votre mot de passe - ProConnect");
  });
});
