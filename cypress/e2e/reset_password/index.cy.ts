//

describe("sign-in with magic link", () => {
  it("should reset password then sign-in", function () {
    // Visit the signup page
    cy.visit("/users/start-sign-in");

    // Sign in with the wrong password
    cy.get('[name="login"]').type("lion.eljonson@darkangels.world");
    cy.get('[type="submit"]').click();

    cy.get('[action="/users/sign-in"] [name="password"]').type(
      "wrong_password",
    );
    cy.get('[action="/users/sign-in"] [type="submit"]').click();

    cy.contains("mot de passe incorrect.");

    // start resetting password
    cy.get('a[href="/users/reset-password"]')
      .contains("Mot de passe oublié ?")
      .click();

    cy.contains("Réinitialiser mon mot de passe");

    cy.get('[action="/users/reset-password"] [type="submit"]').click();

    cy.contains("vous allez recevoir un lien de réinitialisation par e-mail.");

    cy.maildevGetMessageBySubject(
      "Instructions pour la réinitialisation du mot de passe",
    ).then((email) => {
      cy.maildevVisitMessageById(email.id);
      cy.contains(
        "Nous avons reçu une demande de réinitialisation de votre mot de passe.",
      );
      cy.contains("Réinitialiser le mot de passe").click();
      cy.maildevDeleteMessageById(email.id);
    });

    cy.contains("Changer votre mot de passe");

    cy.get('[action="/users/change-password"] [name="password"]').type(
      "new_weak_password_with_decent_length",
    );
    cy.get('[action="/users/change-password"] [name="confirm_password"]').type(
      "new_weak_password_with_decent_length",
    );
    cy.get('[action="/users/change-password"] [type="submit"]').click();

    cy.contains("Votre mot de passe a été mis à jour.");

    cy.get('[action="/users/start-sign-in"] [type="submit"]').click();

    cy.get('[action="/users/sign-in"] [name="password"]').type(
      "new_weak_password_with_decent_length",
    );
    cy.get('[action="/users/sign-in"] [type="submit"]').click();

    cy.contains("Votre compte ProConnect");
  });
});
