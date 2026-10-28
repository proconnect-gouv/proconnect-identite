describe("sign-in with webauthn enrollment", () => {
  beforeEach(cy.seed);

  beforeEach(() => {
    cy.addVirtualAuthenticator({
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
    });
  });

  it("should generate recovery words after a passkey enrollment asked by a service provider", function () {
    cy.origin("http://localhost:4000", () => {
      cy.visit("/");
      cy.contains("Forcer une connexion a deux facteurs").click();
    });

    cy.login("ial0-aal1-oal1@yopmail.com");

    cy.contains("Choisir votre méthode de connexion renforcée");
    cy.contains("Clé d'accès (passkey)").click();
    cy.contains("button", "Continuer").click();

    cy.title().should("include", "Sauvegardez vos mots de secours");
    cy.contains("Générer les mots de secours").click();

    cy.title().should("include", "Sauvegarder vos mots de secours");
    cy.getByLabel("Vos mots de secours")
      .invoke("text")
      .then((text) => text.trim().split(" "))
      .should("have.length", 6);
    cy.contains("label", "J’ai sauvegardé mes mots de secours").click();
    cy.contains("Continuer").click();

    cy.contains("Votre double authentification est bien configurée");
    cy.contains("Continuer").click();

    cy.contains('"acr": "eidas0-mfa"');
  });

  it("should skip recovery words after a passkey enrollment asked by a service provider", function () {
    cy.origin("http://localhost:4000", () => {
      cy.visit("/");
      cy.contains("Forcer une connexion a deux facteurs").click();
    });

    cy.login("ial0-aal1-oal1@yopmail.com");

    cy.contains("Choisir votre méthode de connexion renforcée");
    cy.contains("Clé d'accès (passkey)").click();
    cy.contains("button", "Continuer").click();

    cy.title().should("include", "Sauvegardez vos mots de secours");
    cy.contains("Ignorer pour le moment").click();

    cy.contains("Votre double authentification est bien configurée");
    cy.contains("Continuer").click();

    cy.contains('"acr": "eidas0-mfa"');
  });

  it("should go to the homepage after a passkey enrollment without service provider", function () {
    cy.visit("/");

    cy.login("force-2fa-without-second-factor@yopmail.com");

    cy.contains("Choisir votre méthode de connexion renforcée");
    cy.contains("Clé d'accès (passkey)").click();
    cy.contains("button", "Continuer").click();

    cy.title().should("include", "Sauvegardez vos mots de secours");
    cy.contains("Ignorer pour le moment").click();

    cy.contains("Votre double authentification est bien configurée");
    cy.contains("Continuer").click();

    cy.title().should("include", "Accueil");
  });
});
