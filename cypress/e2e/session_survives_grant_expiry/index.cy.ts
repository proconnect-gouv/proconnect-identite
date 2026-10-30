//

describe("session survives grant expiry", () => {
  before(cy.seed);

  it("should not require re-login after the Grant record is gone, as long as the Session is still valid", () => {
    cy.visit("http://localhost:4000");
    cy.contains("S’identifier avec ProConnect").click();

    cy.title().should("include", "S'inscrire ou se connecter - ");
    cy.login("unused1@yopmail.com");

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains("standard-client");

    // Remove every Grant record directly from Redis, leaving the Session untouched.
    // Safe because cy.seed() FLUSHALLs redis before this spec runs, so this test's
    // Grant is the only one present (see panva/node-oidc-provider#1202: Grant
    // expiration must not tear down the Session).
    cy.exec(
      "docker compose exec redis redis-cli --scan --pattern 'oidc:Grant:*' | xargs -r docker compose exec redis redis-cli DEL",
    ).then(({ stdout }) => {
      expect(
        Number(stdout.trim()),
        "number of deleted Grant records",
      ).to.be.greaterThan(0);
    });

    cy.visit("http://localhost:4000");
    cy.contains("S’identifier avec ProConnect").click();

    // no login screen: the Session is still recognized even though its Grant is gone
    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains("standard-client");
    cy.contains('"email": "unused1@yopmail.com"');
  });
});
