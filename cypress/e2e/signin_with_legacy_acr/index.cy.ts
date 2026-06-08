describe("sign-in with a client requiring legacy acr_values=eidas1", () => {
  before(cy.seed);
  beforeEach(() => {
    cy.visit("http://localhost:4000");

    cy.updateCustomParams((customParams) => ({
      ...customParams,
      acr_values: "eidas1",
    }));
  });

  it("should return eidas1 for a user without 2FA and verified domain", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial2-aal1@yopmail.com");

    cy.contains('"acr": "eidas1"');
  });

  it("should return eidas1 for a dirigeant", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("certification-dirigeant@yopmail.com");

    cy.contains('"acr": "eidas1"');
  });
});

describe("sign-in with a client requiring legacy ACR values", () => {
  before(cy.seed);
  beforeEach(() => {
    cy.visit("http://localhost:4000");
    cy.setRequestedAcrs([
      "https://proconnect.gouv.fr/assurance/self-asserted-2fa",
      "https://proconnect.gouv.fr/assurance/consistency-checked-2fa",
      "eidas2",
      "eidas3",
    ]);
  });

  it("should return an error", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial2-aal1@yopmail.com");

    cy.contains("Erreur access_denied");

    cy.contains("none of the requested ACRs could be obtained");

    cy.get("a.fr-btn").contains("Continuer").click();

    cy.contains("AuthorizationResponseError");
  });
});
