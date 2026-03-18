//

describe("join with free email domain", () => {
  before(cy.seed);

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
    cy.contains("Compte créé 🎊");
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
  before(cy.seed);

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
  before(cy.seed);

  const organizations = [
    {
      siret: "20000713600019",
      categorie_juridique: "Syndicat intercommunal à vocation unique (SIVU)",
    },
    {
      siret: "20008142000024",
      categorie_juridique: "Syndicat intercommunal à vocation multiple (SIVOM)",
    },
    {
      siret: "24590007100029",
      categorie_juridique: "Syndicat intercommunal à vocation multiple (SIVOM)",
    },
    {
      siret: "25280033900019",
      categorie_juridique: "Syndicat intercommunal à vocation multiple (SIVOM)",
    },
    { siret: "25320098400016", categorie_juridique: "Syndicat mixte fermé" },
    {
      siret: "25800404300026",
      categorie_juridique: "Syndicat intercommunal à vocation unique (SIVU)",
    },
    {
      siret: "26090012100013",
      categorie_juridique: "Établissement public local social et médico-social",
    },
    {
      siret: "26290359400014",
      categorie_juridique: "Centre communal d'action sociale",
    },
    {
      siret: "13001270100020",
      categorie_juridique:
        "Groupement de coopération sanitaire à gestion publique",
    },
  ];

  beforeEach(() => {
    cy.visit("/");
    cy.login("lion.eljonson@yopmail.com");
    cy.visit("/users/join-organization");

    cy.title().should("include", "Rejoindre une organisation -");
    cy.contains("SIRET de l’organisation que vous représentez").click();
  });

  organizations.forEach(({ siret, categorie_juridique }) => {
    it(categorie_juridique, function () {
      cy.focused().clear().type(siret);
      cy.contains("Enregistrer").click();
      cy.contains("Demande en cours");
    });
  });
});

describe("join small association", () => {
  before(cy.seed);

  const organizations = [
    {
      siret: "84226400400016",
      categorie_juridique:
        "Association de droit local (Bas-Rhin, Haut-Rhin et Moselle)",
    },
  ];
  beforeEach(() => {
    cy.visit("/");
    cy.login("lion.eljonson@yopmail.com");
    cy.visit("/users/join-organization");

    cy.title().should("include", "Rejoindre une organisation -");
    cy.contains("SIRET de l’organisation que vous représentez").click();
  });

  organizations.forEach(({ siret, categorie_juridique }) => {
    it(categorie_juridique, function () {
      cy.focused().clear().type(siret);
      cy.contains("Enregistrer").click();
      cy.contains("Compte créé");
    });
  });
});
