//

describe("reset password", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("should reset password then sign-in", function () {
    // Visit the signup page
    cy.visit("/users/start-sign-in");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.contains("Email professionnel").click();
    cy.focused().type("lion.eljonson@darkangels.world");
    cy.contains("Continuer").click();

    cy.title().should("include", "Accéder au compte - ProConnect");
    cy.contains("Renseignez votre mot de passe").click();
    cy.focused().type("wrong_password");
    cy.contains("S’identifier").click();

    cy.title().should("include", "Accéder au compte - ProConnect");
    cy.contains("mot de passe incorrect.");

    // start resetting password
    cy.contains("Mot de passe oublié ?").click();

    cy.title().should("include", "Réinitialiser mon mot de passe - ProConnect");
    cy.contains("Réinitialiser mon mot de passe");
    cy.contains("button", "Réinitialiser").click();

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.contains("vous allez recevoir un lien de réinitialisation par e-mail.");

    cy.maildevGetMessageBySubject(
      "Instructions pour la réinitialisation du mot de passe",
    ).then((email) => {
      cy.maildevVisitMessageById(email.id);
      cy.origin("http://localhost:1080", () => {
        cy.contains(
          "Nous avons reçu une demande de réinitialisation de votre mot de passe.",
        );
        cy.contains("Réinitialiser le mot de passe")
          .get("a")
          .invoke("attr", "target", "")
          .click();
      });
      cy.maildevDeleteMessageById(email.id);
    });

    cy.title().should("include", "Changer votre mot de passe - ProConnect");
    cy.contains("Changer votre mot de passe");
    cy.contains("Nouveau mot de passe").click();
    cy.focused().type("new_weak_password_with_decent_length");
    cy.contains("Confirmez votre mot de passe").click();
    cy.focused().type("new_weak_password_with_decent_length");
    cy.contains("Enregistrer").click();

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.contains("Votre mot de passe a été mis à jour.");
    cy.contains("Continuer").click();

    cy.title().should("include", "Accéder au compte - ProConnect");
    cy.contains("Renseignez votre mot de passe").click();
    cy.focused().type("new_weak_password_with_decent_length");
    cy.contains("S’identifier").click();

    cy.title().should("include", "Accueil - ProConnect");
    cy.contains("Votre compte ProConnect");
  });

  it("user should be able to reset password via direct access to the page ", () => {
    cy.visit("/users/reset-password");

    cy.title().should("include", "Réinitialiser mon mot de passe - ProConnect");
    cy.contains("Email professionnel").click();
    cy.focused().type("lion.eljonson@darkangels.world");
    cy.contains("button", "Réinitialiser").click();

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.contains("vous allez recevoir un lien de réinitialisation par e-mail.");

    cy.maildevGetMessageBySubject(
      "Instructions pour la réinitialisation du mot de passe",
    ).then((email) => {
      cy.maildevDeleteMessageById(email.id);
    });
  });
});
