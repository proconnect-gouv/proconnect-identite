describe("generate recovery codes", () => {
  before(cy.seed);

  it("should generate recovery codes, then prevent regenerating them", function () {
    cy.visit("/connection-and-account");

    cy.mfaLogin("lion.eljonson@darkangels.world");

    cy.contains("Récupération du compte");
    cy.contains("Générer des mots de secours").click();

    cy.contains("Sauvegarder vos mots de secours");

    // 6 words
    cy.getByLabel("Vos mots de secours")
      .find("li")
      .should("have.length", 6)
      .each(($li) => {
        expect($li.text().trim()).to.match(/^\p{L}+$/u);
      });

    cy.contains("Continuer").click();

    cy.title().should("include", "Compte et connexion");

    cy.contains("Générer des mots de secours").should("be.disabled");
  });
});
