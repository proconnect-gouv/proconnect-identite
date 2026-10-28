describe("recovery words reminder", () => {
  before(cy.seed);

  it("should remind a user without recovery words after a 2fa sign-in", function () {
    cy.visit("/");
    cy.mfaLogin("lion.eljonson@darkangels.world");

    cy.title().should("include", "Sauvegardez vos mots de secours");
    cy.contains("Ignorer pour le moment").click();

    cy.title().should("include", "Accueil");
  });

  it("should not remind the same user again within 24 hours", function () {
    cy.visit("/");
    cy.mfaLogin("lion.eljonson@darkangels.world");

    cy.title().should("include", "Accueil");
  });

  it("should remind again after 24 hours and let the user generate recovery words", function () {
    cy.visit("/");
    cy.mfaLogin("rogal.dorn@imperialfists.world");

    cy.title().should("include", "Sauvegardez vos mots de secours");
    cy.contains("Générer les mots de secours").click();

    cy.title().should("include", "Sauvegarder vos mots de secours");
    cy.contains("Continuer").click();

    cy.title().should("include", "Accueil");
  });

  it("should bring the user back to the service provider", function () {
    cy.visit("http://localhost:4000");
    cy.contains("Forcer une connexion a deux facteurs").click();

    cy.mfaLogin("konrad.curze@nightlords.world");

    cy.title().should("include", "Sauvegardez vos mots de secours");
    cy.contains("Ignorer pour le moment").click();

    cy.contains('"acr": "eidas0-mfa"');
  });
});
