//

describe("sign-in from standard client", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("should sign-in without org selection when having only one organization", function () {
    cy.visit("http://localhost:4000");
    cy.contains("S’identifier avec ProConnect").click();

    cy.title().should("include", "S'inscrire ou se connecter - ");
    cy.login("unused1@yopmail.com");

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains("standard-client");
    cy.contains('"email": "unused1@yopmail.com"');
    cy.contains('"label": "Commune de lamalou-les-bains - Mairie"');

    // then it should prompt for organization
    cy.contains("button", "Changer d’organisation").click();

    cy.title().should("include", "Choisir une organisation - ");
    cy.contains("Votre organisation de rattachement");
    cy.getByLabel(
      "Commune de lamalou-les-bains - Mairie (choisir cette organisation)",
    ).click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains("standard-client");
    cy.contains('"label": "Commune de lamalou-les-bains - Mairie"');

    // then it should update userinfo
    cy.contains('"family_name": "Jean Un"');
    cy.contains("button", "Mettre à jour mes informations").click();

    cy.title().should("include", "Renseigner votre identité - ");
    cy.contains("Renseigner son identité");
    cy.contains("Nom").click();
    cy.focused().clear().type("Moustaki");
    cy.contains("Valider").click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains("standard-client");
    cy.contains('"family_name": "Moustaki"');
  });

  it("should sign-in with org selection when having two organization", function () {
    cy.visit("http://localhost:4000");
    cy.contains("S’identifier avec ProConnect").click();

    cy.title().should("include", "S'inscrire ou se connecter - ");
    cy.login("unused2@yopmail.com");

    cy.title().should("include", "Choisir une organisation - ");
    cy.getByLabel(
      "Commune de lamalou-les-bains - Mairie (choisir cette organisation)",
    );

    cy.getByLabel(
      "Commune de clamart - Mairie (choisir cette organisation)",
    ).click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains("standard-client");
    cy.contains('"email": "unused2@yopmail.com"');
    cy.contains('"label": "Commune de clamart - Mairie"');

    // then it should prompt for organization
    cy.contains("button", "Changer d’organisation").click();
    cy.title().should("include", "Choisir une organisation - ");
    cy.contains("Votre organisation de rattachement");
    cy.getByLabel(
      "Commune de lamalou-les-bains - Mairie (choisir cette organisation)",
    ).click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains("standard-client");
    cy.contains('"email": "unused2@yopmail.com"');
    cy.contains('"label": "Commune de lamalou-les-bains - Mairie"');
  });

  it("should not prompt for password if a session is already opened", () => {
    cy.visit("/");
    cy.title().should("include", "S'inscrire ou se connecter - ");
    cy.login("unused1@yopmail.com");

    cy.visit("http://localhost:4000");
    cy.contains("S’identifier avec ProConnect").click();
    cy.contains("standard-client");
    cy.contains('"email": "unused1@yopmail.com"');
  });

  it("should bypass consent prompt", () => {
    cy.visit("http://localhost:4000");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      prompt: "consent",
    }));
    cy.get("button#custom-connection").click({ force: true });

    cy.title().should("include", "S'inscrire ou se connecter - ");
    cy.login("unused1@yopmail.com");
    cy.contains("standard-client");
  });

  it("should support claim requests", () => {
    cy.visit("http://localhost:4000");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      claims: {
        id_token: {
          given_name: { essential: true },
          family_name: {},
        },
      },
    }));
    cy.get("button#custom-connection").click({ force: true });

    cy.title().should("include", "S'inscrire ou se connecter - ");
    cy.login("unused1@yopmail.com");
    cy.contains("standard-client");
  });
});
