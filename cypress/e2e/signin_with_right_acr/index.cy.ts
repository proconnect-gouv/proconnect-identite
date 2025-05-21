describe("sign-in with a client not requiring any acr", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4000");
    cy.setRequestedAcrs();
  });

  it("should sign-in and return the ACR_VALUE_FOR_IAL1_AAL1 acr value", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial1-aal1@yopmail.com");

    cy.contains('"acr": "https://proconnect.gouv.fr/assurance/self-asserted"');
  });

  it("should sign-in and return the ACR_VALUE_FOR_IAL2_AAL1 acr value", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial2-aal1@yopmail.com");

    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/consistency-checked"',
    );
  });

  it("should sign-in and return the ACR_VALUE_FOR_IAL1_AAL1 acr value", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial1-aal2@yopmail.com");

    cy.contains('"acr": "https://proconnect.gouv.fr/assurance/self-asserted"');
  });

  it("should sign-in and return the ACR_VALUE_FOR_IAL2_AAL1 acr value", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial2-aal2@yopmail.com");

    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/consistency-checked"',
    );
  });

  it("should sign-in a dirigeant return the ACR_VALUE_FOR_IAL2_AAL1 acr value", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("certification-dirigeant@yopmail.com");

    cy.contains('"acr": "https://proconnect.gouv.fr/assurance/self-asserted"');
  });
});

describe("sign-in with a client requiring consistency-checked identity", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4000");
    cy.setRequestedAcrs([
      "https://proconnect.gouv.fr/assurance/consistency-checked",
      "https://proconnect.gouv.fr/assurance/consistency-checked-2fa",
    ]);
  });

  it("should sign-in and return the ACR_VALUE_FOR_IAL2_AAL1 acr value", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial2-aal1@yopmail.com");

    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/consistency-checked"',
    );
  });

  it("should return an error with ial1", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial1-aal1@yopmail.com");

    cy.contains("Erreur access_denied");

    cy.contains("none of the requested ACRs could be obtained");

    cy.get("a.fr-btn").contains("Continuer").click();

    cy.contains("AuthorizationResponseError");
  });
});

describe("sign-in with a client requiring 2fa identity", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4000");
    cy.setRequestedAcrs([
      "https://proconnect.gouv.fr/assurance/self-asserted-2fa",
      "https://proconnect.gouv.fr/assurance/consistency-checked-2fa",
    ]);
  });

  it("should sign-in and return the ACR_VALUE_FOR_IAL2_AAL2 acr value", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.mfaLogin("ial2-aal2@yopmail.com");

    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/consistency-checked-2fa"',
    );
  });

  it("should return an error with ial1", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial2-aal1@yopmail.com");

    cy.contains("Attention : le site que vous voulez utiliser requiert la 2FA");
  });
});

describe("sign-in with a client requiring certification dirigeant identity", () => {
  it("should sign-in and return the ACR_VALUE_FOR_CERTIFICATION_DIRIGEANT acr value", function () {
    cy.visit("http://localhost:4000");
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
});

describe("sign-in with a client requiring certification dirigeant and 2fa identity", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4000");
    cy.setRequestedAcrs([
      "https://proconnect.gouv.fr/assurance/certification-dirigeant-2fa",
    ]);
  });

  it("should sign-in and return the ACR_VALUE_FOR_IAL1_AAL2 acr value", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.mfaLogin("certification-dirigeant-aal2@yopmail.com");

    cy.getByLabel(
      "Commune de lamalou-les-bains - Mairie (choisir cette organisation)",
    ).click();

    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/certification-dirigeant-2fa"',
    );
  });

  it("should warn the user that 2fa is required", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("certification-dirigeant@yopmail.com");

    cy.contains(
      "Attention : le site que vous voulez utiliser requiert la 2FA, qui réduit les risques de piratage.",
    );
  });
});

describe("sign-in with a client requiring certification dirigeant and consistency-checked", () => {
  it("should return an error with no self asserted acr", function () {
    cy.visit("http://localhost:4000");
    cy.setRequestedAcrs([
      "https://proconnect.gouv.fr/assurance/certification-dirigeant",
      "https://proconnect.gouv.fr/assurance/consistency-checked",
      "https://proconnect.gouv.fr/assurance/consistency-checked-2fa",
    ]);

    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial1-aal1@yopmail.com");

    cy.contains("Erreur access_denied");

    cy.contains("none of the requested ACRs could be obtained");

    cy.get("a.fr-btn").contains("Continuer").click();

    cy.contains("AuthorizationResponseError");
  });
});

describe("sign-in with a client requiring eidas1", () => {
  it("should return an error with no self asserted acr", function () {
    cy.visit("http://localhost:4000");
    cy.setCustomParams({
      acr_values: "eidas1",
    });

    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial1-aal1@yopmail.com");

    cy.contains('"acr": "https://proconnect.gouv.fr/assurance/self-asserted",');
  });
});
