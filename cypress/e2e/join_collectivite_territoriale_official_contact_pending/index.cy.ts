//

describe("pending code sent to official contact email", () => {
  beforeEach(cy.seed);

  it("should not authorize a user to use the pending organization link", function () {
    cy.visit("http://localhost:4000");

    cy.get("button.proconnect-button").click();

    cy.login("god-emperor@yopmail.com");

    cy.contains('"email": "god-emperor@yopmail.com"');
    cy.contains('"siret": "11009001600053"');

    cy.visit("/users/join-organization");

    cy.title().should("include", "Rejoindre une organisation - ProConnect");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("21340126800130");
    cy.contains("Enregistrer").click();

    cy.title().should("include", "Confirmer le rattachement - ProConnect");
    cy.contains("Continuer avec cet email").click();

    cy.title().should("include", "Vérifier votre email - ProConnect");

    cy.visit("http://localhost:4000");

    cy.get("button.proconnect-button").click();

    cy.contains('"email": "god-emperor@yopmail.com"');
    cy.contains('"siret": "11009001600053"');
  });
});
