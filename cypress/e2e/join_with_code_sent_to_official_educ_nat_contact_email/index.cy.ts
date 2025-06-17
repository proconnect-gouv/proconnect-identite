//

describe("join organizations", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("join collectivité territoriale with code send to official contact email", function () {
    cy.visit("/users/join-organization");
    cy.login("konrad.curze@nightlords.world");

    cy.get('[name="siret"]').type("19750663700010");
    cy.get('[type="submit"]').click();

    // Check that the website is waiting for the user to verify their email
    cy.contains(
      "nous avons envoyé un code à l’adresse email officielle de votre établissement scolaire",
    );
    cy.get(".email-badge-lowercase").contains("rogal.dorn@imperialfists.world");

    cy.maildevGetMessageBySubject(
      "[ProConnect] Authentifier un email sur ProConnect",
    )
      .then((email) => {
        cy.maildevVisitMessageById(email.id);
        cy.maildevDeleteMessageById(email.id);
        cy.contains(
          "Jean Nouveau (konrad.curze@nightlords.world) souhaite rejoindre votre organisation « Lycee general et technologique chaptal » sur ProConnect.",
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
