//

describe("sign-in from proconnect federation client", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("should sign-in", () => {
    cy.visit("http://localhost:4001");
    cy.get("button.proconnect-button").click();

    cy.get('[name="password"]').type("password123");
    cy.get('[action="/users/sign-in"]  [type="submit"]')
      .contains("S’identifier")
      .click();

    cy.contains("proconnect-federation-client");
    cy.contains("unused1@yopmail.com");
    cy.contains("21340126800130");
  });

  it("should not prompt for password if a session is already opened", () => {
    cy.visit("/");
    cy.login("unused1@yopmail.com");

    cy.visit("http://localhost:4001");
    cy.get("button.proconnect-button").click();

    cy.contains("proconnect-federation-client");
    cy.contains("unused1@yopmail.com");
  });

  it("login_hint should take precedence over existing session", () => {
    cy.visit("/");
    cy.login("unused2@yopmail.com");

    cy.visit("http://localhost:4001");
    cy.get("button.proconnect-button").click();

    cy.get('[name="password"]').type("password123");
    cy.get('[action="/users/sign-in"]  [type="submit"]')
      .contains("S’identifier")
      .click();

    cy.contains("proconnect-federation-client");
    cy.contains("unused1@yopmail.com");
  });

  it("should go back to the Federation client when hitting the change email button", () => {
    cy.visit("http://localhost:4001");
    cy.get("button.proconnect-button").click();

    cy.get("#change-email-address").click();

    cy.contains("proconnect-federation-client");
  });
});

describe("sign-in with a client requiring 2fa identity", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4001");
    cy.setCustomParams({
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
    });
  });

  it("should sign-in an return the right acr value", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.get('[name="password"]').type("password123");
    cy.get('[action="/users/sign-in"]  [type="submit"]')
      .contains("S’identifier")
      .click();

    cy.contains("Attention : le site que vous voulez utiliser requiert la 2FA");
  });
});
