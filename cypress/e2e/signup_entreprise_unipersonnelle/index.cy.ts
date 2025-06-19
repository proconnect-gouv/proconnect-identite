//

describe("Signup into new entreprise unipersonnelle", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("creates a user", function () {
    // Visit the signup page
    cy.visit("/users/start-sign-in");

    // Sign up with the previously created inbox
    cy.get('[name="login"]').type("lion.eljonson@darkangels.world");
    cy.get('[type="submit"]').click();

    cy.get('[name="password"]').type(
      "This super secret password is hidden well!",
    );
    cy.get('[action="/users/sign-up"]  [type="submit"]').click();

    // Check that the website is waiting for the user to verify their email
    cy.get("#verify-email > div > p").contains(
      "lion.eljonson@darkangels.world",
    );

    cy.getVerificationEmail();

    // Fill the user's personal information
    cy.get('[name="given_name"]').type("Georges");
    cy.get('[name="family_name"]').type("Moustaki");
    cy.get('[name="job"]').type("Chargé de relation usager");
    cy.get('[type="submit"]').click();

    // Fill the user's organization information
    cy.get('[name="siret"]').type("82869625200018");
    cy.get('[type="submit"]').click();

    // Click on "continue" on the welcome page
    cy.get('[type="submit"]').click();

    // Check redirection to home page
    cy.contains("Votre compte ProConnect");

    cy.maildevGetMessageBySubject(
      "Votre compte ProConnect a bien été créé",
    ).then((email) => {
      cy.maildevVisitMessageById(email.id);
      cy.maildevDeleteMessageById(email.id);
      cy.contains("Votre compte ProConnect est créé !");
    });
  });
});
