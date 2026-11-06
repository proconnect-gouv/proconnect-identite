describe("sign-out asked by a service", () => {
  before(cy.seed);

  it("should record the sign-out with the service name and session id", function () {
    cy.visit("http://localhost:4001/");

    cy.contains("S’identifier avec ProConnect").click();

    cy.contains("Renseignez votre mot de passe").click();
    cy.focused().type("password123");
    cy.contains("S’identifier").click();

    cy.contains('"email": "unused1@yopmail.com"');

    cy.contains("Se déconnecter").click();

    cy.url().should("eq", "http://localhost:4001/");
    cy.task(
      "psql",
      `
SELECT
  interaction_cid IS NOT NULL AS has_interaction_cid,
  outcome,
  sid = FIRST_VALUE(sid) OVER (ORDER BY id) AS same_sid,
  sp_name
FROM users_oidc_clients
ORDER BY id`,
    ).should("deep.equal", [
      {
        has_interaction_cid: true,
        outcome: "succeeded",
        same_sid: true,
        sp_name: "ProConnect Test",
      },
      {
        has_interaction_cid: false,
        outcome: "signed_out",
        same_sid: true,
        sp_name: "ProConnect Test",
      },
    ]);
  });
});
