describe("Connect FranceConnect account", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("Should update personal information with FranceConnect data", function () {
    cy.visit("/personal-information");

    cy.login("god-emperor@mankind.world");

    cy.visit("/personal-information");

    cy.title().should("include", "Informations personnelles -");
    cy.seeInField("Prénom", "God");
    cy.seeInField("Nom", "Emperor");
    cy.contains("S’identifier avec").click();

    cy.title().should("include", "Connexion 🎭 FranceConnect 🎭");
    cy.contains("Je suis Jean De La Rose").click();

    cy.title().should("include", "Déconnexion 🎭 FranceConnect 🎭");
    cy.contains("Déconnexion en cours...");

    cy.title().should("include", "Informations personnelles -");
    cy.contains("Nous avons bien récupéré vos données via FranceConnect.");

    cy.seeInField("Prénom", "Jean");
    cy.seeInField("Nom", "De La Rose");

    cy.getByLabel("Se déconnecter - Jean De La Rose")
      .filter(":visible")
      .click();

    cy.title().should("include", "S'inscrire ou se connecter -");
    cy.contains("Information : vous êtes maintenant déconnecté.");
  });

  it("should come back to personal information page if FranceConnect access denied", function () {
    cy.visit("/");
    cy.login("god-emperor@mankind.world");

    cy.visit("/personal-information");

    cy.title().should("include", "Informations personnelles -");
    cy.contains("S’identifier avec").click();

    cy.title().should("include", "Connexion 🎭 FranceConnect 🎭");
    cy.contains("Revenir sur votre fournisseur de service").click();

    cy.title().should("include", "Informations personnelles -");
    cy.contains(
      "L'authentification FranceConnect a échoué. Veuillez réessayer.",
    );
  });
});
