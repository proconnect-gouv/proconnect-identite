//

describe("join collectivité territoriale with free contact domain", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("should directly accept the same email address", function () {
    cy.visit("/users/join-organization");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.login("random@yopmail.com");

    cy.title().should("include", "Rejoindre une organisation - ProConnect");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("21740056300011");
    cy.contains("Enregistrer").click();
  });

  it("should send a code challenge for user with a free email domain", function () {
    cy.visit("/users/join-organization");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.login("douglas@yopmail.com");

    cy.title().should("include", "Rejoindre une organisation - ProConnect");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("21740056300011");
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
          "Douglas Le D (douglas@yopmail.com) souhaite rejoindre votre organisation « Commune de chamonix mont blanc - Mairie » sur ProConnect.",
        );
        return cy.get("em:nth-child(1)").invoke("text");
      })
      .then((code) => {
        cy.wrap(code).as("code");
      });

    cy.go("back");

    cy.get<string>("@code").then((code) => {
      cy.contains("Insérer le code reçu").click();
      cy.focused().clear().type(code);
      cy.contains("Valider").click();
    });

    cy.title().should("include", "Compte créé - ProConnect");
    cy.contains("Votre compte est créé !");
  });

  it("should send a code challenge for user with a private email domain", function () {
    cy.visit("/users/join-organization");
    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.login("lion.eljonson@darkangels.world");

    cy.title().should("include", "Rejoindre une organisation - ProConnect");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("21740056300011");
    cy.contains("Enregistrer").click();

    cy.title().should("include", "Vérifier votre email - ProConnect");

    cy.maildevGetMessageBySubject(
      "[ProConnect] Authentifier un email sur ProConnect",
    )
      .then((email) => {
        cy.maildevVisitMessageById(email.id);
        cy.maildevDeleteMessageById(email.id);
        cy.contains(
          "Lion El'Jonson (lion.eljonson@darkangels.world) souhaite rejoindre votre organisation « Commune de chamonix mont blanc - Mairie » sur ProConnect.",
        );
        return cy.get("em:nth-child(1)").invoke("text");
      })
      .then((code) => {
        cy.wrap(code).as("code");
      });

    cy.go("back");

    cy.get<string>("@code").then((code) => {
      cy.contains("Insérer le code reçu").click();
      cy.focused().clear().type(code);
      cy.contains("Valider").click();
    });

    cy.title().should("include", "Compte créé - ProConnect");
    cy.contains("Votre compte est créé !");
  });
});
