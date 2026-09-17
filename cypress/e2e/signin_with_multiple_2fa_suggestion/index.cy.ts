describe("signin with multiple 2fa suggestion", () => {
  before(cy.seed);

  it("should show the suggestion and complete the sign-in flow when clicking ignore", function () {
    cy.visit("http://localhost:4000");
    cy.get("button.proconnect-button").click();

    cy.mfaLogin("single-totp-never-seen@yopmail.com");

    cy.contains("Multipliez vos méthodes de double authentification (2FA) !");
    cy.contains("Vous utilisez l'application d'authentification (TOTP).");

    cy.contains("Ignorer pour le moment").click();

    cy.contains("standard-client");
    cy.contains('"email": "single-totp-never-seen@yopmail.com"');
  });

  it("should not show the suggestion when it has been ignored recently", function () {
    cy.visit("http://localhost:4000");
    cy.get("button.proconnect-button").click();

    cy.mfaLogin("single-totp-recently-ignored@yopmail.com");

    cy.contains("standard-client");
    cy.contains('"email": "single-totp-recently-ignored@yopmail.com"');
  });

  it("should show the suggestion again after 30 days and redirect to double-authentication-choice when clicking configurer", function () {
    cy.visit("http://localhost:4000");
    cy.get("button.proconnect-button").click();

    cy.mfaLogin("single-totp-ignored-long-ago@yopmail.com");

    cy.contains("Multipliez vos méthodes de double authentification (2FA) !");

    cy.contains("Configurer").click();

    cy.contains("Choisir votre méthode de connexion renforcée");
  });

  it("should never show the suggestion when the user has two passkeys and no TOTP", function () {
    cy.visit("http://localhost:4000");
    cy.get("button.proconnect-button").click();

    cy.login("two-passkeys-no-totp@yopmail.com");

    cy.contains("standard-client");
  });

  describe("with a user adding a second (webauthn) method", () => {
    before(function () {
      cy.addVirtualAuthenticator({
        protocol: "ctap2",
        transport: "internal",
        hasResidentKey: true,
        hasUserVerification: true,
        isUserVerified: true,
      });
    });

    it("should never show the suggestion once a second method is added", function () {
      cy.visit("/connection-and-account");
      cy.mfaLogin("single-totp-adding-second-method@yopmail.com");

      cy.contains("Multipliez vos méthodes de double authentification (2FA) !");
      cy.contains("Configurer").click();

      cy.contains("Choisir votre méthode de connexion renforcée");
      cy.contains("Clé d'accès (passkey)").click();
      cy.contains("Continuer").click();

      cy.contains("Votre double authentification est bien configurée");
      cy.contains("Continuer").click();

      // LOGOUT
      cy.contains("Jean Jean").click();

      cy.visit("/connection-and-account");
      cy.mfaLogin("single-totp-adding-second-method@yopmail.com");

      cy.title().should("include", "Compte et connexion");
    });
  });
});
