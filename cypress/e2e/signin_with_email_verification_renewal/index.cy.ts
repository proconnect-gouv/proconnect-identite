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

    cy.maildevGetMessageBySubject("Vérification de votre adresse email")
      .then((email) => {
        cy.maildevVisitMessageById(email.id);
        cy.contains(
          "Pour vérifier votre adresse e-mail, merci de de copier-coller ou de renseigner ce code dans l’interface de connexion ProConnect.",
        );
        cy.go("back");
        cy.maildevDeleteMessageById(email.id);
        return cy.maildevGetOTPCode(email.text, 10);
      })
      .then((code) => {
        if (!code)
          throw new Error("Could not find verification code in received email");
        cy.get('[name="verify_email_token"]').type(code);
        cy.get('[type="submit"]').click();
      });

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
