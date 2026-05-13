//

describe("join collectivité territoriale with official contact domain", () => {
  before(cy.seed);

  it("should directly accept the same domain address", function () {
    cy.visit("/users/join-organization");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.login("lion.eljonson@darkangels.world");

    cy.title().should("include", "Rejoindre une organisation - ProConnect");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("21740056300011");
    cy.contains("Enregistrer").click();

    cy.title().should("include", "Compte créé - ProConnect");
    cy.contains("Compte créé 🎊");
  });
});
