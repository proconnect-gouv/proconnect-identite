describe("delete TOTP connexion", () => {
  it("should delete TOTP application", function () {
    cy.visit("/connection-and-account");

    cy.mfaLogin("rogal.dorn@imperialfists.world");

    cy.contains("Code à usage unique");

    cy.contains("Supprimer").click();

    cy.contains("L’application d’authentification a bien été supprimée.");

    cy.maildevGetMessageBySubject(
      "Suppression d'une application d'authentification à double facteur",
    ).then((email) => {
      cy.maildevVisitMessageById(email.id);
      cy.contains(
        "L'application a été supprimée comme étape de connexion à deux facteurs.",
      );
      cy.maildevDeleteMessageById(email.id);
    });
  });

  it("should not be ask to sign with TOTP", function () {
    cy.visit("http://localhost:4000");
    cy.get("button.proconnect-button").click();
    cy.login("rogal.dorn@imperialfists.world");

    cy.contains('"amr": [\n    "pwd"\n  ],');
  });

  it("should disable TOTP", function () {
    cy.visit("/connection-and-account");

    cy.mfaLogin("konrad.curze@nightlords.world");

    cy.contains("Double authentification");

    cy.get("form[action='/delete-authenticator-app-configuration']").submit();

    cy.maildevGetMessageBySubject(
      "Suppression d'une application d'authentification à double facteur",
    ).then((email) => {
      cy.maildevVisitMessageById(email.id);
      cy.contains(
        "L'application a été supprimée comme étape de connexion à deux facteurs.",
      );
      cy.maildevDeleteMessageById(email.id);
    });
  });

  it("should not be ask to sign with TOTP", function () {
    cy.visit("http://localhost:4000");
    cy.get("button.proconnect-button").click();
    cy.login("konrad.curze@nightlords.world");

    cy.contains('"amr": [\n    "pwd"\n  ],');
  });
});
