//

describe("quit the organization", () => {
  beforeEach(cy.seed);

  it("quit one of my organizations", function () {
    cy.visit("/");

    cy.title().should("include", "S'inscrire ou se connecter -");
    cy.login("lion.eljonson@yopmail.com");

    cy.title().should("include", "Accueil -");
    cy.contains("Organisations").click();

    cy.title().should("include", "Organisations -");
    cy.getByLabel(
      "Quitter l'organisation Lycee general et technologique chaptal",
    ).click();

    cy.contains("Vous ne faites désormais plus partie de cette organisation.");

    cy.maildevGetMessageBySubject(
      "Vous avez quitté une organisation sur ProConnect",
    ).then((email) => {
      cy.maildevDeleteMessageById(email.id);
    });
  });

  it("redirects instead of erroring when the organization is already quit", function () {
    cy.visit("/");

    cy.login("lion.eljonson@yopmail.com");

    cy.title().should("include", "Accueil -");
    cy.contains("Organisations").click();

    cy.title().should("include", "Organisations -");
    cy.intercept("POST", "/users/quit-organization/*").as("quit");
    cy.getByLabel(
      "Quitter l'organisation Lycee general et technologique chaptal",
    ).click();

    cy.contains("Vous ne faites désormais plus partie de cette organisation.");

    cy.wait("@quit").then(({ request }) => {
      cy.request({
        body: request.body,
        failOnStatusCode: false,
        followRedirect: false,
        headers: { "content-type": "application/x-www-form-urlencoded" },
        method: "POST",
        url: request.url,
      }).then((response) => {
        expect(response.status).to.equal(302);

        cy.visit(String(response.headers["location"]));
        cy.title().should("include", "Organisations -");
        cy.contains(
          "Information : vous ne faites pas partie de cette organisation.",
        );
      });
    });
  });

  it("quit my last organization and get redirected to join page", function () {
    cy.visit("/");

    cy.title().should("include", "S'inscrire ou se connecter -");
    cy.login("lion.eljonson@yopmail.com");

    cy.title().should("include", "Accueil -");
    cy.contains("Organisations").click();

    cy.title().should("include", "Organisations -");
    cy.getByLabel(
      "Quitter l'organisation Lycee general et technologique chaptal",
    ).click();
    cy.getByLabel(
      "Quitter l'organisation Services de l'etat pour la facturation electronique - Destination etat via chorus pro",
    ).click();

    cy.title().should("include", "Organisations -");
    cy.contains("Vous n’êtes attaché à aucune organisation.");
  });
});
