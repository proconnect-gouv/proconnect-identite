describe("add passkey authentication", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("should add ctap2 internal passkey authentication", function () {
    cy.addVirtualAuthenticator({
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
    }).as("authenticator");

    cy.visit("/connection-and-account");
    cy.login("lion.eljonson@darkangels.world");

    cy.title().should("include", "Compte et connexion");
    cy.contains("Configurer la double authentification").click();

    cy.title().should("include", "Double authentification - ProConnect");
    cy.contains("Choisir votre méthode de double authentification");
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

describe("direct connexion with passkey", () => {
  it("should connect with previous passkey", function () {
    cy.visit("/");
    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.contains("Email professionnel").click();
    cy.focused().type("lion.eljonson@darkangels.world");
    cy.contains("Continuer").click();

    cy.title().should("include", "Accéder au compte - ProConnect");
    cy.contains("Se connecter avec une clé d’accès").click();

    cy.title().should("include", "Accueil - ProConnect");
  });
});

describe("through a service provider with 2fa for all sites", () => {
  it("should connect with previous passkey", function () {
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
    cy.contains("Se connecter avec une clé d’accès").click();
    cy.wait("@redirection_done");

    cy.origin("http://localhost:4000", () => {
      cy.title().should("include", "standard-client - ProConnect");
      cy.contains('"amr": [\n    "pop",\n    "mfa"\n  ],');
    });
  });

  it("should connect with force 2fa", function () {
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
    cy.intercept("http://localhost:4000").as("redirection_done");
    cy.contains("Se connecter avec une clé d’accès").click();
    cy.wait("@redirection_done");

    cy.origin("http://localhost:4000", () => {
      cy.title().should("include", "standard-client - ProConnect");
      cy.contains('"amr": [\n    "pwd",\n    "pop",\n    "mfa"\n  ],');
    });
  });
});

describe("through a service provider with 2fa only on sites that require it", () => {
  it("should change user 2fa preference", function () {
    cy.visit("/connection-and-account");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.login("lion.eljonson@darkangels.world");
    cy.contains("Se connecter avec une clé d’accès").click();

    cy.title().should("include", "Compte et connexion");
    cy.contains("Uniquement sur les sites qui l'exigent").click();
    cy.contains("Valider").click();

    cy.contains(
      "La double authentification a été activée uniquement sur les sites qui l'exigent.",
    );

    // Logout
    cy.contains("Lion El'Jonson").click();
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

  it("should sign-in with forced 2fa", function () {
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
    cy.intercept("http://localhost:4000").as("redirection_done");
    cy.contains("Se connecter avec une clé d’accès").click();
    cy.wait("@redirection_done");

    cy.origin("http://localhost:4000", () => {
      cy.title().should("include", "standard-client - ProConnect");
      cy.contains('"amr": [\n    "pwd",\n    "pop",\n    "mfa"\n  ],');
      cy.contains(
        '"acr": "https://proconnect.gouv.fr/assurance/consistency-checked-2fa"',
      );
    });
  });
});
