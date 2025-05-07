//

describe("trigger rate limiting by ip", () => {
  it("should trigger ip rate limiting", function () {
    for (let i = 0; i <= 42; i++) {
      cy.visit("/users/start-sign-in", { failOnStatusCode: false });
    }

    cy.contains("Too Many Requests");
  });
});
