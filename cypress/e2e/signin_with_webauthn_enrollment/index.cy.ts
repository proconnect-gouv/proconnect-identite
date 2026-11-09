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

  it("should go to the homepage after a passkey enrollment without service provider", function () {
    cy.visit("/");

    cy.login("force-2fa-without-second-factor@yopmail.com");

    cy.contains("Choisir votre méthode de connexion renforcée");
    cy.contains("Clé d'accès (passkey)").click();
    cy.contains("button", "Continuer").click();

    cy.contains("Votre double authentification est bien configurée");
    cy.contains("Continuer").click();

    cy.title().should("include", "Accueil");
  });
});
