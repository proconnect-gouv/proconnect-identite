//

describe("set info after account provisioning", () => {
  before(cy.seed);

  it("should show InclusionConnect welcome page on first visit", function () {
    // Visit the signup page
    cy.visit("/users/start-sign-in");

    cy.contains("Email professionnel").click();
    cy.focused().type("lion.eljonson@darkangels.world");
    cy.contains("Continuer").click();

    cy.contains("C’est votre première connexion avec ProConnect");

    cy.contains("Continuer").click();

    cy.contains(
      "Pour des raisons de sécurité, nous vous invitons à définir un nouveau mot de passe",
    );

    cy.contains("Mot de passe").click();
    cy.focused().type("This super secret password is hidden well!");
    cy.contains("Continuer").click();

    cy.contains(
      "Pour vérifier que vous avez bien accès à votre email, nous utilisons un code de confirmation.",
    );

    cy.verifyEmail();

    cy.contains("Votre compte ProConnect est à jour.");
    cy.get('[type="submit"]').click();
  });

  it("it should not show InclusionConnect welcome page on second visit", function () {
    // Visit the signup page
    cy.visit("/users/start-sign-in");

    cy.contains("Email professionnel").click();
    cy.focused().type("lion.eljonson@darkangels.world");
    cy.contains("Continuer").click();

    cy.contains("Renseignez votre mot de passe").click();
    cy.focused().type("This super secret password is hidden well!");
    cy.contains("S’identifier").click();

    cy.contains("Votre compte ProConnect");
  });
});
