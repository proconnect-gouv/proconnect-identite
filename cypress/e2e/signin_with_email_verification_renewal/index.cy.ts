//

describe("sign-in with email verification renewal", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("should sign-in with email verification needed", () => {
    // Visit the signup page
    cy.visit("/users/start-sign-in");

    cy.login("lion.eljonson@darkangels.world");

    cy.contains(
      "pour garantir la sécurité de votre compte, votre adresse email doit être vérifiée régulièrement.",
    );

    cy.verifyEmail();

    cy.contains("Votre compte ProConnect");
  });

  it("should not show renewal notification for account creation", () => {
    cy.visit("/users/start-sign-in");

    cy.get('[name="login"]').type("unused1@yopmail.com");
    cy.get('[type="submit"]').click();

    cy.get('[name="password"]').type(
      "somerandomandlongpasswordthatshouldcontentmcpsecuritypolicy",
    );
    cy.get('[action="/users/sign-up"]  [type="submit"]')
      .contains("Valider")
      .click();

    cy.contains(
      "pour garantir la sécurité de votre compte, votre adresse email doit être vérifiée régulièrement.",
    ).should("not.exist");
  });
});
