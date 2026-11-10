describe("recovery words incentive disabled", () => {
  before(cy.seed);

  it("should sign in to the service provider without showing the incentive", function () {
    cy.visit("http://localhost:4000");
    cy.contains("S’identifier avec ProConnect").click();

    cy.login("without-recovery-words@yopmail.com");

    cy.contains("standard-client");
  });
});
