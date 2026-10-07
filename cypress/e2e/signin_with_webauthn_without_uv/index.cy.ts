describe("setup the passkey without uv", () => {
  before(cy.seed);

  it("should add ctap2 internal passkey authentication", function () {
    cy.addVirtualAuthenticator({
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: false,
      isUserVerified: false,
    }).as("authenticator");

    cy.visit("/connection-and-account");
    cy.login("lion.eljonson@darkangels.world");

    cy.title().should("include", "Compte et connexion");
    cy.contains("Configurer la double authentification").click();

    cy.title().should("include", "Double authentification - ProConnect");
    cy.contains("Choisir votre méthode de connexion renforcée");
    cy.contains("Clé d'accès (passkey)").click();
    cy.contains("Continuer").click();

    cy.title().should("include", "Compte et connexion");
    cy.contains("Tout est en ordre !");

    cy.get("@authenticator").getFirstCertification().as("credential");

    cy.get<{ credentialId: string }>("@credential").then(({ credentialId }) => {
      cy.contains(
        `Clé ${credentialId
          // @see src/managers/webauthn.ts#getUserAuthenticators
          .substring(0, 10)
          // @see src/services/base64.ts#encodeBase64URL
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "")}`,
      );
    });
  });
});

describe("use the passkey without uv", () => {
  beforeEach(() => {
    // Adds a delay to auto-login to allow Cypress to read the page before triggering authentication.
    cy.intercept(
      "GET",
      "/api/webauthn/generate-authentication-options-for-second-factor",
      (req) =>
        req.on("response", (res) => {
          res.setDelay(1000);
        }),
    );
  });

  it("should sign-in with password", function () {
    cy.origin("http://localhost:4000", () => {
      cy.visit("/");
      cy.title().should("include", "standard-client - ProConnect");
      cy.contains("S’identifier avec ProConnect").click();
    });

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.login("lion.eljonson@darkangels.world");

    cy.origin("http://localhost:4000", () => {
      cy.title().should("include", "standard-client - ProConnect");
      cy.contains('"amr": [\n    "pwd"\n  ],');

      cy.contains("Se déconnecter").click();
    });
  });

  it("should sign-in with passkey from service provider that force 2FA", function () {
    cy.origin("http://localhost:4000", () => {
      cy.visit("/");
      cy.title().should("include", "standard-client - ProConnect");
      cy.contains("Forcer une connexion a deux facteurs").click();
    });

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.login("lion.eljonson@darkangels.world");

    cy.title().should(
      "include",
      "Se connecter avec la double authentification - ProConnect",
    );
    cy.contains("Valider avec la double authentification");
    cy.contains("Se connecter avec une clé d’accès");

    cy.origin("http://localhost:4000", () => {
      cy.title().should("include", "standard-client - ProConnect");
      cy.contains('"amr": [\n    "pwd",\n    "pop",\n    "mfa"\n  ],');
      cy.contains('"acr": "eidas0-mfa"');
    });
  });

  it("should change user 2fa preference", function () {
    cy.visit("/connection-and-account");
    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.login("lion.eljonson@darkangels.world");

    cy.contains("Valider avec la double authentification");
    cy.contains("Se connecter avec une clé d’accès").click();

    cy.title().should("include", "Compte et connexion");
    cy.contains("Sur tous les sites").click();
    cy.contains("Valider").click();

    cy.contains("La double authentification a été activée sur tous les sites.");

    // Logout
    cy.contains("Lion El'Jonson").click();
  });

  it("should sign-in with passkey when user has 2FA forced", function () {
    cy.origin("http://localhost:4000", () => {
      cy.visit("/");
      cy.title().should("include", "standard-client - ProConnect");
      cy.contains("S’identifier avec ProConnect").click();
    });

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.login("lion.eljonson@darkangels.world");

    cy.title().should(
      "include",
      "Se connecter avec la double authentification - ProConnect",
    );
    cy.contains("Valider avec la double authentification");
    cy.contains("Se connecter avec une clé d’accès");

    cy.origin("http://localhost:4000", () => {
      cy.title().should("include", "standard-client - ProConnect");
      cy.contains('"amr": [\n    "pwd",\n    "pop",\n    "mfa"\n  ],');
    });
  });
});
