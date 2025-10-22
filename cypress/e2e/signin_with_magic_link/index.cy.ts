//

describe("sign-in with magic link", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("should sign-up with magic link", function () {
    cy.visit("/users/start-sign-in");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.contains("Email professionnel").click();
    cy.focused().type("lion.eljonson@darkangels.world");
    cy.contains("Valider").click();

    cy.title().should("include", "Choisir votre mot de passe - ProConnect");
    cy.contains("Recevoir un lien d’identification").click();

    cy.title().should(
      "include",
      "Recevoir un lien d'identification - ProConnect",
    );
    cy.contains("Votre lien vous attend à l’adresse...");

    cy.maildevGetMessageBySubject("Lien de connexion à ProConnect").then(
      (email) => {
        cy.maildevVisitMessageById(email.id);
        cy.origin("http://localhost:1080", () => {
          cy.contains(
            "Vous avez demandé un lien d'identification à ProConnect. Utilisez le bouton ci-dessous pour vous connecter instantanément.",
          );
          cy.contains("Se connecter")
            .get("a")
            .invoke("attr", "target", "")
            .click();
        });
        cy.maildevDeleteMessageById(email.id);
      },
    );

    cy.title().should("include", "Renseigner votre identité - ProConnect");
    cy.contains("Renseigner son identité");
  });

  it("should sign-in with magic link without setting password", function () {
    cy.visit("/users/start-sign-in");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.contains("Email professionnel").click();
    cy.focused().type("lion.eljonson@darkangels.world");
    cy.contains("Valider").click();

    cy.title().should("include", "Choisir votre mot de passe - ProConnect");
    cy.contains(
      "Pour des raisons de sécurité, nous vous invitons à définir un nouveau mot de passe",
    );

    cy.contains("button", "Recevoir un lien d’identification").click();

    cy.title().should(
      "include",
      "Recevoir un lien d'identification - ProConnect",
    );
    cy.contains("Votre lien vous attend à l’adresse...");

    cy.maildevGetMessageBySubject("Lien de connexion à ProConnect").then(
      (email) => {
        cy.maildevVisitMessageById(email.id);
        cy.origin("http://localhost:1080", () => {
          cy.contains(
            "Vous avez demandé un lien d'identification à ProConnect. Utilisez le bouton ci-dessous pour vous connecter instantanément.",
          );
          cy.contains("Se connecter")
            .get("a")
            .invoke("attr", "target", "")
            .click();
        });
        cy.maildevDeleteMessageById(email.id);
      },
    );

    cy.title().should("include", "Renseigner votre identité - ProConnect");
    cy.contains("Renseigner son identité");
  });

  it("should set a password", function () {
    cy.visit("/users/start-sign-in");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.contains("Email professionnel").click();
    cy.focused().type("lion.eljonson@darkangels.world");
    cy.contains("Valider").click();

    cy.title().should("include", "Choisir votre mot de passe - ProConnect");
    cy.contains("Mot de passe").click();
    cy.focused().type("This super secret password is hidden well!");
    cy.contains("Valider").click();

    cy.verifyEmail();

    cy.title().should("include", "Renseigner votre identité - ProConnect");
    cy.contains("Renseigner son identité");
  });

  it("should sign-in with magic link without set password prompt", function () {
    cy.visit("/users/start-sign-in");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.contains("Email professionnel").click();
    cy.focused().type("lion.eljonson@darkangels.world");
    cy.contains("Valider").click();

    cy.title().should("include", "Accéder au compte - ProConnect");
    cy.contains(
      "Pour des raisons de sécurité, nous vous invitons à définir un nouveau mot de passe",
    ).should("not.exist");

    cy.contains("button", "Recevoir un lien d’identification").click();

    cy.title().should(
      "include",
      "Recevoir un lien d'identification - ProConnect",
    );
    cy.contains("Votre lien vous attend à l’adresse...");

    cy.maildevGetMessageBySubject("Lien de connexion à ProConnect").then(
      (email) => {
        cy.maildevVisitMessageById(email.id);
        cy.origin("http://localhost:1080", () => {
          cy.contains(
            "Vous avez demandé un lien d'identification à ProConnect. Utilisez le bouton ci-dessous pour vous connecter instantanément.",
          );
          cy.contains("Se connecter")
            .get("a")
            .invoke("attr", "target", "")
            .click();
        });
        cy.maildevDeleteMessageById(email.id);
      },
    );

    cy.title().should("include", "Renseigner votre identité - ProConnect");
    cy.contains("Renseigner son identité");
  });
});
