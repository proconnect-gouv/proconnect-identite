describe("generate recovery words", () => {
  beforeEach(cy.seed);

  it("should generate, verify, then regenerate recovery words", function () {
    cy.visit("/connection-and-account");

    cy.mfaLogin("without-recovery-words@yopmail.com");

    cy.title().should("include", "Sauvegardez vos mots de secours");
    cy.contains("Ignorer pour le moment").click();

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

    cy.contains("En numérique");
    cy.contains("En papier");

    cy.contains("label", "J’ai sauvegardé mes mots de secours").click();
    cy.contains("Continuer").click();

    cy.title().should("include", "Compte et connexion");

    cy.maildevGetMessageBySubject("Mots de secours créés").then((email) => {
      cy.maildevVisitMessageById(email.id);
      cy.contains("Des mots de secours ont été créés pour votre compte.");
      cy.maildevDeleteMessageById(email.id);
    });
    cy.visit("/connection-and-account");

    cy.contains("Création :");

    // verify with wrong words
    cy.contains("Vérifier mes mots de secours").click();
    cy.contains("label", "Vos 6 mots de secours").click();
    cy.focused().type("maître guerre loup lunaire hérésie traître");
    cy.contains("button", "Vérifier").click();
    cy.contains(
      "Erreur : ces mots ne correspondent pas à vos mots de secours.",
    );

    // verify with the right words
    cy.get("@firstRecoveryWords").then((firstRecoveryWords) => {
      cy.contains("label", "Vos 6 mots de secours").click();
      cy.focused().type(String(firstRecoveryWords));
    });
    cy.contains("button", "Vérifier").click();
    cy.contains("Vos mots de secours sont valides.");

    // regenerate
    cy.visit("/connection-and-account");

    cy.contains("Régénérer mes mots de secours").click();
    cy.contains("dialog", "Régénérer vos mots de secours ?")
      .contains("button", "Régénérer")
      .click();

    cy.contains("Sauvegarder vos mots de secours");

    cy.get("@firstRecoveryWords").then((firstRecoveryWords) => {
      cy.getByLabel("Vos mots de secours")
        .invoke("text")
        .then((text) => text.trim())
        .should("not.equal", firstRecoveryWords);
    });

    cy.maildevGetMessageBySubject("Mots de secours modifiés").then((email) => {
      cy.maildevVisitMessageById(email.id);
      cy.contains("Vos mots de secours ont été modifiés.");
      cy.maildevDeleteMessageById(email.id);
    });
  });

  it("should recover the account with recovery words", function () {
    cy.visit("/connection-and-account");
    cy.login("with-recovery-words@yopmail.com");

    cy.contains("Valider avec la double authentification");
    cy.contains("Vous n’avez pas accès à cette méthode ?").click();

    cy.title().should("include", "Utiliser vos mots de secours");

    // wrong words
    cy.contains("label", "Mots de secours").click();
    cy.focused().type("maître guerre loup lunaire hérésie traître");
    cy.contains("button", "Continuer").click();
    cy.contains(
      "Erreur : ces mots ne correspondent pas à vos mots de secours.",
    );

    // right words
    cy.contains("label", "Mots de secours").click();
    cy.focused().type("caliban forteresse ange noir épée lion");
    cy.contains("button", "Continuer").click();

    cy.contains("Votre compte est récupéré");
    cy.contains("Reconfigurer").click();

    // the session has been reset: the user signs in again, email is prefilled
    cy.get('[name="password"]').type("password123");
    cy.get('[action="/users/sign-in"]  [type="submit"]')
      .contains("S’identifier")
      .click();

    cy.contains("Choisir votre méthode de connexion renforcée");

    // 2FA is not asked anymore
    cy.clearAllCookies();
    cy.visit("/connection-and-account");
    cy.login("with-recovery-words@yopmail.com");

    cy.title().should("include", "Compte et connexion");
    cy.contains("Configurer la double authentification");
  });

  it("should only show digital storage advice to State administration agents", function () {
    cy.visit("/connection-and-account");
    cy.mfaLogin("state-administration-agent@yopmail.com");

    cy.title().should("include", "Sauvegardez vos mots de secours");
    cy.contains("Ignorer pour le moment").click();

    cy.contains("Générer des mots de secours").click();
    cy.title().should("include", "Sauvegarder vos mots de secours");

    cy.contains("En numérique");
    cy.contains("En papier").should("not.exist");
  });
});
