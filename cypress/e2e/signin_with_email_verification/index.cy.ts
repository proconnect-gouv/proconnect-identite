//

describe("sign-in with email verification renewal", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("should sign-in with email verification needed", () => {
    cy.visit("/users/start-sign-in");

    cy.login("lion.eljonson@darkangels.world");

    cy.contains("Confirmer votre adresse");

    cy.contains(
      "Information : pour garantir la sécurité de votre compte, nous avons besoin d’authentifier votre navigateur.",
    );

    cy.contains("Vérifiez les emails reçus par lion.eljonson@darkangels.world");

    cy.verifyEmail();

    cy.contains("Votre compte ProConnect");
  });

  it("should be able to sign in after re-sending code", () => {
    cy.visit("/users/start-sign-in");

    cy.login("rogal.dorn@imperialfists.world");

    cy.get('[action="/users/send-email-verification"]')
      .contains("Recevoir un nouveau code")
      .should("be.disabled");

    // Wait for countdown to last
    cy.wait(10 * 1000);

    cy.maildevDeleteAllMessages();

    cy.get('[action="/users/send-email-verification"]')
      .contains("Recevoir un nouveau code")
      .click();

    cy.contains("Vérifiez les emails reçus par rogal.dorn@imperialfists.world");

    cy.verifyEmail();

    cy.contains("Votre compte ProConnect");
  });
});
