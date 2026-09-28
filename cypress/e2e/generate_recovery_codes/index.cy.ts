describe("generate recovery codes", () => {
  before(cy.seed);

  it("should generate recovery codes, then prevent regenerating them", function () {
    cy.visit("/connection-and-account");

    cy.mfaLogin("lion.eljonson@darkangels.world");

    cy.contains("Codes de secours");
    cy.contains("Générer des codes de secours").click();

    cy.contains("Génération des codes de secours");

    // 10 codes, format abcde-f1234-56780-abcde
    cy.getByLabel("Vos codes de secours")
      .find("li")
      .should("have.length", 10)
      .each(($li) => {
        expect($li.text().trim()).to.match(
          /^[0-9a-f]{5}-[0-9a-f]{5}-[0-9a-f]{5}-[0-9a-f]{5}$/,
        );
      });

    cy.contains("J'ai imprimé ou sauvegardé mes codes").click();
    cy.contains("Continuer").click();

    cy.contains("Vos codes de secours sont générés.");
    cy.contains("Continuer").click();

    cy.title().should("include", "Compte et connexion");

    cy.contains("Générer des codes de secours").should("be.disabled");

    cy.visit("/recovery-code");
    cy.title().should("include", "Compte et connexion");
  });
});
