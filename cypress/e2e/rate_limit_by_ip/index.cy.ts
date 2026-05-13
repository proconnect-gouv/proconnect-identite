//

describe("trigger rate limiting by ip", () => {
  before(cy.seed);

  it("should trigger ip rate limiting", function () {
    cy.visit("http://localhost:4000");

    cy.get("button.proconnect-button").click();

    cy.login("rate-limit+user@yopmail.com");

    for (let i = 0; i <= 60; i++) {
      cy.visit("/users/start-sign-in", { failOnStatusCode: false });
    }

    cy.contains("Too Many Requests");

    cy.contains(
      "Merci de ne pas retenter de connexion dans l’immédiat et de réessayer dans une quinzaine de minutes.",
    );

    cy.contains("Continuer sur le service").click();

    cy.url().should("include", "error=server_error");
    cy.url().should("include", "error_description=Too%20many%20requests");
  });
});
