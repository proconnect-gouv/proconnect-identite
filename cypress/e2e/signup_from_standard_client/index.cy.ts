//

describe("sign-up from standard client", () => {
  before(cy.seed);

  it("should sign-up with gouv.fr domain", function () {
    cy.origin("http://localhost:4000", () => {
      cy.visit("/");
      cy.title().should("equal", "standard-client - ProConnect");
      cy.contains("S’identifier avec ProConnect").click();
    });

    cy.contains("Email professionnel").click();
    cy.magicLinkLogin("angela@vip.gouv.fr");

    cy.title().should(
      "equal",
      "Votre organisation de rattachement - ProConnect",
    );
    cy.getByLabel(
      "Sélectionner l'organisation Direction interministerielle du numerique (DINUM)",
    ).click();

    cy.title().should("equal", "Renseigner votre identité - ProConnect");
    cy.contains("Compléter votre profil");
    cy.contains("Prénom").click();
    cy.focused().clear().type("Paul");
    cy.contains("Nom").click();
    cy.focused().clear().type("Pierre");
    cy.contains("Continuer").click();

    cy.title().should("equal", "Compte créé - ProConnect");
    cy.contains("Continuer").click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains("standard-client");
    cy.contains('"family_name": "Pierre"');
    cy.contains('"given_name": "Paul"');
    cy.contains('"email": "angela@vip.gouv.fr"');
  });
});
