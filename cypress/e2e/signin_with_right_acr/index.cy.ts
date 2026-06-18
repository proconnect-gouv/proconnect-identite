describe("sign-in with a client not requiring any acr", () => {
  before(cy.seed);
  beforeEach(() => {
    cy.visit("http://localhost:4000");
    cy.setRequestedAcrs();
  });

  it("should sign-in and return acr eidas0 for ial0-aal1-oal1", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial0-aal1-oal1@yopmail.com");

    cy.contains('"acr": "eidas0"');
  });

  it("should sign-in and return acr eidas0 for ial0-aal1-oal0 after upgrading the account", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial0-aal1-oal0@yopmail.com");

    cy.title().should("include", "Vérifier votre identité");
    cy.getByLabel("S’identifier avec FranceConnect").click();

    cy.title().should("include", "Connexion 🎭 FranceConnect 🎭");
    cy.contains("Je suis Ulysse Tosi").click();

    cy.contains('"acr": "eidas0"');
  });

  it("should sign-in and return acr eidas1 for ial1-aal1-oal1", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial1-aal1-oal1@yopmail.com");

    cy.contains('"acr": "eidas1"');
  });

  it("should sign-in and return acr eidas0 for ial0-aal2-oal1", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial0-aal2-oal1@yopmail.com");

    cy.contains('"acr": "eidas0"');
  });

  it("should sign-in and return acr eidas1 for ial1-aal2-oal1", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial1-aal2-oal1@yopmail.com");

    cy.contains('"acr": "eidas1"');
  });

  it("should sign-in a dirigeant return acr certification-dirigeant with certification-dirigeant@yopmail.com", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("certification-dirigeant@yopmail.com");

    cy.contains('"acr": "eidas1"');
  });
});

describe("sign-in with a client requiring acr levels", () => {
  before(cy.seed);
  beforeEach(() => {
    cy.visit("http://localhost:4000");
  });

  it("should sign-in and return acr eidas1 with ial1-aal1-oal1", function () {
    cy.setRequestedAcrs(["eidas1", "eidas1-mfa", "eidas2", "eidas3"]);

    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial1-aal1-oal1@yopmail.com");

    cy.contains('"acr": "eidas1"');
  });

  it("should return an error with ial0-aal1-oal0", function () {
    cy.setRequestedAcrs(["eidas1", "eidas1-mfa", "eidas2", "eidas3"]);

    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial0-aal1-oal0@yopmail.com");

    cy.contains("Erreur access_denied");

    cy.contains("none of the requested ACRs could be obtained");

    cy.get("a.fr-btn").contains("Continuer").click();

    cy.contains("AuthorizationResponseError");
  });

  it("should sign-in and return acr eidas1 with ial0-aal1-oal1", function () {
    cy.setRequestedAcrs(["eidas1", "eidas1-mfa", "eidas2", "eidas3"]);

    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial0-aal1-oal1@yopmail.com");

    cy.title().should("include", "Vérifier votre identité");
    cy.getByLabel("S’identifier avec FranceConnect").click();

    cy.title().should("include", "Connexion 🎭 FranceConnect 🎭");
    cy.contains("Je suis Ulysse Tosi").click();

    cy.contains('"acr": "eidas1"');
  });

  it("should sign-in and return acr eidas0-mfa", function () {
    cy.setRequestedAcrs(["eidas0-mfa", "eidas1-mfa", "eidas2", "eidas3"]);

    cy.get("button#custom-connection").click({ force: true });

    cy.mfaLogin("ial0-aal2-oal1@yopmail.com");

    cy.contains('"acr": "eidas0-mfa"');
  });

  it("should sign-in and return acr certification-dirigeant when asked", function () {
    cy.setRequestedAcrs([
      "https://proconnect.gouv.fr/assurance/certification-dirigeant",
    ]);

    cy.get("button#custom-connection").click({ force: true });

    cy.login("certification-dirigeant@yopmail.com");

    cy.getByLabel(
      "Commune de lamalou-les-bains - Mairie (choisir cette organisation)",
    ).click();

    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/certification-dirigeant"',
    );
  });

  it("should sign-in and return acr certification-dirigeant even if 2FA is available for user", function () {
    cy.setRequestedAcrs([
      "https://proconnect.gouv.fr/assurance/certification-dirigeant",
    ]);

    cy.get("button#custom-connection").click({ force: true });

    cy.login("certification-dirigeant-aal2@yopmail.com");

    cy.getByLabel(
      "Commune de lamalou-les-bains - Mairie (choisir cette organisation)",
    ).click();

    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/certification-dirigeant"',
    );
  });

  it("should sign-in and return mfa acr even if certification-dirigeant is available for user", function () {
    cy.setRequestedAcrs([
      "eidas0-mfa",
      "eidas1-mfa",
      "eidas2",
      "eidas3",
      "https://proconnect.gouv.fr/assurance/certification-dirigeant",
    ]);

    cy.get("button#custom-connection").click({ force: true });

    cy.mfaLogin("certification-dirigeant-aal2@yopmail.com");

    cy.contains('"acr": "eidas1-mfa"');
  });
});
