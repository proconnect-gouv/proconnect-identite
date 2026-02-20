describe("Signup into new entreprise unipersonnelle", () => {
  before(cy.seed);

  it("Should send email when user updates personal information", function () {
    cy.visit("/personal-information");

    cy.login("konrad.curze@nightlords.world");

    cy.contains("Vos informations personnelles");

    cy.get('input[name="given_name"]').clear().type("Night");
    cy.get('input[name="family_name"]').clear().type("Haunter");

    cy.get('[type="submit"]').contains("Mettre à jour").click();

    cy.contains("Vos informations ont été mises à jour.");

    cy.maildevGetMessageBySubject(
      "Mise à jour de vos données personnelles",
    ).then((email) => {
      cy.maildevVisitMessageById(email.id);
      cy.maildevDeleteMessageById(email.id);
      cy.contains(
        "Nous vous informons que vos données personnelles ont été mises à jour avec succès.",
      );
      cy.contains("Prénom : Night");
      cy.contains("Nom de famille : Haunter");
    });
  });

  it("should show an error where putting invalid names or job", () => {
    cy.visit("/personal-information");

    cy.login("konrad.curze@nightlords.world");

    ["given_name", "family_name", "job"].forEach((inputName) => {
      cy.get(`input[name="${inputName}"]`).clear().type("​");

      cy.get('[type="submit"]').contains("Mettre à jour").click();

      cy.contains(
        "Erreur : le format des informations personnelles est invalide.",
      );
    });
  });

  it("should allow user to select his names from authorized lists", () => {
    cy.visit("/personal-information");

    cy.login("user@yopmail.com");

    cy.seeInField("Prénom", "Prénom1");
    cy.seeInField("Nom", "NOM DE NAISSANCE");
    cy.seeInField("Profession ou rôle au sein de votre organisation", "User");

    cy.contains("Prénom *").click();
    cy.focused().select("Prénom2");

    cy.contains("Nom *").click();
    cy.focused().select("NOM D'USAGE");

    cy.contains("Profession").click();
    cy.focused().clear().type("Simple lad");

    cy.contains("Mettre à jour").click();

    cy.contains("Vos informations ont été mises à jour.");
    cy.seeInField("Prénom", "Prénom2");
    cy.seeInField("Nom", "NOM D'USAGE");
    cy.seeInField(
      "Profession ou rôle au sein de votre organisation",
      "Simple lad",
    );

    cy.contains("S’identifier avec FranceConnect").click();

    cy.title().should("include", "🎭 FranceConnect 🎭");
    cy.contains("Je suis Elia Alvernhe").click();

    cy.seeInField("Prénom", "Elia");
    cy.seeInField("Nom", "Dulac");

    cy.contains("Nom *").click();
    cy.focused().select("Dulac");

    cy.contains("Mettre à jour").click();
    cy.seeInField("Nom", "Dulac");
  });

  it("should see an empty organization page", () => {
    cy.visit("/manage-organizations");

    cy.login("rogal.dorn@imperialfists.world");

    cy.title().should("include", "Organisations");
    cy.contains("Vous n’êtes attaché à aucune organisation.");
  });

  it("should see an empty userinfo page", () => {
    cy.visit("/personal-information");

    cy.login("rogal.dorn@imperialfists.world");

    cy.title().should("include", "Informations personnelles");
    cy.contains("Vos informations personnelles");

    ["given_name", "family_name", "job"].forEach((inputName) => {
      cy.get(`input[name="${inputName}"]`).should("have.value", "");
    });
  });
});
