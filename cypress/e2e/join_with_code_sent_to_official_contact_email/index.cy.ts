//

describe("join collectivité territoriale with code send to official contact email", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("should send a code challenge for user with a private email domain", function () {
    cy.visit("/users/join-organization");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.login("magnus.the.red@prospero.world");

    cy.title().should("include", "Rejoindre une organisation - ProConnect");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("21340126800130");
    cy.contains("Enregistrer").click();

    cy.title().should("include", "Vérifier votre email - ProConnect");
    cy.contains(
      "nous avons envoyé un code à l’adresse email officielle de votre mairie",
    );
    cy.get(".email-badge-lowercase").contains("contact@mairielamalou.fr");

    cy.maildevGetMessageBySubject(
      "[ProConnect] Authentifier un email sur ProConnect",
    )
      .then((email) => {
        cy.maildevVisitMessageById(email.id);
        cy.maildevDeleteMessageById(email.id);
        cy.contains(
          "Jean Nouveau (magnus.the.red@prospero.world) souhaite rejoindre votre organisation « Commune de lamalou-les-bains - Mairie » sur ProConnect.",
        );
        return cy.get("em:nth-child(1)").invoke("text");
      })
      .then((code) => {
        cy.wrap(code).as("code");
      });

    cy.go("back");
    cy.title().should("include", "Vérifier votre email -");

    cy.get<string>("@code").then((code) => {
      cy.contains("Insérer le code reçu").click();
      cy.focused().clear().type(code);
      cy.contains("Valider").click();
    });

    cy.title().should("include", "Compte créé - ProConnect");
    cy.contains("Votre compte est créé !");
  });

  it("should ask which mairie to select and then send a code challenge to the selected one", function () {
    cy.visit("/users/join-organization");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.login("eneeria@prospero.world");

    cy.title().should("include", "Rejoindre une organisation - ProConnect");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("20008557900015");
    cy.contains("Enregistrer").click();

    cy.contains("À quelle adresse e-mail souhaitez-vous recevoir le code ?");

    cy.contains("mairie.contact@carentan.fr").click();

    cy.contains("Valider").click();

    cy.title().should("include", "Vérifier votre email - ProConnect");
    cy.contains(
      "nous avons envoyé un code à l’adresse email officielle de votre mairie",
    );
    cy.get(".email-badge-lowercase").contains("mairie.contact@carentan.fr");

    cy.maildevGetMessageBySubject(
      "[ProConnect] Authentifier un email sur ProConnect",
    )
      .then((email) => {
        cy.maildevVisitMessageById(email.id);
        cy.maildevDeleteMessageById(email.id);
        cy.contains(
          "Marie Elisabeth (eneeria@prospero.world) souhaite rejoindre votre organisation « Commune de carentan-les-marais - Mairie » sur ProConnect.",
        );
        return cy.get("em:nth-child(1)").invoke("text");
      })
      .then((code) => {
        cy.wrap(code).as("code");
      });

    cy.go("back");
    cy.title().should("include", "Vérifier votre email -");

    cy.get<string>("@code").then((code) => {
      cy.contains("Insérer le code reçu").click();
      cy.focused().clear().type(code);
      cy.contains("Valider").click();
    });

    cy.title().should("include", "Compte créé - ProConnect");
    cy.contains("Votre compte est créé !");
  });

  it("should send a code challenge for user with a free email domain", function () {
    cy.visit("/users/join-organization");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.login("unused1@yopmail.com");

    cy.title().should("include", "Rejoindre une organisation - ProConnect");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("21340126800130");
    cy.contains("Enregistrer").click();

    cy.title().should("include", "Confirmer le rattachement - ProConnect");
    cy.contains("Continuer avec cet email").click();

    cy.title().should("include", "Vérifier votre email - ProConnect");

    cy.maildevGetMessageBySubject(
      "[ProConnect] Authentifier un email sur ProConnect",
    )
      .then((email) => {
        cy.maildevVisitMessageById(email.id);
        cy.maildevDeleteMessageById(email.id);
        cy.contains(
          "Jean User1 (unused1@yopmail.com) souhaite rejoindre votre organisation « Commune de lamalou-les-bains - Mairie » sur ProConnect.",
        );
        return cy.get("em:nth-child(1)").invoke("text");
      })
      .then((code) => {
        cy.wrap(code).as("code");
      });

    cy.go("back");
    cy.title().should("include", "Vérifier votre email -");

    cy.get<string>("@code").then((code) => {
      cy.contains("Insérer le code reçu").click();
      cy.focused().clear().type(code);
      cy.contains("Valider").click();
    });

    cy.title().should("include", "Compte créé - ProConnect");
    cy.contains("Votre compte est créé !");
  });
});
