//

describe("delete account", () => {
  it("should delete account", function () {
    cy.visit("/connection-and-account");

    cy.login("lion.eljonson@darkangels.world");

    cy.contains("Suppression");

    cy.contains("Supprimer mon compte").click();

    cy.contains("Votre compte a bien été supprimé.");

    cy.maildevGetMessageBySubject("Suppression de compte").then((email) => {
      cy.maildevVisitMessageById(email.id);
      cy.contains(
        "Nous vous confirmons que votre demande de suppression de compte a bien été prise en compte.",
      );
      cy.maildevDeleteMessageById(email.id);
    });
  });

  it("should logout from FranceConnect and delete account", function () {
    cy.visit("/personal-information");
    cy.login("franceconnected+jean@bon.com");

    cy.title().should("include", "Informations personnelles -");
    cy.contains("S’identifier avec").click();
    cy.title().should("include", "Connexion 🎭 FranceConnect 🎭");
    cy.contains("Je suis Jean Dupont").click();

    // WARNING(douglasduteil): auto logout post FranceConnect connexion bypass
    // We are trying to come back to the our app with an open FranceConnect session here
    cy.visit("/connection-and-account");

    cy.contains("Suppression");

    cy.contains("Supprimer mon compte").click();

    cy.title().should("include", "Déconnexion 🎭 FranceConnect 🎭");
    cy.contains("Déconnexion en cours...");

    cy.contains("Votre compte a bien été supprimé.");

    cy.maildevGetMessageBySubject("Suppression de compte").then((email) => {
      cy.maildevVisitMessageById(email.id);
      cy.contains(
        "Nous vous confirmons que votre demande de suppression de compte a bien été prise en compte.",
      );
      cy.maildevDeleteMessageById(email.id);
    });
  });
});
