describe("recovery words incentive", () => {
  before(cy.seed);

  it("should show the incentive to a user without recovery words at sign-in", function () {
    cy.visit("/");
    cy.mfaLogin("without-recovery-words@yopmail.com");

    cy.title().should("include", "Sauvegardez vos mots de secours");
    cy.contains("Ignorer pour le moment").click();

    cy.title().should("include", "Accueil");
  });

  it("should not show the incentive again within the same session", function () {
    cy.visit("/");
    cy.mfaLogin("without-recovery-words@yopmail.com");

    cy.title().should("include", "Sauvegardez vos mots de secours");
    cy.contains("Ignorer pour le moment").click();

    cy.title().should("include", "Accueil");

    cy.visit("/connection-and-account");
    cy.title().should("include", "Compte et connexion");

    cy.visit("/");
    cy.title().should("include", "Accueil");
  });

  it("should show the incentive again at the next sign-in", function () {
    cy.visit("/");
    cy.mfaLogin("without-recovery-words@yopmail.com");

    cy.title().should("include", "Sauvegardez vos mots de secours");
  });

  it("should let the user generate recovery words, then stop showing the incentive", function () {
    cy.visit("/");
    cy.mfaLogin("without-recovery-words+generate@yopmail.com");

    cy.title().should("include", "Sauvegardez vos mots de secours");
    cy.contains("Générer les mots de secours").click();

    cy.title().should("include", "Sauvegarder vos mots de secours");
    cy.contains("label", "J’ai sauvegardé mes mots de secours").click();
    cy.contains("Continuer").click();

    cy.title().should("include", "Accueil");

    cy.clearAllCookies();
    cy.visit("/");
    cy.mfaLogin("without-recovery-words+generate@yopmail.com");

    cy.title().should("include", "Accueil");
  });

  it("should bring the user back to the service provider", function () {
    cy.visit("http://localhost:4000");
    cy.contains("Forcer une connexion a deux facteurs").click();

    cy.mfaLogin("without-recovery-words+service-provider@yopmail.com");

    cy.title().should("include", "Sauvegardez vos mots de secours");
    cy.contains("Ignorer pour le moment").click();

    cy.contains('"acr": "eidas0-mfa"');
  });
});
