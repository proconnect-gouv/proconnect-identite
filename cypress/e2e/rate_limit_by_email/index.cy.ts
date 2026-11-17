describe("trigger rate limit by email", () => {
  before(cy.seed);

  it("should trigger totp rate limiting", function () {
    cy.visit("/");

    cy.login("account-with-totp@yopmail.com");

    for (let i = 0; i <= 5; i++) {
      cy.contains(
        "Saisissez le code à usage unique à 6 chiffres de votre application d'authentification",
      ).click();
      cy.focused().type("123456");
      cy.get('[action="/users/2fa-sign-in-with-totp"] [type="submit"]').click();
    }

    cy.contains("Too Many Requests");

    cy.contains(
      "Merci de ne pas retenter de connexion dans l’immédiat et de réessayer dans une quinzaine de minutes.",
    );
  });

  it("should trigger email verification rate limiting", function () {
    cy.visit("/");
    cy.login("email-verification-needed@yopmail.com");

    // trigger reset email verification rate limiter
    for (let i = 0; i <= 10; i++) {
      cy.contains("Code de confirmation").click();
      cy.focused().type("1234567890");
      cy.get('[type="submit"]').click();
    }

    cy.contains("Too Many Requests");
    cy.contains(
      "Merci de ne pas retenter de connexion dans l’immédiat et de réessayer dans une quinzaine de minutes.",
    );
  });

  it("should trigger totp rate limiting", function () {
    // Set email in unauthenticated session
    cy.visit("/");
    cy.contains("Email professionnel").click();
    cy.focused().type("new-account@yopmail.com");
    cy.get('[type="submit"]').click();

    // trigger reset password rate limiter
    for (let i = 0; i <= 5; i++) {
      cy.visit("/users/reset-password");

      cy.get('[action="/users/reset-password"] [type="submit"]').click();
    }

    cy.contains("Too Many Requests");

    cy.contains(
      "Merci de ne pas retenter de connexion dans l’immédiat et de réessayer dans une quinzaine de minutes.",
    );
  });
});
