//

describe("sign-in with legacy scope", () => {
  before(cy.seed);

  it("should sign-in with multiple organizations", function () {
    cy.visit("http://localhost:4000");

    cy.title().should("equal", "standard-client - ProConnect");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      scope: "openid email profile phone organizations",
    }));
    cy.get("button#custom-connection").click({ force: true });

    cy.title().should("equal", "S'inscrire ou se connecter - ProConnect");
    cy.login("unused1@yopmail.com");

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains("standard-client");
    cy.contains("unused1@yopmail.com");
    cy.contains("Commune de lamalou-les-bains");
    cy.contains(
      `
    "organizations": [
    {
      "id": 1,
      "siret": "21340126800130",
      "is_external": false,
      "label": "Commune de lamalou-les-bains - Mairie",
      "is_commune": true,
      "is_service_public": true,
      "is_public_service": true
    },
    {
      "id": 2,
      "siret": "21920023500014",
      "is_external": false,
      "label": "Commune de clamart - Mairie",
      "is_commune": true,
      "is_service_public": true,
      "is_public_service": true
    }
  ]`.trim(),
    );
    cy.contains('"scope": "openid email profile phone organizations",');

    // then it should prompt for organization
    cy.contains("S’identifier avec ProConnect").click();
    cy.title().should("equal", "Choisir une organisation - ProConnect");
    cy.contains("Votre organisation de rattachement");
    cy.contains("Commune de lamalou-les-bains");
    cy.contains("Commune de clamart").click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains("standard-client");
    cy.contains("Commune de clamart - Mairie");
  });

  it("should not support multiple organizations and certification dirigeant", function () {
    cy.visit("http://localhost:4000");

    cy.title().should("equal", "standard-client - ProConnect");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      scope: "openid email profile phone organizations",
    }));
    cy.setRequestedAcrs([
      "https://proconnect.gouv.fr/assurance/certification-dirigeant",
    ]);
    cy.get("button#custom-connection").click({ force: true });

    cy.title().should("equal", "S'inscrire ou se connecter - ProConnect");
    cy.login("unused1@yopmail.com");
    cy.contains(
      "Erreur access_denied none of the requested ACRs could be obtained ",
    );
  });
});
