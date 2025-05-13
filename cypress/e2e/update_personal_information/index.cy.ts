describe("Signup into new entreprise unipersonnelle", () => {
  it("Should send email when user updates personal information", function () {
    cy.visit("/personal-information");

    cy.login("konrad.curze@nightlords.world");

    cy.visit("/personal-information");

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

  it("should no allow verified user to update given and family name", () => {
    cy.visit("/personal-information");

    cy.login("god-emperor@mankind.world");

    ["given_name", "family_name"].forEach((inputName) => {
      cy.get(`input[name="${inputName}"]`).should(
        "have.attr",
        "readonly",
        "readonly",
      );
    });

    cy.contains("Issue de votre vérification par FranceConnect");
    cy.contains("Profession").click();
    cy.focused().clear().type("Guide GPS Warp");

    cy.get('[type="submit"]').contains("Mettre à jour").click();

    cy.contains("Vos informations ont été mises à jour.");
    cy.seeInField(
      "Profession ou rôle au sein de votre organisation",
      "Guide GPS Warp",
    );
  });
});
