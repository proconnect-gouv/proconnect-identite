describe("sign-in with 2FA forced by organization", () => {
  beforeEach(cy.seed);

  it("should force 2FA when the only organization of the user is listed", function () {
    cy.visit("http://localhost:4000");
    cy.contains("S’identifier avec ProConnect").click();

    cy.mfaLogin("forced-org@yopmail.com");

    cy.contains('"amr": [\n    "pwd",\n    "otp",\n    "mfa"\n  ],');
  });

  it("should not force 2FA when the organization is not listed", function () {
    cy.visit("http://localhost:4000");
    cy.contains("S’identifier avec ProConnect").click();

    cy.login("free-org@yopmail.com");

    cy.contains('"amr": [\n    "pwd"\n  ],');
  });

  it("should force 2FA when the user selects a listed organization", function () {
    cy.visit("http://localhost:4000");
    cy.contains("S’identifier avec ProConnect").click();

    cy.login("both-orgs@yopmail.com");

    cy.title().should("include", "Choisir une organisation - ");
    cy.getByLabel(
      "Commune de lamalou-les-bains - Mairie (choisir cette organisation)",
    ).click();

    cy.contains("Valider avec la double authentification");

    cy.fillTotpFields();

    cy.contains('"amr": [\n    "pwd",\n    "otp",\n    "mfa"\n  ],');
  });

  it("should not force 2FA when the user selects a non listed organization", function () {
    cy.visit("http://localhost:4000");
    cy.contains("S’identifier avec ProConnect").click();

    cy.login("both-orgs@yopmail.com");

    cy.title().should("include", "Choisir une organisation - ");
    cy.getByLabel(
      "Commune de clamart - Mairie (choisir cette organisation)",
    ).click();

    cy.contains('"amr": [\n    "pwd"\n  ],');
  });

  it("should ask for 2FA enrollment when the user has no 2FA configured", function () {
    cy.visit("http://localhost:4000");
    cy.contains("S’identifier avec ProConnect").click();

    cy.login("no-totp@yopmail.com");

    cy.title().should(
      "include",
      "Choisir un mode de double authentification - ProConnect",
    );
    cy.contains("votre organisation requiert la double authentification");
    cy.contains("Choisir votre méthode de connexion renforcée");
  });
});
