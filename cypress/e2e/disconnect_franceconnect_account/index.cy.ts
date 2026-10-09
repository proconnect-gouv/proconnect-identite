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

    cy.contains("Identité FranceConnect");
    cy.contains(
      "Vous avez utilisé votre identité FranceConnect pour pré-remplir vos informations personnelles.",
    );
    cy.contains("Dernière connexion FranceConnect");
    cy.contains("vendredi 20 février 2026");
    cy.contains("Mettre à jour votre identité FranceConnect");
    cy.contains(
      "Supprimer le lien entre FranceConnect et votre compte ProConnect",
    );

    cy.contains("Délier les comptes").click();

    cy.title().should("include", "Informations personnelles -");
    cy.contains("Vous êtes maintenant déconnecté de FranceConnect.");

    cy.get('select[name="given_name"]').should("not.exist");
    cy.get('select[name="family_name"]').should("not.exist");
    cy.seeInField("Prénom", "Jean");
    cy.seeInField("Nom", "Valjean");

    cy.contains(
      "Vous pouvez utiliser votre identité FranceConnect pour pré-remplir vos informations personnelles.",
    );
    cy.contains("Délier les comptes").should("not.exist");
    cy.contains("Dernière connexion FranceConnect").should("not.exist");
  });
});
