//

describe("sign-in with suggestion", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  xit("should sign-up with magic link and be suggested the Ministere des armees organization", function () {
    // Visit the signup page
    cy.visit("/users/start-sign-in");

    cy.get('[name="login"]').type("user@intradef.gouv.fr");
    cy.get('[type="submit"]').click();

    cy.get('[name="password"]').type(
      "This super secret password is hidden well!",
    );
    cy.get('[action="/users/sign-up"]  [type="submit"]').click();

    // Check that the website is waiting for the user to verify their email
    cy.get("#verify-email > div > p").contains("user@intradef.gouv.fr");

    cy.verifyEmail();

    // Fill the user's personal information
    cy.get('[name="given_name"]').type("Loïs");
    cy.get('[name="family_name"]').type("Lane");
    cy.get('[type="submit"]').click();

    // Check that the ministere des armees is suggested
    cy.url().should("include", "users/organization-suggestions");
    cy.get("#submit-join-organization-1").contains("Ministere des armees");
  });

  xit("should sign-up with magic link with siret_hint and be suggested corresponding organization", function () {
    cy.visit("http://localhost:4001");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      siret_hint: "21340126800130",
    }));
    cy.contains("Connexion personnalisée").click({ force: true });

    cy.get('[name="password"]').type(
      "This super secret password is hidden well!",
    );
    cy.get('[action="/users/sign-up"]  [type="submit"]').click();

    cy.verifyEmail();

    // Fill the user's personal information
    cy.get('[name="given_name"]').type("Loïs");
    cy.get('[name="family_name"]').type("Lane");
    cy.get('[type="submit"]').click();

    cy.url().should("include", "users/join-organization");
    cy.get('input[name="siret"]').should("have.value", "21340126800130");
  });

  xit("should sign-in with password with siret_hint and be suggested corresponding organization if not already present", function () {
    cy.visit("http://localhost:4001");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      login_hint: "lion.eljonson@darkangels.world",
      siret_hint: "21340126800130",
    }));
    cy.contains("Connexion personnalisée").click({ force: true });

    cy.get('[name="password"]').type("password123");
    cy.get('[action="/users/sign-in"] [type="submit"]').click();

    cy.url().should("include", "users/join-organization");
    cy.get('input[name="siret"]').should("have.value", "21340126800130");
  });

  it("should sign-in with password with siret_hint and select corresponding organization if already present", function () {
    cy.visit("http://localhost:4001");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      login_hint: "konrad.curze@nightlords.world",
      siret_hint: "21340126800130",
    }));
    cy.contains("Connexion personnalisée").click({ force: true });

    cy.get('[name="password"]').type("password123");
    cy.get('[action="/users/sign-in"] [type="submit"]').click();

    cy.url().should("include", "http://localhost:4001/");
    cy.contains('"siret": "21340126800130"');
  });
});
