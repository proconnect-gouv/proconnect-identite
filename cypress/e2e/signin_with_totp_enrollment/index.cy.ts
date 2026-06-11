describe("sign-in with totp enrollment", () => {
  beforeEach(cy.seed);

  it("should follow first authentication when mfa asked", function () {
    cy.visit("http://localhost:4000");

    cy.contains("Forcer une connexion a deux facteurs").click();

    cy.login("ial0-aal1-oal1@yopmail.com");

    // Test of the generic formula when sp_name is not returned
    cy.contains(
      "Le service auquel vous souhaitez accéder demande la mise en place d'une double authentification pour améliorer la sécurité de votre compte.",
    );

    cy.contains("Code à usage unique (TOTP)").click();

    cy.contains("Continuer").click();

    cy.contains("Installer votre outil d’authentification");

    cy.contains("J'ai installé une application d'authentification").click();

    cy.contains("Continuer").click();

    cy.contains("Scanner ce QRcode avec votre application");

    const invalidTotpCode = "123456";

    cy.get("[name=totpToken]").type(invalidTotpCode);
    cy.get('[action="/users/totp-configuration"] [type="submit"]').click();

    cy.contains(
      "Erreur : le code que vous avez utilisé est invalide. Merci de recommencer.",
    );

    cy.fillAndSubmitTotpForm("/users/totp-configuration");

    cy.contains("Votre double authentification est bien configurée");
    cy.contains("Continuer").click();

    cy.contains('"acr": "eidas0-mfa"');

    // should not force 2fa on all services after totp enrollment triggered by a service provider

    cy.contains("Se déconnecter").click();

    cy.setRequestedAcrs();
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial0-aal1-oal1@yopmail.com");

    cy.contains('"acr": "eidas0"');
  });

  it("should re-authenticate after long connexion to a service provider requires mfa", function () {
    cy.visit("http://localhost:4000");

    cy.contains("Forcer une connexion a deux facteurs").click();

    cy.login("ial0-aal1-oal1@yopmail.com");

    cy.contains("Code à usage unique (TOTP)").click();

    // Wait for connexion to last
    cy.wait(5 * 1000);

    cy.contains("Continuer").click();

    cy.contains("merci de vous identifier à nouveau.");

    // totp enrollment

    cy.login("ial0-aal1-oal1@yopmail.com");

    cy.contains("Code à usage unique (TOTP)").click();

    cy.contains("Continuer").click();

    cy.contains("Installer votre outil d’authentification");

    cy.contains("J'ai installé une application d'authentification").click();

    cy.contains("Continuer").click();

    cy.contains("Scanner ce QRcode avec votre application");

    cy.fillAndSubmitTotpForm("/users/totp-configuration");

    cy.contains("Votre double authentification est bien configurée");
    cy.contains("Continuer").click();

    cy.contains('"acr": "eidas0-mfa"');
  });

  it("should upgrade AAL and IAL of user if asked by the SP", function () {
    cy.visit("http://localhost:4000");

    cy.setRequestedAcrs(["eidas1-mfa", "eidas2", "eidas3"]);
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial0-aal1-oal1@yopmail.com");

    cy.contains("Code à usage unique (TOTP)").click();
    cy.contains("Continuer").click();

    cy.contains("Installer votre outil d’authentification");
    cy.contains("J'ai installé une application d'authentification").click();
    cy.contains("Continuer").click();

    cy.contains("Scanner ce QRcode avec votre application");
    cy.fillAndSubmitTotpForm("/users/totp-configuration");
    cy.contains("Continuer").click();

    cy.title().should("include", "Vérifier votre identité");
    cy.getByLabel("S’identifier avec FranceConnect").click();

    cy.title().should("include", "Connexion 🎭 FranceConnect 🎭");
    cy.contains("Je suis Ulysse Tosi").click();

    cy.contains('"acr": "eidas1-mfa"');
  });
});
