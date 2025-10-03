describe("display sp name", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("should display sp name on mfa choice page", function () {
    cy.visit("http://localhost:4001/");

    cy.contains("Forcer une connexion a deux facteurs").click();

    cy.contains("Renseignez votre mot de passe").click();
    cy.focused().type("password123");
    cy.contains("S’identifier").click();

    cy.title().should("include", "Choisir un mode de double authentification");

    cy.contains(
      "ProConnect Test demande la mise en place d'une double authentification pour améliorer la sécurité de votre compte",
    );
  });
});
