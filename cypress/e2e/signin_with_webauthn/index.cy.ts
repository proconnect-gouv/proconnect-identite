let authenticatorId: string;

before(function () {
  cy.seed();

  // add ctap2 internal passkey authentication
  cy.addVirtualAuthenticator({
    protocol: "ctap2",
    transport: "internal",
    hasResidentKey: true,
    hasUserVerification: true,
    isUserVerified: true,
  })
    .as("authenticator")
    .then((authenticatorId) => {
      this["authenticatorId"] = authenticatorId;
    });
});

describe("sign-in with a passkey configured", () => {
  it("should add ctap2 internal passkey authentication", function () {
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
      this["credentialId"] = credentialId;
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

  it("should connect with configured passkey", function () {
    cy.visit("/");
    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.contains("Email professionnel").click();
    cy.focused().type("lion.eljonson@darkangels.world");
    cy.contains("Continuer").click();

    cy.title().should("include", "Accéder au compte - ProConnect");
    cy.title().should("include", "Accueil - ProConnect");
  });

  it("should allow the user to cancel auto-triggered passkey and sign in with password", function () {
    cy.origin("http://localhost:4000", () => {
      cy.visit("/");
      cy.title().should("include", "standard-client - ProConnect");
      cy.contains("S’identifier avec ProConnect").click();
    });

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");

    cy.setUserVerified({
      authenticatorId: this["authenticatorId"],
      isUserVerified: false,
    });

    cy.on("uncaught:exception", (err) => {
      if (err.name === "NotAllowedError") {
        return false;
      }
      return true;
    });

    cy.get('[name="login"]').type("lion.eljonson@darkangels.world");
    cy.get('[type="submit"]').click();

    cy.get("#password-input").click();
    cy.wait(200);
    cy.get('[name="password"]').clear().type("password123");
    cy.contains("S’identifier").click();

    cy.title().should("include", "standard-client - ProConnect");
    cy.contains('"amr": [\n    "pwd"\n  ],');
  });

  it("should allow a user who skipped automatic passkey prompt to sign in using the passkey button", function () {
    cy.origin("http://localhost:4000", () => {
      cy.visit("/");
      cy.title().should("include", "standard-client - ProConnect");
      cy.contains("S’identifier avec ProConnect").click();
    });

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");

    cy.setUserVerified({
      authenticatorId: this["authenticatorId"],
      isUserVerified: false,
    });

    cy.on("uncaught:exception", (err) => {
      if (err.name === "NotAllowedError") {
        return false;
      }
      return true;
    });

    cy.get('[name="login"]').type("lion.eljonson@darkangels.world");
    cy.get('[type="submit"]').click();

    cy.contains("Une erreur est survenue.");

    cy.setUserVerified({
      authenticatorId: this["authenticatorId"],
      isUserVerified: true,
    });

    cy.contains("Se connecter avec une clé d’accès").click();

    cy.origin("http://localhost:4000", () => {
      cy.title().should("include", "standard-client - ProConnect");
      cy.contains('"amr": [\n    "pop",\n    "mfa"\n  ],');
    });
  });

  it("should sign-in with forced 2fa", function () {
    cy.origin("http://localhost:4000", () => {
      cy.visit("/");
      cy.title().should("include", "standard-client - ProConnect");
      cy.contains("S’identifier avec ProConnect").click();
    });

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");

    cy.setUserVerified({
      authenticatorId: this["authenticatorId"],
      isUserVerified: false,
    });

    cy.on("uncaught:exception", (err) => {
      if (err.name === "NotAllowedError") {
        return false;
      }
      return true;
    });

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

    cy.intercept("http://localhost:4000");
    cy.setUserVerified({
      authenticatorId: this["authenticatorId"],
      isUserVerified: true,
    });

    cy.origin("http://localhost:4000", () => {
      cy.title().should("include", "standard-client - ProConnect");
      cy.contains('"amr": [\n    "pwd",\n    "pop",\n    "mfa"\n  ],');
      cy.contains('"acr": "eidas0-mfa"');
    });
  });
});

describe("sign-in with a configured passkey after enabling 2FA for all sites", () => {
  it("should change user 2fa preference", function () {
    cy.visit("/connection-and-account");
    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.get('[name="login"]').type("lion.eljonson@darkangels.world");
    cy.get('[type="submit"]').click();
    cy.title().should("include", "Compte et connexion");
    cy.contains("Sur tous les sites").click();
    cy.contains("Valider").click();

    cy.contains("La double authentification a été activée sur tous les sites.");

    // Logout
    cy.contains("Lion El'Jonson").click();
  });

  it("should connect with configured passkey", function () {
    cy.origin("http://localhost:4000", () => {
      cy.visit("/");
      cy.title().should("include", "standard-client - ProConnect");
      cy.contains("S’identifier avec ProConnect").click();
    });

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.contains("Email professionnel").click();
    cy.focused().type("lion.eljonson@darkangels.world");
    cy.contains("Continuer").click();

    cy.title().should("include", "Accéder au compte - ProConnect");
    cy.intercept("http://localhost:4000").as("redirection_done");
    cy.setUserVerified({
      authenticatorId: this["authenticatorId"],
      isUserVerified: true,
    });

    cy.origin("http://localhost:4000", () => {
      cy.title().should("include", "standard-client - ProConnect");
      cy.contains('"amr": [\n    "pop",\n    "mfa"\n  ],');
    });
  });

  it("should still be able to connect with force 2fa", function () {
    cy.setUserVerified({
      authenticatorId: this["authenticatorId"],
      isUserVerified: false,
    });

    cy.on("uncaught:exception", (err) => {
      if (err.name === "NotAllowedError") {
        return false;
      }
      return true;
    });

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

    cy.intercept("http://localhost:4000");
    cy.setUserVerified({
      authenticatorId: this["authenticatorId"],
      isUserVerified: true,
    });

    cy.origin("http://localhost:4000", () => {
      cy.title().should("include", "standard-client - ProConnect");
      cy.contains('"amr": [\n    "pwd",\n    "pop",\n    "mfa"\n  ],');
    });
  });
});
