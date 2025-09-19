//

describe("delete account", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("should delete account", function () {
    cy.visit("/connection-and-account");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.login("lion.eljonson@darkangels.world");

    cy.title().should("include", "Compte et connexion");
    cy.contains("Suppression");
    cy.contains("Supprimer mon compte").click();

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
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
