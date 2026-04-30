describe("authorize error", () => {
  before(cy.seed);

  it("should display bad request error", function () {
    cy.visit("http://localhost:4000");

    cy.updateCustomParams((customParams) => ({
      ...customParams,
      siret_hint: "jean",
    }));

    cy.get("button#custom-connection").click({ force: true });

    cy.contains("Continuer sur le service").click();

    cy.title().should("include", "Error");
    cy.contains("AuthorizationResponseError");
    cy.contains("server_error");
    cy.contains("Bad Request");
  });
});
