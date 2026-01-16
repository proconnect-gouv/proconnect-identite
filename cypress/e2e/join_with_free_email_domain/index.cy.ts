//

it("should seed the database once", function () {
  cy.seed();
});

describe("join with free email domain", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.login("lion.eljonson@yopmail.com");
    cy.visit("/users/join-organization");

    cy.title().should("include", "Rejoindre une organisation -");
    cy.contains("SIRET de l’organisation que vous représentez").click();
  });

  it("entreprise unipersonnelle", function () {
    cy.focused().clear().type("82869625200018");

    cy.contains("Enregistrer").click();

    cy.title().should("include", "Compte créé -");
    cy.contains("Compte créé ! 🎊");
  });

  it("collectivité territoriale", function () {
    cy.focused().clear().type("21340126800130");

    cy.contains("Enregistrer").click();

    cy.title().should("include", "Confirmer le rattachement -");
    cy.contains(
      "🕵️ Vous souhaitez rejoindre Commune de lamalou-les-bains - Mairie avec l’adresse email lion.eljonson@yopmail.com.",
    );
  });
});

//

describe("restrict access for", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.login("lion.eljonson@yopmail.com");
    cy.visit("/users/join-organization");

    cy.title().should("include", "Rejoindre une organisation -");
    cy.contains("SIRET de l’organisation que vous représentez").click();
  });

  it("Service déconcentré de l'État à compétence (inter) départementale", function () {
    cy.focused().clear().type("13003004200019");

    cy.contains("Enregistrer").click();

    cy.title().should("include", "Email non autorisé -");
    cy.contains("Email non autorisé");
    cy.contains(
      "L’accès à ce site est limité aux agentes et agents possédant une adresse email d’une administration publique.",
    );
  });

  it("Établissement public national à caractère administratif", function () {
    cy.focused().clear().type("13003004200019");

    cy.contains("Enregistrer").click();

    cy.title().should("include", "Email non autorisé -");
    cy.contains("Email non autorisé");
    cy.contains(
      "L’accès à ce site est limité aux agentes et agents possédant une adresse email d’une administration publique.",
    );
  });

  it("Samu-social de paris (18750901300012)", function () {
    cy.focused().clear().type("18750901300012");

    cy.contains("Enregistrer").click();

    cy.title().should("include", "Email non autorisé -");
    cy.contains("Email non autorisé");
    cy.contains(
      "L’accès à ce site est limité aux agentes et agents possédant une adresse email d’une administration publique.",
    );
  });

  it("Ministère (7113)", function () {
    cy.focused().clear().type("11009001600053");

    cy.contains("Enregistrer").click();

    cy.title().should("include", "Email non autorisé -");
    cy.contains("Email non autorisé");
    cy.contains(
      "L’accès à ce site est limité aux agentes et agents possédant une adresse email d’une administration publique.",
    );
  });

  it("Service central d'un ministère (7120)", function () {
    cy.focused().clear().type("13002526500013");

    cy.contains("Enregistrer").click();

    cy.title().should("include", "Email non autorisé -");
    cy.contains("Email non autorisé");
    cy.contains(
      "L’accès à ce site est limité aux agentes et agents possédant une adresse email d’une administration publique.",
    );
  });

  it("Service du ministère de la Défense (7150)", function () {
    cy.focused().clear().type("15700001900461");

    cy.contains("Enregistrer").click();

    cy.title().should("include", "Email non autorisé -");
    cy.contains("Email non autorisé");
    cy.contains(
      "L’accès à ce site est limité aux agentes et agents possédant une adresse email d’une administration publique.",
    );
  });

  it("Etablissement public administratif, cercle et foyer dans les armées (7450)", function () {
    cy.focused().clear().type("20004542500085");

    cy.contains("Enregistrer").click();

    cy.title().should("include", "Email non autorisé -");
    cy.contains("Email non autorisé");
    cy.contains(
      "L’accès à ce site est limité aux agentes et agents possédant une adresse email d’une administration publique.",
    );
  });

  it("Établissement public national à caractère industriel ou commercial doté d'un comptable public (4110)", function () {
    cy.focused().clear().type("38529030900454");

    cy.contains("Enregistrer").click();

    cy.title().should("include", "Email non autorisé -");
    cy.contains("Email non autorisé");
    cy.contains(
      "L’accès à ce site est limité aux agentes et agents possédant une adresse email d’une administration publique.",
    );
  });

  it("ChorusPro", function () {
    cy.focused().clear().type("11000201100044");

    cy.contains("Enregistrer").click();

    cy.title().should("include", "Accès restreint - ProConnect");
    cy.contains("Accès restreint");
    cy.contains(
      "Seules les adresses finances.gouv.fr peuvent rejoindre l’organisation « Services de l'etat pour la facturation electronique - Destination etat via chorus pro ».",
    );
    cy.contains(
      "Soyez sûrs d’utiliser le SIRET de l’organisation pour laquelle vous travaillez.",
    );
  });
});

describe("join syndicat communal", () => {
  const sirets = [
    {
      code: "20000713600019",
      type: "Syndicat intercommunal à vocation unique (SIVU)",
    },
    {
      code: "20008142000024",
      type: "Syndicat intercommunal à vocation multiple (SIVOM)",
    },
    {
      code: "24590007100029",
      type: "Syndicat intercommunal à vocation multiple (SIVOM)",
    },
    {
      code: "25280033900019",
      type: "Syndicat intercommunal à vocation multiple (SIVOM)",
    },
    { code: "25320098400016", type: "Syndicat mixte fermé" },
    {
      code: "25800404300026",
      type: "Syndicat intercommunal à vocation unique (SIVU)",
    },
    {
      code: "26090012100013",
      type: "Établissement public local social et médico-social",
    },
    {
      code: "26290359400014",
      type: "Centre communal d'action sociale",
    },
    {
      code: "13001270100020",
      type: "Groupement de coopération sanitaire à gestion publique",
    },
  ];

  beforeEach(() => {
    cy.visit("/");
    cy.login("lion.eljonson@yopmail.com");
    cy.visit("/users/join-organization");

    cy.title().should("include", "Rejoindre une organisation -");
    cy.contains("SIRET de l’organisation que vous représentez").click();
  });

  sirets.forEach(({ code, type }) => {
    it(type, function () {
      cy.focused().clear().type(code);
      cy.contains("Enregistrer").click();
      cy.contains("Demande en cours");
      cy.contains(
        "Nous vérifions votre lien à l’organisation, vous recevrez un email de confirmation dès que votre compte sera validé.",
      );
    });
  });
});
