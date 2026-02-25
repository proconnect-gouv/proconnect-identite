//

it("should seed the database once", function () {
  cy.seed();
});

describe("join with gouv.fr domain", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.login("lion.eljonson@vip.gouv.fr");
    cy.visit("/users/join-organization");
  });

  it("DINUM", function () {
    cy.title().should("include", "Votre organisation de rattachement");

    cy.getByLabel(
      "Sélectionner l'organisation Direction interministerielle du numerique (DINUM)",
    ).click();

    cy.title().should("include", "Compte créé -");
    cy.contains("Compte créé 🎊");
  });
});

describe("denied access with gouv.fr to", () => {
  const sirets = [
    {
      siret: "31723624800017",
      type: "EMMAUS SOLIDARITE",
    },
    {
      siret: "82869625200018",
      type: "Entrepreneur individuel",
    },
  ];

  beforeEach(() => {
    cy.visit("/");
    cy.login("lion.eljonson@vip.gouv.fr");
    cy.visit("/users/join-organization");

    cy.title().should("include", "Rejoindre une organisation -");
    cy.contains("SIRET de l’organisation que vous représentez").click();
  });

  sirets.forEach(({ siret, type }) => {
    it(type, function () {
      cy.focused().clear().type(siret);
      cy.contains("Enregistrer").click();
      cy.title().should("include", "Email non autorisé -");
      cy.contains("Email non autorisé");
      cy.contains(
        "Les adresses email de l’administration publique ne peuvent pas être utilisées pour représenter des organisations privées.",
      );
    });
  });
});

describe("allowed access with gouv.fr to", () => {
  const sirets = [
    {
      siret: "20000713600019",
      type: "Syndicat intercommunal à vocation unique (SIVU)",
    },
    {
      siret: "26090012100013",
      type: "Établissement public local social et médico-social",
    },
    {
      siret: "26290359400014",
      type: "Centre communal d'action sociale",
    },
  ];

  beforeEach(() => {
    cy.visit("/");
    cy.login("lion.eljonson@vip.gouv.fr");
    cy.visit("/users/join-organization");

    cy.title().should("include", "Rejoindre une organisation -");
    cy.contains("SIRET de l’organisation que vous représentez").click();
  });

  sirets.forEach(({ siret, type }) => {
    it(type, function () {
      cy.focused().clear().type(siret);
      cy.contains("Enregistrer").click();
      cy.title().should("include", "Rattachement en cours -");
    });
  });
});
