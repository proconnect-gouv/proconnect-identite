//

describe("join organizations", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("join suggested organisation", function () {
    cy.visit("/users/join-organization");
    cy.login("lion.eljonson@darkangels.world");

    // The user gets this suggestion because it as darkangels.world as trackdechets domain
    cy.get(".fr-grid-row .fr-col-12:first-child .fr-tile__link").contains(
      "Bnp paribas",
    );

    // Click on the suggested organization
    cy.get(".fr-grid-row .fr-col-12:first-child .fr-tile__link").click();

    // Check redirection to welcome page
    cy.contains("Votre compte est créé !");

    cy.maildevGetMessageBySubject(
      "Votre compte ProConnect a bien été créé",
    ).then((email) => {
      cy.maildevVisitMessageById(email.id);
      cy.maildevDeleteMessageById(email.id);
      cy.contains("Votre compte ProConnect est créé !");
    });
  });
});
