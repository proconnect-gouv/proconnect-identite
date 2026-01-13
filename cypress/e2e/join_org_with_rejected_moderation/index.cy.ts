//

describe("join organization with rejected moderation", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("should show rejection message when user tries to join organization they were rejected from", function () {
    cy.visit("/users/join-organization");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.login("rejected.user@yopmail.com");

    cy.title().should("include", "Rejoindre une organisation - ProConnect");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("66204244933106");
    cy.contains("Enregistrer").click();

    cy.title().should("include", "Demande refusée - ProConnect");
    cy.contains("Demande refusée");
    cy.contains("Motif : Nom de domaine introuvable");
    cy.contains(
      "Nous n'avons pu établir aucun lien entre votre profil et l'organisation",
    );
    cy.getByLabel("Changer d’organisation").click();

    cy.title().should("include", "Rejoindre une organisation - ProConnect");
  });

  it("should show warning page with edit options for warning-type rejections", function () {
    cy.visit("/users/join-organization");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.login("rejected.user@yopmail.com");

    cy.title().should("include", "Rejoindre une organisation - ProConnect");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("66204244914742");
    cy.contains("Enregistrer").click();

    cy.title().should("include", "Informations à corriger - ProConnect");
    cy.contains("Modifications demandées");
    cy.contains("Motif : Inversion Nom et Prénom");
    cy.getByLabel("Corriger le nom").click();

    cy.title().should("include", "Renseigner votre identité - ProConnect");
    cy.contains("Renseigner son identité");
    cy.contains("Nom").click();
    cy.focused().clear().type("Le Bon");
    cy.contains("Valider").click();

    cy.title().should("include", "Accueil - ProConnect");
    cy.contains("Organisations").click();
    cy.contains(
      "Votre demande pour représenter cette organisation en cours de traitement",
    ).click();

    cy.contains("Rejoindre une autre organisation").click();
    cy.title().should("include", "Rejoindre une organisation - ProConnect");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("66204244914742");
    cy.contains("Enregistrer").click();

    cy.title().should("include", "Rattachement en cours - ProConnect");
    cy.contains("Demande en cours");
    cy.contains("Nom Le Bon");
  });

  it("should show default reason when moderation comment has no standard format", function () {
    cy.visit("/users/join-organization");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.login("rejected.user@yopmail.com");

    cy.title().should("include", "Rejoindre une organisation - ProConnect");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("66204244905476");
    cy.contains("Enregistrer").click();

    cy.title().should("include", "Demande refusée - ProConnect");
    cy.contains("Demande refusée");
    cy.contains("Motif : Raison non spécifiée");
    cy.contains(
      "Nous n'avons pu établir aucun lien entre votre profil et l'organisation",
    );
    cy.getByLabel("Changer d’adresse email").click();

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
  });
});
