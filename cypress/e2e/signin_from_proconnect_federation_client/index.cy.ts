//

it("should seed the database once", function () {
  cy.seed();
});

describe("sign-in from proconnect federation client", () => {
  it("should sign-in", () => {
    cy.visit("http://localhost:4001");
    cy.contains("S’identifier avec ProConnect").click();

    cy.contains("Renseignez votre mot de passe").click();
    cy.focused().type("password123");
    cy.contains("S’identifier").click();

    cy.title().should("equal", "proconnect-federation-client - ProConnect");
    cy.contains("proconnect-federation-client");

    cy.contains('"given_name": "Jean"');
    cy.contains('"usual_name": "Jack"');
    cy.contains('"email": "unused1@yopmail.com"');
    cy.contains('"siret": "21340126800130"');
    cy.contains('"phone_number": "0123456789"');
    cy.contains('"phone_number_verified": false');
    cy.contains('"is_service_public": true');
    cy.contains('"is_public_service": true');
  });

  it("should not prompt for password if a session is already opened", () => {
    cy.visit("/");
    cy.login("unused1@yopmail.com");

    cy.visit("http://localhost:4001");
    cy.contains("S’identifier avec ProConnect").click();

    cy.contains("proconnect-federation-client");
    cy.contains("unused1@yopmail.com");
  });

  it("login_hint should take precedence over existing session", () => {
    cy.visit("/");
    cy.login("unused2@yopmail.com");

    cy.visit("http://localhost:4001");
    cy.contains("S’identifier avec ProConnect").click();

    cy.get('[name="password"]').type("password123");
    cy.get('[action="/users/sign-in"]  [type="submit"]')
      .contains("S’identifier")
      .click();

    cy.contains("proconnect-federation-client");
    cy.contains("unused1@yopmail.com");
  });

  it("should go back to the Federation client when hitting the change email button", () => {
    cy.visit("http://localhost:4001");
    cy.contains("S’identifier avec ProConnect").click();

    cy.get("#change-email-address").click();

    cy.contains("proconnect-federation-client");
  });
});

describe("sign-in with a client requiring 2fa identity", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4001");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      acr_values: null,
      claims: {
        id_token: {
          amr: { essential: true },
          acr: {
            essential: true,
            values: [
              "https://proconnect.gouv.fr/assurance/self-asserted-2fa",
              "https://proconnect.gouv.fr/assurance/consistency-checked-2fa",
            ],
          },
        },
      },
    }));
    cy.contains("Connexion personnalisée").click({ force: true });
  });
});

describe("sign-in partial user info", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4001");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      login_hint: "unused2@yopmail.com",
    }));
    cy.contains("Connexion personnalisée").click({ force: true });

    cy.contains("Renseignez votre mot de passe").click();
    cy.focused().type("password123");
    cy.contains("S’identifier").click();
  });

  it("should sign-in without passing a phone_number", () => {
    cy.title().should("equal", "proconnect-federation-client - ProConnect");
    cy.contains("proconnect-federation-client");

    cy.contains('"given_name": "Jean"');
    cy.contains('"usual_name": "Luck"');
    cy.contains('"email": "unused2@yopmail.com"');
    cy.contains('"siret": "21340126800130"');
    cy.contains('"phone_number": ""').should("not.exist");
    cy.contains('"phone_number_verified": false');
    cy.contains('"is_service_public": true');
    cy.contains('"is_public_service": true');
  });
});
