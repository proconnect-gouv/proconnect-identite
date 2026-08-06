describe("Disconnect FranceConnect account", () => {
  before(cy.seed);

  it("should disconnect FranceConnect and restore editable name fields", function () {
    cy.visit("/personal-information");

    cy.login("jean.valjean@republic.fr");

    cy.visit("/personal-information");

    cy.title().should("include", "Informations personnelles -");

    cy.contains("À choisir parmi la liste de vos prénoms issus de");
    cy.get('select[name="given_name"]').should("exist");
    cy.get('select[name="family_name"]').should("exist");

    cy.contains("Se déconnecter de FranceConnect").click();

    cy.title().should("include", "Informations personnelles -");
    cy.contains("Vous êtes maintenant déconnecté de FranceConnect.");

    cy.get('select[name="given_name"]').should("not.exist");
    cy.get('select[name="family_name"]').should("not.exist");
    cy.seeInField("Prénom", "Jean");
    cy.seeInField("Nom", "Valjean");
  });
});
