describe("generate recovery words", () => {
  before(cy.seed);

  let recoveryWords: string;

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
        .should("not.equal", firstRecoveryWords)
        .then((text) => {
          recoveryWords = String(text);
        });
    });
  });

  it("should recover the account with recovery words", function () {
    cy.visit("/connection-and-account");
    cy.login("lion.eljonson@darkangels.world");

    cy.contains("Valider avec la double authentification");
    cy.contains("Vous n’avez pas accès à cette méthode ?").click();

    cy.title().should("include", "Utiliser vos mots de secours");

    // wrong words
    cy.get("#recovery-words").type(
      "abandon cible gastrique abandon cible gastrique",
    );
    cy.contains("button", "Continuer").click();
    cy.contains(
      "Erreur : ces mots ne correspondent pas à vos mots de secours.",
    );

    // right words
    cy.get("#recovery-words").type(recoveryWords);
    cy.contains("button", "Continuer").click();

    cy.contains("Votre compte est récupéré");
    cy.contains("Reconfigurer").click();

    cy.contains("Choisir votre méthode de connexion renforcée");
  });

  it("should not ask for 2FA anymore", function () {
    cy.visit("/connection-and-account");
    cy.login("lion.eljonson@darkangels.world");

    cy.title().should("include", "Compte et connexion");
    cy.contains("Configurer la double authentification");
  });
});
