describe("sign-in with totp enrollment", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("should follow first authentication when mfa asked", function () {
    cy.visit("http://localhost:4000");
    cy.setRequestedAcrs([
      "https://proconnect.gouv.fr/assurance/self-asserted-2fa",
      "https://proconnect.gouv.fr/assurance/consistency-checked-2fa",
    ]);

    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial2-aal1@yopmail.com");

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

    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/consistency-checked-2fa"',
    );

    cy.contains("Se déconnecter").click();

    cy.setRequestedAcrs();

    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial2-aal1@yopmail.com");

    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/consistency-checked"',
    );
  });

  it("should follow first authentication when mfa asked (with mfa forced)", function () {
    cy.visit("http://localhost:4000");
    cy.setRequestedAcrs([
      "https://proconnect.gouv.fr/assurance/self-asserted-2fa",
      "https://proconnect.gouv.fr/assurance/consistency-checked-2fa",
    ]);

    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial2-aal1-forced@yopmail.com");

    cy.contains("Code à usage unique (TOTP)").click();

    cy.contains(
      "Je configure la 2FA sur l'ensemble des sites que j'utilise avec ProConnect",
    ).click();

    cy.contains("Continuer").click();

    cy.contains("J'ai installé une application d'authentification").click();

    cy.contains("Continuer").click();

    cy.fillAndSubmitTotpForm("/users/totp-configuration");

    cy.contains("Continuer").click();

    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/consistency-checked-2fa"',
    );

    cy.contains("Se déconnecter").click();

    cy.setRequestedAcrs();

    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial2-aal1-forced@yopmail.com");

    cy.contains("Valider avec la double authentification");
  });

  it("should re-authenticate after long connexion to a service provider requires mfa", function () {
    cy.visit("http://localhost:4000");
    cy.setRequestedAcrs([
      "https://proconnect.gouv.fr/assurance/self-asserted-2fa",
      "https://proconnect.gouv.fr/assurance/consistency-checked-2fa",
    ]);

    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial2-aal2@yopmail.com");

    cy.contains("Code à usage unique (TOTP)").click();

    // Wait for connexion to last
    cy.wait(5 * 1000);

    cy.contains("Continuer").click();

    cy.contains("merci de vous identifier à nouveau.");

    // totp enrollment

    cy.login("ial2-aal2@yopmail.com");

    cy.contains("Code à usage unique (TOTP)").click();

    cy.contains("Continuer").click();

    cy.contains("Installer votre outil d’authentification");

    cy.contains("J'ai installé une application d'authentification").click();

    cy.contains("Continuer").click();

    cy.contains("Scanner ce QRcode avec votre application");

    cy.fillAndSubmitTotpForm("/users/totp-configuration");

    cy.contains("Votre double authentification est bien configurée");
    cy.contains("Continuer").click();

    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/consistency-checked-2fa"',
    );
  });
});
