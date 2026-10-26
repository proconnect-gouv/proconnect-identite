describe("mfa decision helper (signin)", () => {
  before(cy.seed);

  it("should redirect to passkey recommendation when using a Mac", function () {
    cy.visit("http://localhost:4000");

    cy.contains("Forcer une connexion a deux facteurs").click();

    cy.login("ial0-aal1-oal1@yopmail.com");

    cy.contains("Je ne sais pas").click();

    cy.contains("Continuer").click();

    cy.contains("Travaillez-vous avec :");

    cy.contains("Un ordinateur Mac").click();

    cy.contains("Continuer").click();

    cy.contains("Passkey de votre ordinateur");
    cy.contains("Recommandé pour vous");
  });

  it("should redirect to software TOTP recommendation", function () {
    cy.visit("http://localhost:4000");

    cy.contains("Forcer une connexion a deux facteurs").click();

    cy.login("ial0-aal1-oal1@yopmail.com");

    cy.contains("Je ne sais pas").click();
    cy.contains("Continuer").click();

    cy.contains("Autre").click();
    cy.contains("Continuer").click();

    cy.contains(
      "Avez-vous le droit d'installer des logiciels ou extensions de navigateur sur votre poste ?",
    );

    cy.contains("Oui").click();
    cy.contains("Continuer").click();

    cy.contains("Codes à usage unique (TOTP)");
    cy.contains("Proton Authenticator");

    cy.contains("Continuer").click();

    // arrive sur la page standard "Quel outil utilisez-vous ?"
    cy.contains("Quel outil utilisez-vous ?");
  });

  it("should redirect to smartphone app TOTP recommendation", function () {
    cy.visit("http://localhost:4000");

    cy.contains("Forcer une connexion a deux facteurs").click();

    cy.login("ial0-aal1-oal1@yopmail.com");

    cy.contains("Je ne sais pas").click();
    cy.contains("Continuer").click();

    cy.contains("Autre").click();
    cy.contains("Continuer").click();

    cy.contains("Non").click();
    cy.contains("Continuer").click();

    cy.contains("Pouvez-vous installer une application sur un smartphone ?");

    cy.contains("Oui").click();
    cy.contains("Continuer").click();

    cy.contains("Codes à usage unique (TOTP)");
    cy.contains("2FAS");

    cy.contains("Continuer").click();

    cy.contains("Quel outil utilisez-vous ?");
  });

  it("should redirect to external help needed page", function () {
    cy.visit("http://localhost:4000");

    cy.contains("Forcer une connexion a deux facteurs").click();

    cy.login("ial0-aal1-oal1@yopmail.com");

    cy.contains("Je ne sais pas").click();
    cy.contains("Continuer").click();

    cy.contains("Autre").click();
    cy.contains("Continuer").click();

    cy.contains("Non").click();
    cy.contains("Continuer").click();

    cy.contains("Non").click();
    cy.contains("Continuer").click();

    cy.contains("Intervention extérieure nécessaire");
  });

  it("should allow restarting the flow from any step", function () {
    cy.visit("http://localhost:4000");

    cy.contains("Forcer une connexion a deux facteurs").click();

    cy.login("ial0-aal1-oal1@yopmail.com");

    cy.contains("Je ne sais pas").click();
    cy.contains("Continuer").click();

    cy.contains("Autre").click();
    cy.contains("Continuer").click();

    cy.contains("Revenir au début").click();

    cy.contains("Choisir votre méthode de connexion renforcée");
  });

  it("should show the invalid passkey error when passkey registration fails", function () {
    cy.addVirtualAuthenticator({
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      defaultBackupEligibility: false,
      defaultBackupState: true,
    });

    cy.visit("/users/double-authentication-choice");

    cy.login("ial0-aal1-oal1@yopmail.com");

    cy.contains("Clé d'accès (passkey)").click();
    cy.contains("button", "Continuer").click();

    cy.title().should(
      "include",
      "Choisir un mode de double authentification - ProConnect",
    );
    cy.contains("h1", "Choisir votre méthode de connexion renforcée");
    cy.contains("Erreur : votre clé d’accès est invalide.");
  });
});
