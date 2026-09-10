describe("signin with multiple 2fa suggestion", () => {
  before(cy.seed);

  it("should show the suggestion when only one 2fa method is configured and never seen", function () {
    cy.visit("http://localhost:4000");
    cy.get("button.proconnect-button").click();

    cy.mfaLogin("single-totp-never-seen@yopmail.com");

    cy.contains("Multipliez vos méthodes de double authentification (2FA) !");
    cy.contains("Vous utilisez l'application d'authentification (TOTP).");
  });

  it("should complete the sign-in flow when clicking ignore", function () {
    cy.visit("http://localhost:4000");
    cy.get("button.proconnect-button").click();

    cy.mfaLogin("single-totp-never-seen@yopmail.com");

    cy.contains("Multipliez vos méthodes de double authentification (2FA) !");
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

  it("should show the suggestion again when it was ignored more than 30 days ago", function () {
    cy.visit("http://localhost:4000");
    cy.get("button.proconnect-button").click();

    cy.mfaLogin("single-totp-ignored-long-ago@yopmail.com");

    cy.contains("Multipliez vos méthodes de double authentification (2FA) !");
  });

  it("should redirect to double-authentication-choice when clicking configurer", function () {
    cy.visit("http://localhost:4000");
    cy.get("button.proconnect-button").click();

    cy.mfaLogin("single-totp-ignored-long-ago@yopmail.com");

    cy.contains("Multipliez vos méthodes de double authentification (2FA) !");
    cy.contains("Configurer").click();

    cy.contains("Choisir votre méthode de connexion renforcée");
  });

  describe("with a user adding a second (webauthn) method", () => {
    before(function () {
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

    it("should never show the suggestion once a second method is added", function () {
      cy.visit("/connection-and-account");
      cy.mfaLogin("single-totp-adding-second-method@yopmail.com");

      // à ce stade, une seule méthode est configurée : la suggestion s'affiche normalement
      cy.contains("Multipliez vos méthodes de double authentification (2FA) !");
      cy.contains("Configurer").click();

      cy.contains("Choisir votre méthode de connexion renforcée");
      cy.contains("Clé d'accès (passkey)").click();
      cy.contains("Continuer").click();

      cy.contains("Votre double authentification est bien configurée");
      cy.contains("Continuer").click();

      // LOGOUT
      cy.contains("Jean Jean").click();

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

      cy.visit("/connection-and-account");
      cy.login("single-totp-adding-second-method@yopmail.com");

      cy.title().should("include", "Compte et connexion");
    });
  });
});
