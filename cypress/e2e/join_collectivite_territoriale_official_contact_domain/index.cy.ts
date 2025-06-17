//

describe("join organizations", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("join collectivité territoriale with official contact domain", function () {
    cy.visit("/users/join-organization");
    cy.login("lion.eljonson@darkangels.world");

    cy.get('[name="siret"]').type("21740056300011");
    cy.get('[type="submit"]').click();

    cy.contains("Votre compte est créé !");
  });
});
