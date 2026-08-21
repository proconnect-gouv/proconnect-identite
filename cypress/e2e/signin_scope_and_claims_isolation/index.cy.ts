//

describe("scope isolation across consecutive sign-ins", () => {
  before(cy.seed);

  it("should not leak organization scope claims to a client that no longer requests it", function () {
    cy.visit("http://localhost:4000");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      scope: "openid email profile organization",
    }));
    cy.get("button#custom-connection").click({ force: true });
    cy.login("unused1@yopmail.com");

    cy.getByLabel(
      "Commune de lamalou-les-bains - Mairie (choisir cette organisation)",
    ).click();

    cy.contains('"label": "Commune de lamalou-les-bains - Mairie"');
    cy.contains('"scope": "openid email profile organization"');

    // Second sign-in: same session, scope no longer includes organization
    cy.visit("http://localhost:4000");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      scope: "openid email profile",
    }));
    cy.get("button#custom-connection").click({ force: true });

    cy.contains('"scope": "openid email profile"');
    cy.contains('"label"').should("not.exist");
    cy.contains('"siret"').should("not.exist");
  });
});

describe("claims parameter isolation across consecutive sign-ins", () => {
  before(cy.seed);

  it("should not leak claims-parameter claims to a subsequent request that omits them", () => {
    // First sign-in: email granted only via claims parameter (no email scope)
    cy.visit("http://localhost:4000");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      scope: "openid",
      claims: { userinfo: { email: null } },
    }));
    cy.get("button#custom-connection").click({ force: true });
    cy.login("unused1@yopmail.com");
    cy.contains('"email": "unused1@yopmail.com"');

    // Second sign-in: same session, claims parameter removed
    cy.visit("http://localhost:4000");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      scope: "openid",
      claims: undefined,
    }));
    cy.get("button#custom-connection").click({ force: true });
    cy.contains('"email"').should("not.exist");
  });
});

describe("claims parameter behaviour", () => {
  before(cy.seed);

  it("should return email when requested via claims parameter with null value", function () {
    // null is valid OIDC — means "include with no constraint"
    cy.visit("http://localhost:4000");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      scope: "openid",
      claims: {
        userinfo: {
          email: null,
        },
      },
    }));
    cy.get("button#custom-connection").click({ force: true });
    cy.login("unused1@yopmail.com");

    cy.contains('"email": "unused1@yopmail.com"');
  });

  it("should NOT return organization claims when requested via claims parameter alone (no scope)", function () {
    cy.visit("http://localhost:4000");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      scope: "openid",
      claims: {
        userinfo: {
          organization: { essential: true },
          phone: { essential: true },
          profile: { essential: false },
        },
      },
    }));
    cy.get("button#custom-connection").click({ force: true });
    cy.login("unused1@yopmail.com");

    cy.contains('"family_name"').should("not.exist");
    cy.contains('"label"').should("not.exist");
    cy.contains('"phone_number"').should("not.exist");
    cy.contains('"siret"').should("not.exist");
  });

  it("should return label and siret when organization scope is requested", function () {
    cy.visit("http://localhost:4000");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      scope: "openid organization",
      claims: undefined,
    }));
    cy.get("button#custom-connection").click({ force: true });
    cy.login("unused1@yopmail.com");

    cy.getByLabel(
      "Commune de lamalou-les-bains - Mairie (choisir cette organisation)",
    ).click();

    cy.contains('"label": "Commune de lamalou-les-bains - Mairie"');
    cy.contains('"siret": "21340126800130"');
  });

  it("should NOT return uid claim when requested via claims parameter if client lacks uid scope", function () {
    // uid is a valid provider leaf claim but standard_client_id is not allowed the uid scope
    cy.visit("http://localhost:4000");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      scope: "openid",
      claims: {
        userinfo: {
          uid: null,
        },
      },
    }));
    cy.get("button#custom-connection").click({ force: true });
    cy.login("unused1@yopmail.com");

    cy.contains('"uid"').should("not.exist");
  });

  it("should return individual leaf claims when requested via claims parameter", function () {
    cy.visit("http://localhost:4000");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      scope: "openid",
      claims: {
        userinfo: {
          given_name: null,
          family_name: { essential: true },
        },
      },
    }));
    cy.get("button#custom-connection").click({ force: true });
    cy.login("unused1@yopmail.com");

    cy.contains('"given_name": "Jean"');
    cy.contains('"family_name": "Bon"');
    cy.contains('"label"').should("not.exist");
  });
});

describe("invalid scope error", () => {
  before(cy.seed);

  it("should show invalid_scope when requesting a scope not allowed for the client", () => {
    cy.visit("http://localhost:4000");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      scope: "openid uid",
    }));
    cy.get("button#custom-connection").click({ force: true });

    cy.contains("invalid_scope");
  });
});
