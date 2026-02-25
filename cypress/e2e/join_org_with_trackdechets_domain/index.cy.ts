//

describe("join organizations", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("join suggested organisation", function () {
    cy.visit("/users/join-organization");
    cy.login("lion.eljonson@darkangels.world");

    // The user gets this suggestion because it as darkangels.world as trackdechets domain
    cy.contains("Bnp paribas").click();

    // Check redirection to welcome page
    cy.contains("Compte créé 🎊");

    cy.maildevGetMessageBySubject(
      "Votre compte ProConnect a bien été créé",
    ).then((email) => {
      cy.maildevVisitMessageById(email.id);
      cy.maildevDeleteMessageById(email.id);
      cy.contains("Votre compte ProConnect est créé !");
    });
  });
});
