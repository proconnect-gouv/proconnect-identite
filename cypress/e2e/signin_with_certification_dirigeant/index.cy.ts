describe("sign-in with a client requiring certification dirigeant", () => {
  before(function () {
    cy.visit("/");
    cy.seed();
  });

  beforeEach(() => {
    cy.origin("http://localhost:4000", function () {
      cy.visit("/");
      cy.contains("Forcer une connexion par certification dirigeant").click();
    });
  });

  it("should sign-in as the executive of an organization", function () {
    cy.login("certified-franceconnected+dirigeant@yopmail.com");

    cy.title().should("include", "Choisir une organisation -");
    cy.getDescribed("Clamart").within(() => {
      cy.contains("certifié");
    });
    cy.getByLabel("Clamart (choisir cette organisation)").click();

    //
    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains('"job": "Certified Single Dirigeant",');
    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/certification-dirigeant"',
    );
  });

  it("should refuse FranceConnect-ed employee of known organization", function () {
    cy.login("franceconnected+employee@yopmail.com");

    cy.title().should("include", "Choisir une organisation -");
    cy.getDescribed("Clamart").within(() => {
      cy.contains("certifié").should("not.exist");
    });
    cy.getByLabel("Clamart (choisir cette organisation)").click();

    cy.title().should("include", "Certification impossible -");
    cy.contains("Identité non trouvée ⚠️");
    cy.contains("Continuer").click();

    cy.title().should("include", "Error");
    cy.contains("AuthorizationResponseError");
    cy.contains("login_required");
  });

  it("Jean is not certified for ONEDOES.DRAW.DOUBLEACE", function () {
    cy.login("franceconnected+dirigeant@unipersonnelle.com");

    cy.title().should("include", "Rejoindre une organisation -");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("82869625200018");
    cy.getByLabel(
      "Organisation correspondante au SIRET donné : Douglas Duteil",
    ).click();

    cy.title().should("include", "Certification impossible -");
    cy.contains("Identité non trouvée ⚠️");
    cy.contains("Continuer").click();

    cy.title().should("include", "Error");
    cy.contains("AuthorizationResponseError");
    cy.contains("login_required");
  });

  it("should re-FranceConnect expired Douglas Duteil as an executive of ONEDOES.DRAW.DOUBLEACE", function () {
    cy.login("outdated-franceconnected+douglasduteil@mail.com");

    cy.title().should("include", "Rejoindre une organisation");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("82869625200018");
    cy.getByLabel(
      "Organisation correspondante au SIRET donné : Douglas Duteil",
    ).click();

    cy.title().should("include", "Certification dirigeant -");
    cy.contains("Certifier votre statut");
    cy.getByLabel("S’identifier avec FranceConnect").click();

    cy.title().should("include", "🎭 FranceConnect 🎭");
    cy.contains("Je suis Douglas Duteil").click();

    cy.title().should("include", "Compte certifié -");
    cy.contains("Statut certifié 🎊");
    cy.contains("Prénom Douglas");
    cy.contains("Nom Dulac");
    cy.contains(
      "Email professionnel outdated-franceconnected+douglasduteil@mail.com",
    );
    cy.contains("Continuer").click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/certification-dirigeant"',
    );
  });

  it("should welcome Karima Aknine as dirigeant of BATI-SEREIN", () => {
    cy.login("karima.aknine@yopmail.com");

    cy.title().should("include", "Rejoindre une organisation");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("51025277800012");
    cy.getByLabel(
      "Organisation correspondante au SIRET donné : Bati-serein",
    ).click();

    cy.title().should("include", "Certification dirigeant -");
    cy.contains("Certifier votre statut");
    cy.getByLabel("S’identifier avec FranceConnect").click();

    cy.title().should("include", "🎭 FranceConnect 🎭");
    cy.contains("Je suis Karima Aknine").click();

    cy.title().should("include", "Compte certifié -");
    cy.contains("Statut certifié 🎊");
    cy.contains("Prénom Karima");
    cy.contains("Nom Aknine");
    cy.contains("Email professionnel karima.aknine@yopmail.com");
    cy.contains("Continuer").click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/certification-dirigeant"',
    );
  });

  it("should welcome Ulysse Tosi as dirigeant of PAPILLON and DANONE", () => {
    cy.login("ulysse.tosi@yopmail.com");

    cy.title().should("include", "Choisir une organisation -");
    cy.getDescribed("Danone").within(() => {
      cy.contains("certifié");
    });
    cy.contains("Je veux représenter une autre organisation").click();

    cy.title().should("include", "Rejoindre une organisation");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("39234600300198");
    cy.getByLabel(
      "Organisation correspondante au SIRET donné : Papillon",
    ).click();

    cy.title().should("include", "Compte certifié -");
    cy.contains("Statut certifié 🎊");
    cy.contains("Prénom Ulysse");
    cy.contains("Nom Tosi");
    cy.contains("Email professionnel ulysse.tosi@yopmail.com");
    cy.contains("Continuer").click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/certification-dirigeant"',
    );
    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains('"siret": "39234600300198",');
    cy.contains('"label": "Papillon"');
  });

  it("should welcome Stevens Cheron as dirigeant of SURICATE", () => {
    cy.login("stevens.cheron@yopmail.com");

    cy.title().should("include", "Choisir une organisation -");
    cy.getDescribed("Herisson").within(() => {
      cy.contains("certifié");
    });
    cy.getDescribed("Suricate - The kilberry").within(() => {
      cy.contains("certifié").should("not.exist");
    });
    cy.getByLabel(
      "Suricate - The kilberry (choisir cette organisation)",
    ).click();

    cy.title().should("include", "Compte certifié - ");
    cy.contains("Statut certifié 🎊");
    cy.contains("Prénom Stevens");
    cy.contains("Nom Cheron");
    cy.contains("Email professionnel stevens.cheron@yopmail.com");
    cy.contains("Continuer").click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/certification-dirigeant"',
    );
    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains('"siret": "52169091700021",');
    cy.contains('"label": "Suricate - The kilberry"');
  });

  it("should ask for FranceConnect after org selection", () => {
    cy.login("no-franceconnect+already-in-org@yopmail.com");

    cy.title().should("include", "Choisir une organisation -");
    cy.getByLabel("Herisson (choisir cette organisation)").click();

    cy.title().should("include", "Certification dirigeant - ");
    cy.contains("Certifier votre statut");
    cy.contains("S’identifier avec FranceConnect");
  });

  it("should try to re-certify a dirigeant after certification expiration", function () {
    cy.login("outdated-certification+douglasduteil@mail.com");

    cy.title().should("include", "Choisir une organisation -");
    cy.getByLabel("Douglas Duteil (choisir cette organisation)").click();

    cy.title().should("include", "Compte certifié -");
    cy.contains("Statut certifié 🎊");
    cy.contains("Prénom Douglas Le Rouge");
    cy.contains("Nom Duteil");
    cy.contains(
      "Email professionnel outdated-certification+douglasduteil@mail.com",
    );
    cy.contains("Continuer").click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/certification-dirigeant"',
    );
  });

  it("should try to re-certify an ex-dirigeant and fail", function () {
    cy.login("outdated-certification+ex-dirigeant@unipersonnelle.com");

    cy.title().should("include", "Choisir une organisation -");
    cy.getByLabel("Clamart (choisir cette organisation)").click();

    cy.title().should("include", "Certification impossible -");
    cy.contains("Identité non trouvée ⚠️");
    cy.contains("Continuer").click();

    cy.title().should("include", "Error");
    cy.contains("AuthorizationResponseError");
    cy.contains("login_required");
    cy.contains("Certification dirigeant: no match error");
  });
});

describe("connected user should go through the certification flow", function () {
  before(cy.seed);

  it("with valid FranceConnect user", function () {
    cy.visit("/");
    cy.login("certified-franceconnected+dirigeant@yopmail.com");

    cy.visit("http://localhost:4000");
    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains("Forcer une connexion par certification dirigeant").click();

    cy.title().should("include", "Choisir une organisation -");
    cy.getDescribed("Clamart").within(() => {
      cy.contains("certifié");
    });
  });

  it("with outdated FranceConnect user", function () {
    cy.visit("/");
    cy.login("outdated-franceconnected+dirigeant@yopmail.com");

    cy.visit("http://localhost:4000");
    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains("Forcer une connexion par certification dirigeant").click();

    cy.getDescribed("Clamart").within(() => {
      cy.contains("certifié").should("exist");
    });
    cy.getByLabel("Clamart (choisir cette organisation)").click();

    cy.title().should("include", "Certification dirigeant - ");
    cy.contains("Certifier votre statut");
    cy.getByLabel("S’identifier avec FranceConnect").click();

    cy.title().should("include", "🎭 FranceConnect 🎭");
    cy.contains("Je suis Marie Héricart").click();
  });
});
