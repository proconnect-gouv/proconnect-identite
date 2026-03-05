//

describe("trigger rate limiting by ip", () => {
  it("should trigger ip rate limiting", function () {
    for (let i = 0; i <= 60; i++) {
      cy.visit("/users/start-sign-in", { failOnStatusCode: false });
    }

    cy.contains("Too Many Requests");

    cy.contains(
      "Merci de ne pas retenter de connexion dans l’immédiat et de réessayer dans une quinzaine de minutes.",
    );
  });
});
