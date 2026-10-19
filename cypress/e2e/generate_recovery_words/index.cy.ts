describe("generate recovery words", () => {
  before(cy.seed);

  it("should generate, verify, then regenerate recovery words", function () {
    cy.visit("/connection-and-account");

    cy.mfaLogin("lion.eljonson@darkangels.world");

    cy.contains("Récupération du compte");
    cy.contains("Générer des mots de secours").click();

    cy.contains("Sauvegarder vos mots de secours");

    cy.getByLabel("Vos mots de secours")
      .invoke("text")
      .then((text) => text.trim())
      .as("firstRecoveryWords", { type: "static" });

    cy.get("@firstRecoveryWords").then((firstRecoveryWords) => {
      const words = String(firstRecoveryWords).split(" ");
      expect(words).to.have.length(6);
      words.forEach((word) => expect(word).to.match(/^\p{L}+$/u));
    });

    cy.contains("Continuer").click();

    cy.title().should("include", "Compte et connexion");
    cy.contains("Création :");

    // verify with wrong words
    cy.contains("Vérifier mes mots de secours").click();
    cy.get("#recovery-words").type(
      "abandon cible gastrique abandon cible gastrique",
    );
    cy.contains("button", "Vérifier").click();
    cy.contains(
      "Erreur : ces mots ne correspondent pas à vos mots de secours.",
    );

    // verify with the right words
    cy.get("@firstRecoveryWords").then((firstRecoveryWords) => {
      cy.get("#recovery-words").type(String(firstRecoveryWords));
    });
    cy.contains("button", "Vérifier").click();
    cy.contains("Vos mots de secours sont valides.");

    // regenerate
    cy.visit("/connection-and-account");

    cy.contains("Régénérer mes mots de secours").click();
    cy.get("#regenerate-recovery-words-modal")
      .contains("button", "Régénérer")
      .click();

    cy.contains("Sauvegarder vos mots de secours");

    cy.get("@firstRecoveryWords").then((firstRecoveryWords) => {
      cy.getByLabel("Vos mots de secours")
        .invoke("text")
        .then((text) => text.trim())
        .should("not.equal", firstRecoveryWords);
    });
  });
});
