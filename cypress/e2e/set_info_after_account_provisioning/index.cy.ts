//

describe("set info after account provisioning", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("should show InclusionConnect welcome page on first visit", function () {
    // Visit the signup page
    cy.visit("/users/start-sign-in");

    // Sign in with the wrong password
    cy.get('[name="login"]').type("lion.eljonson@darkangels.world");
    cy.get('[type="submit"]').click();

    cy.contains("C’est votre première connexion avec ProConnect");

    cy.get('[type="submit"]').contains("Continuer").click();

    cy.contains(
      "Pour des raisons de sécurité, nous vous invitons à définir un nouveau mot de passe",
    );
    cy.get('[name="password"]').type(
      "This super secret password is hidden well!",
    );
    cy.get('[action="/users/sign-up"]  [type="submit"]').click();

    cy.contains(
      "Pour vérifier que vous avez bien accès à votre email, nous utilisons un code de confirmation.",
    );

    cy.getVerificationEmail();

    cy.contains(
      "Nous avons pré-rempli ces informations. Vous pouvez toujours les mettre à jour.",
    );

    cy.get('[name="job"]').type("Petit chef");
    cy.get('[type="submit"]').click();

    cy.contains("Votre compte ProConnect est à jour.");
    cy.get('[type="submit"]').click();
  });

  it("it should not show InclusionConnect welcome page on second visit", function () {
    // Visit the signup page
    cy.visit("/users/start-sign-in");

    // Sign in with the wrong password
    cy.get('[name="login"]').type("lion.eljonson@darkangels.world");
    cy.get('[type="submit"]').click();

    cy.contains("Accéder au compte");
  });
});
