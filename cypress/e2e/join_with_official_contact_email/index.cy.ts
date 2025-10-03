//

describe("join organizations", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("join collectivité territoriale with official contact email", function () {
    cy.visit("/users/join-organization");
    cy.login("magnus.the.red@prospero.world");

    cy.get('[name="siret"]').type("21340126800130");
    cy.get('[type="submit"]').click();

    // Check the choice of email

    cy.contains("Continuer avec cet email").click();

    cy.contains("Votre compte est créé !");
  });

  it("join primary school with official contact email", function () {
    cy.visit("/users/join-organization");
    cy.login("magnus.the.red@prospero.world");

    cy.get('[name="siret"]').type("21340126800049");
    cy.get('[type="submit"]').click();

    cy.contains("Votre compte est créé !");
  });
});
