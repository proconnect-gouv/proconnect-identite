describe("mfa decision helper (account)", () => {
  before(cy.seed);

  it("should redirect to passkey recommendation when using a Mac", function () {
    cy.visit("/connection-and-account");

    cy.login("lion.eljonson@darkangels.world");

    cy.get('[href="/double-authentication"]')
      .contains("Configurer la double authentification")
      .click();

    cy.contains("Choisir votre méthode de connexion renforcée");

    cy.contains("Je ne sais pas").click();

    cy.get("#webauthn-registration-button").contains("Continuer").click();

    cy.contains("Travaillez-vous avec :");

    cy.contains("Un ordinateur Mac").click();

    cy.contains("Continuer").click();

    cy.contains("Passkey de votre ordinateur");
    cy.contains("Recommandé pour vous");
  });

  it("should redirect to passkey recommendation when using Windows Hello", function () {
    cy.visit("/connection-and-account");

    cy.login("lion.eljonson@darkangels.world");

    cy.get('[href="/double-authentication"]')
      .contains("Configurer la double authentification")
      .click();

    cy.contains("Je ne sais pas").click();

    cy.get("#webauthn-registration-button").contains("Continuer").click();

    cy.contains("Windows Hello").click();

    cy.contains("Continuer").click();

    cy.contains("Passkey de votre ordinateur");
  });

  it("should redirect to software TOTP recommendation", function () {
    cy.visit("/connection-and-account");

    cy.login("lion.eljonson@darkangels.world");

    cy.get('[href="/double-authentication"]')
      .contains("Configurer la double authentification")
      .click();

    cy.contains("Je ne sais pas").click();

    cy.get("#webauthn-registration-button").contains("Continuer").click();

    cy.contains("Autre").click();

    cy.contains("Continuer").click();

    cy.contains(
      "Avez-vous le droit d'installer des logiciels ou extensions de navigateur sur votre poste ?",
    );

    cy.contains("Oui").click();

    cy.contains("Continuer").click();

    cy.contains("Recommandé pour vous");
    cy.contains("Codes à usage unique (TOTP)");
    cy.contains("Proton Authenticator");
    cy.contains("Bitwarden");
    cy.contains("KeePassXC");
  });

  it("should redirect to smartphone app TOTP recommendation", function () {
    cy.visit("/connection-and-account");

    cy.login("lion.eljonson@darkangels.world");

    cy.get('[href="/double-authentication"]')
      .contains("Configurer la double authentification")
      .click();

    cy.contains("Je ne sais pas").click();

    cy.get("#webauthn-registration-button").contains("Continuer").click();

    cy.contains("Autre").click();
    cy.contains("Continuer").click();

    cy.contains("Non").click();
    cy.contains("Continuer").click();

    cy.contains("Pouvez-vous installer une application sur un smartphone ?");

    cy.contains("Oui").click();
    cy.contains("Continuer").click();

    cy.contains("Recommandé pour vous");
    cy.contains("Codes à usage unique (TOTP)");
    cy.contains("2FAS");
    cy.contains("FreeOTP");
  });

  it("should redirect to external help needed page", function () {
    cy.visit("/connection-and-account");

    cy.login("lion.eljonson@darkangels.world");

    cy.get('[href="/double-authentication"]')
      .contains("Configurer la double authentification")
      .click();

    cy.contains("Je ne sais pas").click();

    cy.get("#webauthn-registration-button").contains("Continuer").click();

    cy.contains("Autre").click();
    cy.contains("Continuer").click();

    cy.contains("Non").click();
    cy.contains("Continuer").click();

    cy.contains("Non").click();
    cy.contains("Continuer").click();

    cy.contains("Intervention extérieure nécessaire");
    cy.contains("contactez votre service informatique");
  });

  it("should allow restarting the flow from the passkey step", function () {
    cy.visit("/connection-and-account");

    cy.login("lion.eljonson@darkangels.world");

    cy.get('[href="/double-authentication"]')
      .contains("Configurer la double authentification")
      .click();

    cy.contains("Je ne sais pas").click();
    cy.get("#webauthn-registration-button").contains("Continuer").click();

    cy.contains("Un ordinateur Mac").click();
    cy.contains("Continuer").click();

    cy.contains("Revenir au début").click();

    cy.contains("Choisir votre méthode de connexion renforcée");
  });
});
