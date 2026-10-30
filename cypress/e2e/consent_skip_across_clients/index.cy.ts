//

describe("consent is never prompted across relying parties", () => {
  before(cy.seed);

  it("should bypass consent for two different relying parties in the same session, without leaking organization claims between them", () => {
    // SP1: standard-client requests the `organization` scope; prompt=consent is forced
    cy.visit("http://localhost:4000");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      prompt: "consent",
    }));
    cy.get("button#custom-connection").click({ force: true });

    cy.title().should("include", "S'inscrire ou se connecter - ");
    cy.login("unused1@yopmail.com");

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains("standard-client");
    cy.contains('"label": "Commune de lamalou-les-bains - Mairie"');

    // SP2: proconnect-federation-client requests a different scope set, without `organization`;
    // prompt=consent is forced again, and the session from SP1 is reused (no re-login expected)
    cy.visit("http://localhost:4001");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      prompt: "consent",
    }));
    cy.contains("Connexion personnalisée").click({ force: true });

    // no login screen, no consent screen: straight through to the relying party
    cy.title().should("equal", "proconnect-federation-client - ProConnect");
    cy.contains("proconnect-federation-client");
    cy.contains('"email": "unused1@yopmail.com"');

    // SP2 never requested the `organization` scope: it must not receive organization-only claims
    cy.contains('"label"').should("not.exist");
  });
});
