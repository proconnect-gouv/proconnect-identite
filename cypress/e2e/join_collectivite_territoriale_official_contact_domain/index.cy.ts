//

describe("join collectivité territoriale with code send to official contact email", () => {
  beforeEach(cy.seed);

  it("should be able to join when using the official contact email address", function () {
    cy.visit("/users/join-organization");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.login("magnus.the.red@new.prospero.world");

    cy.title().should("include", "Rejoindre une organisation - ProConnect");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("21340126800130");
    cy.contains("Enregistrer").click();

    cy.title().should("include", "Compte créé - ProConnect");
    cy.contains("Compte créé 🎊");
  });

  it("should be able to join when using the official contact private email domain", function () {
    cy.visit("/users/join-organization");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.login("ahriman@new.prospero.world");

    cy.title().should("include", "Rejoindre une organisation - ProConnect");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("21340126800130");
    cy.contains("Enregistrer").click();

    cy.title().should("include", "Compte créé - ProConnect");
    cy.contains("Compte créé 🎊");
  });

  it("should be able to join when using a validated private email domain", function () {
    cy.visit("/users/join-organization");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.login("ahriman@prospero.world");

    cy.title().should(
      "include",
      "Votre organisation de rattachement - ProConnect",
    );
    cy.contains("Commune de lamalou-les-bains - Mairie");
    cy.getByLabel(
      "Sélectionner l'organisation Commune de lamalou-les-bains - Mairie",
    ).click();

    cy.title().should("include", "Compte créé - ProConnect");
    cy.contains("Compte créé 🎊");
  });

  it("should trigger a moderation when using an unknown private email domain", function () {
    cy.visit("/users/join-organization");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.login("god-emperor@mankind.world");

    cy.title().should("include", "Rejoindre une organisation - ProConnect");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("21340126800130");
    cy.contains("Enregistrer").click();

    cy.title().should("include", "Rattachement en cours - ProConnect");
    cy.contains("Demande en cours");
  });

  it("should send a code challenge for user with a free email domain", function () {
    cy.visit("/users/join-organization");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.login("servitor@yopmail.com");

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
          "Jean User1 (servitor@yopmail.com) souhaite rejoindre votre organisation « Commune de lamalou-les-bains - Mairie » sur ProConnect.",
        );
        return cy.get("em:nth-child(1)").invoke("text");
      })
      .then((code) => {
        cy.wrap(code).as("code");
      });

    cy.go("back");
    cy.title().should("include", "Vérifier votre email -");

    cy.get<string>("@code").then((code) => {
      cy.contains("Insérer le code à 2 mots").click();
      cy.focused().clear().type(code);
      cy.contains("Valider").click();
    });

    cy.title().should("include", "Compte créé - ProConnect");
    cy.contains("Compte créé 🎊");
  });
});
