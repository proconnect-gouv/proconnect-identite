describe("rename 2FA methods", () => {
  before(cy.seed);

  beforeEach(() => {
    cy.visit("/connection-and-account");
    cy.mfaLogin("rogal.dorn@imperialfists.world");
    cy.contains("Double authentification");
  });

  it("should rename the TOTP application", function () {
    cy.getByLabel(
      "Renommer l’application d’authentification Application d'authentification",
    ).click();
    cy.contains("Nouveau nom de l’application d’authentification").click();
    cy.focused().clear().type("Google Authenticator – téléphone pro");
    cy.getByLabel(
      "Renommer : Nouveau nom de l’application d’authentification",
    ).click();

    cy.contains("L’application d’authentification a bien été renommée.");
    cy.contains("Google Authenticator – téléphone pro");
  });

  it("should reset the TOTP application name when left empty", function () {
    cy.getByLabel(
      "Renommer l’application d’authentification Google Authenticator – téléphone pro",
    ).click();
    cy.contains("Nouveau nom de l’application d’authentification").click();
    cy.focused().clear();
    cy.getByLabel(
      "Renommer : Nouveau nom de l’application d’authentification",
    ).click();

    cy.contains("L’application d’authentification a bien été renommée.");
    cy.contains("Google Authenticator – téléphone pro").should("not.exist");
    cy.contains("Application d'authentification");
  });

  it("should rename the passkey", function () {
    cy.getByLabel("Renommer la clé d'accès iCloud Keychain").click();
    cy.contains("Nouveau nom de la clé d’accès iCloud Keychain").click();
    cy.focused().clear().type("MacBook pro");
    cy.getByLabel(
      "Renommer : Nouveau nom de la clé d’accès iCloud Keychain",
    ).click();

    cy.contains("Votre clé d’accès a bien été renommée.");
    cy.contains("MacBook pro");
    cy.contains("iCloud Keychain").should("not.exist");
  });
});
