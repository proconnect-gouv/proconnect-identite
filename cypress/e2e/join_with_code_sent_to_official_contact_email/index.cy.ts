//

describe("join organizations", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("join collectivité territoriale with code send to official contact email", function () {
    cy.visit("/users/join-organization");
    cy.login("magnus.the.red@prospero.world");

    cy.get('[name="siret"]').type("21340126800130");
    cy.get('[type="submit"]').click();

    // Check the choice of email

    cy.contains("Continuer avec cet email").click();

    // Check that the website is waiting for the user to verify their email
    cy.contains(
      "nous avons envoyé un code à l’adresse email officielle de votre mairie",
    );
    cy.get(".email-badge-lowercase").contains(
      "alpharius.omegon@alphalegion.world",
    );

    cy.maildevGetMessageBySubject(
      "[ProConnect] Authentifier un email sur ProConnect",
    )
      .then((email) => {
        cy.maildevVisitMessageById(email.id);
        cy.maildevDeleteMessageById(email.id);
        cy.contains(
          "Jean Nouveau (magnus.the.red@prospero.world) souhaite rejoindre votre organisation « Commune de lamalou-les-bains - Mairie » sur ProConnect.",
        );
        return cy.get("em:nth-child(1)").invoke("text");
      })
      .then((code) => {
        cy.wrap(code).as("code");
      });

    cy.go("back");

    cy.get<string>("@code").then((code) => {
      cy.log(code);
      cy.get('[name="official_contact_email_verification_token"]').type(code);
      cy.get('[type="submit"]').click();
    });

    cy.contains("Votre compte est créé !");
  });

  it("join a mairie with a free email", function () {
    cy.visit("/users/join-organization");
    cy.login("unused1@yopmail.com");

    cy.get('[name="siret"]').type("21690085200015");
    cy.get('[type="submit"]').click();

    cy.maildevGetMessageBySubject(
      "[ProConnect] Authentifier un email sur ProConnect",
    )
      .then((email) => {
        cy.maildevVisitMessageById(email.id);
        cy.maildevDeleteMessageById(email.id);
        cy.contains(
          "Jean User1 (unused1@yopmail.com) souhaite rejoindre votre organisation « Commune de fleurieu sur saone - Mairie » sur ProConnect.",
        );
        return cy.get("em:nth-child(1)").invoke("text");
      })
      .then((code) => {
        cy.wrap(code).as("code");
      });

    cy.go("back");

    cy.get<string>("@code").then((code) => {
      cy.log(code);
      cy.get('[name="official_contact_email_verification_token"]').type(code);
      cy.get('[type="submit"]').click();
    });

    cy.contains("Votre compte est créé !");
  });
});
