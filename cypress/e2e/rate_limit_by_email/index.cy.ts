describe("trigger rate limit by email", () => {
  it("should trigger totp rate limiting", function () {
    cy.visit("/users/start-sign-in");

    cy.login("account-with-totp@yopmail.com");

    for (let i = 0; i <= 5; i++) {
      cy.contains(
        "Obtenir un code à usage unique depuis votre application mobile.",
      ).click();
      cy.focused().type("123456");
      cy.get('[action="/users/2fa-sign-in-with-totp"] [type="submit"]').click();
    }

    cy.contains("Too Many Requests");
  });

  it("should trigger email verification rate limiting", function () {
    cy.visit("/users/start-sign-in");
    cy.login("email-verification-needed@yopmail.com");

    // trigger reset email verification rate limiter
    for (let i = 0; i <= 10; i++) {
      cy.contains(
        "Vérifiez vos emails et insérez le code à 10 chiffres.",
      ).click();
      cy.focused().type("1234567890");
      cy.get('[type="submit"]').click();
    }

    cy.contains("Too Many Requests");
  });

  it("should trigger totp rate limiting", function () {
    // Set email in unauthenticated session
    cy.visit("/users/start-sign-in");
    cy.contains("Email professionnel").click();
    cy.focused().type("new-account@yopmail.com");
    cy.get('[type="submit"]').click();

    // trigger reset password rate limiter
    for (let i = 0; i <= 5; i++) {
      cy.visit("/users/reset-password");

      cy.get('[action="/users/reset-password"] [type="submit"]').click();
    }

    cy.contains("Too Many Requests");
  });
});
