describe("generate recovery words", () => {
  before(cy.seed);

  it("should generate recovery words, then regenerate them", function () {
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

    cy.getByLabel("Vos mots de secours")
      .invoke("text")
      .as("firstRecoveryWords", { type: "static" });

    cy.contains("Continuer").click();

    cy.title().should("include", "Compte et connexion");
    cy.contains("Générés le");

    cy.contains("Regénérer mes mots de secours").click();
    cy.get("#regenerate-recovery-words-modal")
      .contains("button", "Regénérer")
      .click();

    cy.contains("Sauvegarder vos mots de secours");

    cy.get("@firstRecoveryWords").then((firstRecoveryWords) => {
      cy.getByLabel("Vos mots de secours")
        .invoke("text")
        .should("not.equal", firstRecoveryWords);
    });
  });
});
