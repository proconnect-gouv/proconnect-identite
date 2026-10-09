describe("should suggest valid email address", () => {
  before(cy.seed);

  it("should sign-in", function () {
    cy.visit("/users/start-sign-in");

    cy.contains("Email professionnel").click();
    cy.focused().type("unknown-user-1@ypomail.com"); // yopmail with a typo domain
    cy.contains("Continuer").click();
    cy.get('[action="/users/start-sign-in"]  [type="submit"]').click();

    cy.get('[name="login"]').should("have.value", "unknown-user-1@ypomail.com");
    cy.contains("Adresse email invalide.");

    cy.get("#did-you-mean-link").click();
    cy.get('[action="/users/start-sign-in"]  [type="submit"]').click();

    cy.contains("Choisir un mot de passe");
  });
});

describe("allowed whitelist email domains", () => {
  it("should sign-in", function () {
    cy.visit("/users/start-sign-in");

    cy.get('[name="login"]')
      .clear()
      .type("whitelisted-user@invalid-domain.com");
    cy.get('[action="/users/start-sign-in"]  [type="submit"]').click();

    cy.contains("Choisir un mot de passe");
  });
});
