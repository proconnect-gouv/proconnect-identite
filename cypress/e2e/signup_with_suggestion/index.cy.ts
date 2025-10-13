//

describe("sign-up with suggestion", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("should sign-up with magic link and be suggested the Ministere des armees organization", function () {
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
});
