import { generateToken } from "@sunknudsen/totp";

Cypress.on("uncaught:exception", (err, _runnable) => {
  if (
    err.message.includes("Cannot read properties of null (reading 'checked')")
  ) {
    return false;
  }
  return true;
});

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

  it("should follow first authentication when mfa asked", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial2-aal1@yopmail.com");

    cy.get("#radio-hint-totp").check({ force: true });

    cy.get("a.fr-btn").contains("Continuer").click();

    cy.contains("Installer votre outil d’authentification");

    cy.get("#is-authenticator-app-installed").check({ force: true });

    cy.get("a.fr-btn").contains("Continuer").click();

    cy.contains("Scanner ce QRcode avec votre application");

    cy.get("#humanReadableTotpKey")
      .invoke("text")
      .then((text) => {
        const humanReadableTotpKey = text.trim().replace(/\s+/g, "");
        const totp = generateToken(humanReadableTotpKey);
        cy.get("[name=totpToken]").type(totp);
        cy.get(
          '[action="/users/authenticator-app-configuration"] [type="submit"]',
        ).click();
      });

    cy.contains("Votre double authentification est bien configurée");
    cy.get("button.fr-btn").contains("Continuer").click();

    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/consistency-checked-2fa"',
    );
  });

  it.only("should return error if totp code isn't valid", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial2-aal1@yopmail.com");

    cy.get("#radio-hint-totp").check({ force: true });

    cy.get("a.fr-btn").contains("Continuer").click();

    cy.contains("Installer votre outil d’authentification");

    cy.get("#is-authenticator-app-installed").check({ force: true });

    cy.get("a.fr-btn").contains("Continuer").click();

    cy.contains("Scanner ce QRcode avec votre application");

    const invalidTotpCode = "123456";

    cy.get("[name=totpToken]").type(invalidTotpCode);
    cy.get(
      '[action="/users/authenticator-app-configuration"] [type="submit"]',
    ).click();

    cy.contains(
      "Erreur : le code que vous avez utilisé est invalide. Merci de recommencer.",
    );
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
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      acr_values: "eidas1",
    }));

    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial1-aal1@yopmail.com");

    cy.contains('"acr": "https://proconnect.gouv.fr/assurance/self-asserted",');
  });
});
