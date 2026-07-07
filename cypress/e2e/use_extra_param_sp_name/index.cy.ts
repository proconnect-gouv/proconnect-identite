describe("display sp name", () => {
  before(cy.seed);

  it("should display sp name on mfa choice page", function () {
    cy.visit("http://localhost:4001/");

    cy.contains("Forcer une connexion a deux facteurs").click();

    cy.contains("Renseignez votre mot de passe").click();
    cy.focused().type("password123");
    cy.contains("S’identifier").click();

    cy.title().should("include", "Choisir un mode de double authentification");

    cy.contains(
      "En plus du mot de passe, une étape de sécurité supplémentaire sera demandée à chaque nouvelle session sur ProConnect Test.",
    );
  });
});
