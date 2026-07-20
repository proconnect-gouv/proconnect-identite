//

describe("join collectivité territoriale with code send to official contact email", () => {
  before(cy.seed);

  it.only("should ask which mairie to select and then send a code challenge to the selected one", function () {
    cy.visit("/users/join-organization");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.login("eneeria@yopmail.com");

    cy.title().should("include", "Rejoindre une organisation - ProConnect");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("20006541500016");
    cy.contains("Enregistrer").click();

    cy.title().should("include", "Confirmer le rattachement - ProConnect");
    cy.contains("Continuer avec cet email").click();

    cy.contains("À quelle adresse e-mail souhaitez-vous recevoir le code ?");

    cy.contains("mairie-beaumont@lahague.com").click();

    cy.contains("Valider").click();

    cy.title().should("include", "Vérifier votre email - ProConnect");
    cy.contains(
      "Nous vérifions que vous avez accès à l’adresse email officielle de votre mairie : mairie-beaumont@lahague.com",
    );

    cy.maildevGetMessageBySubject(
      "[ProConnect] Authentifier un email sur ProConnect",
    )
      .then((email) => {
        cy.maildevVisitMessageById(email.id);
        cy.maildevDeleteMessageById(email.id);
        cy.contains(
          "Marie Elisabeth (eneeria@yopmail.com) souhaite rejoindre votre organisation « Commune de la hague - Mairie » sur ProConnect.",
        );
        return cy.get("em:nth-child(1)").invoke("text");
      })
      .then((code) => {
        cy.wrap(code).as("code");
      });

    cy.go("back");
    cy.title().should("include", "Vérifier votre email -");

    cy.get<string>("@code").then((code) => {
      cy.contains("Insérer le code à 2 mots").click();
      cy.focused().clear().type(code);
      cy.contains("Valider").click();
    });

    cy.title().should("include", "Compte créé - ProConnect");
    cy.contains("Compte créé 🎊");
  });
});
