describe("sign-in with a client requiring certification dirigeant", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4000");
    cy.contains("Forcer une connexion par certification dirigeant").click();
  });

  it("should seed the database once", function () {
    cy.seed();
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

  it("should refuse FranceConnect-ed empolyee of known organization", function () {
    cy.login("franceconnected+employee@yopmail.com");

    cy.title().should("include", "Choisir une organisation -");
    cy.getDescribed("Clamart").within(() => {
      cy.contains("certifié").should("not.exist");
    });
    cy.getByLabel("Clamart (choisir cette organisation)").click();

    cy.title().should("include", "Certification impossible -");
    cy.contains("Nous n’arrivons pas à certifier votre compte.");
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
    cy.contains("Nous n’arrivons pas à certifier votre compte.");
    cy.contains("Continuer").click();

    cy.title().should("include", "Error");
    cy.contains("AuthorizationResponseError");
    cy.contains("login_required");
  });

  it("should re-FranceConnect expired Douglas Duteil as an executive of ONEDOES.DRAW.DOUBLEACE", function () {
    cy.login("outdated-franceconnected+douglasduteil@mail.com");

    cy.title().should("include", "Certification dirigeant -");
    cy.contains("Certifier votre statut");
    cy.getByLabel("S’identifier avec FranceConnect").click();

    cy.title().should("include", "🎭 FranceConnect 🎭");
    cy.contains("Je suis Douglas Duteil").click();

    cy.title().should("include", "Rejoindre une organisation");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("82869625200018");
    cy.getByLabel(
      "Organisation correspondante au SIRET donné : Douglas Duteil",
    ).click();

    cy.title().should("include", "Compte certifié -");
    cy.contains("Vous êtes bien certifié !");
    cy.contains("Prénom Douglas");
    cy.contains("Nom Duteil");
    cy.contains(
      "Email professionnel outdated-franceconnected+douglasduteil@mail.com",
    );
    cy.contains("Rôle HyyyperProConnectDev4000");
    cy.contains("Organisation Douglas Duteil");
    cy.contains("Statut Compte certifié");
    cy.contains("Continuer").click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/certification-dirigeant"',
    );
  });

  it("should welcome Karima Aknine as dirigeant of BATI-SEREIN", () => {
    cy.login("karima.aknine@yopmail.com");

    cy.title().should("include", "Certification dirigeant -");
    cy.contains("Certifier votre statut");
    cy.getByLabel("S’identifier avec FranceConnect").click();

    cy.title().should("include", "🎭 FranceConnect 🎭");
    cy.contains("Je suis Karima Aknine").click();

    cy.title().should("include", "Rejoindre une organisation");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("51025277800012");
    cy.getByLabel(
      "Organisation correspondante au SIRET donné : Bati-serein",
    ).click();

    cy.title().should("include", "Compte certifié -");
    cy.contains("Vous êtes bien certifié !");
    cy.contains("Prénom Karima");
    cy.contains("Nom Aknine");
    cy.contains("Email professionnel karima.aknine@yopmail.com");
    cy.contains("Rôle Grande cheffe de BATI-SEREIN");
    cy.contains("Organisation Bati-serein");
    cy.contains("Statut Compte certifié");
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
    cy.contains("Vous êtes bien certifié !");
    cy.contains("Prénom Ulysse");
    cy.contains("Nom Tosi");
    cy.contains("Email professionnel ulysse.tosi@yopmail.com");
    cy.contains("Rôle Grand chef de DANONE et PAPILLON");
    cy.contains("Organisation Papillon");
    cy.contains("Statut Compte certifié");
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
    cy.contains("Vous êtes bien certifié !");
    cy.contains("Prénom Stevens");
    cy.contains("Nom Cheron");
    cy.contains("Email professionnel stevens.cheron@yopmail.com");
    cy.contains("Rôle Grand chef de HERISSON et SURICATE");
    cy.contains("Organisation Suricate - The kilberry");
    cy.contains("Statut Compte certifié");
    cy.contains("Continuer").click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/certification-dirigeant"',
    );
    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains('"siret": "52169091700021",');
    cy.contains('"label": "Suricate - The kilberry"');
  });

  it("should try to re-certify expired certificated FranceConnect user", function () {
    cy.login("outdated-certified-franceconnected+dirigeant@unipersonnelle.com");

    cy.title().should("include", "Choisir une organisation -");
    cy.getByLabel("Clamart (choisir cette organisation)").click();

    cy.title().should("include", "Certification impossible -");
    cy.contains("Nous n’arrivons pas à certifier votre compte.");
    cy.contains("Continuer").click();

    cy.title().should("include", "Error");
    cy.contains("AuthorizationResponseError");
    cy.contains("login_required");
  });
});

describe("connected user should go through the certification flow", function () {
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

    cy.title().should("include", "Certification dirigeant - ");
    cy.contains("Certifier votre statut");
    cy.getByLabel("S’identifier avec FranceConnect").click();

    cy.title().should("include", "🎭 FranceConnect 🎭");
    cy.contains("Je suis Marie Héricart").click();

    cy.getDescribed("Clamart").within(() => {
      cy.contains("certifié").should("not.exist");
    });
  });

  it("with an organization pre-selected", () => {
    cy.visit("http://localhost:4000");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      claims: { id_token: { acr: {} } },
    }));
    cy.get("button#custom-connection").click({ force: true });

    cy.login("certified-franceconnected+dirigeant@yopmail.com");

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains('"job": "Certified Single Dirigeant",');
    cy.contains('"label": "Clamart",');
    cy.contains('"acr": "https://proconnect.gouv.fr/assurance/self-asserted"');

    cy.visit("http://localhost:4000");
    cy.contains("Forcer une connexion par certification dirigeant").click();
    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/certification-dirigeant"',
    );
  });
});

describe("Signup with a client requiring certification dirigeant", () => {
  it("should welcome Elia Alvernhe as dirigeant of JEREMIE COOK", () => {
    cy.visit("http://localhost:4000");
    cy.contains("Forcer une connexion par certification dirigeant").click();

    cy.title().should("include", "S'inscrire ou se connecter - ");
    cy.contains("Email professionnel").click();
    cy.focused().type("elia.alvernhe@yopmail.com");
    cy.contains("Valider").click();

    cy.title().should("include", "Choisir votre mot de passe - ");
    cy.contains("Mot de passe").click();
    cy.contains("Recevoir un lien d’identification").click();
    cy.maildevGetMessageBySubject("Lien de connexion à ProConnect").then(
      (email) => {
        cy.maildevVisitMessageById(email.id);
        cy.contains(
          "Vous avez demandé un lien d'identification à ProConnect. Utilisez le bouton ci-dessous pour vous connecter instantanément.",
        );
        cy.contains("Se connecter").click();
        cy.maildevDeleteMessageById(email.id);
      },
    );

    cy.title().should("include", "Certification dirigeant -");
    cy.getByLabel("S’identifier avec FranceConnect").click();

    cy.title().should("include", "Connexion 🎭 FranceConnect 🎭");
    cy.contains("Je suis Elia Alvernhe").click();

    cy.title().should("include", "Déconnexion 🎭 FranceConnect 🎭");

    cy.title().should("include", "Rejoindre une organisation - ");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("49430870300052");
    cy.getByLabel(
      "Organisation correspondante au SIRET donné : Jeremie Cook",
    ).click();

    cy.title().should("include", "Compte certifié - ");
    cy.contains("Vous êtes bien certifié !");
    cy.contains("Prénom Elia");
    cy.contains("Nom Alvernhe");
    cy.contains("Email professionnel elia.alvernhe@yopmail.com");
    cy.contains("Organisation Jeremie Cook");
    cy.contains("Statut Compte certifié");
    cy.contains("Continuer").click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/certification-dirigeant"',
    );
    cy.contains('"email": "elia.alvernhe@yopmail.com",');
    cy.contains('"siret": "49430870300052",');
    cy.contains('"label": "Jeremie Cook",');
  });

  it("should no allow Adrian Volckaert to represent Danone", () => {
    cy.visit("http://localhost:4000");
    cy.contains("Forcer une connexion par certification dirigeant").click();

    cy.title().should("include", "S'inscrire ou se connecter - ");
    cy.contains("Email professionnel").click();
    cy.focused().type("adrian.volckaert@yopmail.com");
    cy.contains("Valider").click();

    cy.title().should("include", "Choisir votre mot de passe - ");
    cy.contains("Mot de passe").click();
    cy.contains("Recevoir un lien d’identification").click();
    cy.maildevGetMessageBySubject("Lien de connexion à ProConnect").then(
      (email) => {
        cy.maildevVisitMessageById(email.id);
        cy.contains(
          "Vous avez demandé un lien d'identification à ProConnect. Utilisez le bouton ci-dessous pour vous connecter instantanément.",
        );
        cy.contains("Se connecter").click();
        cy.maildevDeleteMessageById(email.id);
      },
    );

    cy.title().should("include", "Certification dirigeant -");
    cy.getByLabel("S’identifier avec FranceConnect").click();

    cy.title().should("include", "Connexion 🎭 FranceConnect 🎭");
    cy.contains("Je suis Adrian Volckaert").click();

    cy.title().should("include", "Rejoindre une organisation - ");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("55203253400646");
    cy.getByLabel(
      "Organisation correspondante au SIRET donné : Danone",
    ).click();

    cy.title().should("include", "Certification impossible -");
    cy.contains("Nous n’arrivons pas à certifier votre compte.");
    cy.contains("Continuer").click();

    cy.title().should("include", "Error");
    cy.contains("AuthorizationResponseError");
    cy.contains("login_required");
  });

  it("should welcome Angela Claire Louise DUBOIS as dirigeant of Angela GNESOTTO", () => {
    cy.visit("http://localhost:4000");
    cy.contains("Forcer une connexion par certification dirigeant").click();

    cy.title().should("include", "S'inscrire ou se connecter - ");
    cy.contains("Email professionnel").click();
    cy.focused().type("wossewodda-3728@yopmail.com");
    cy.contains("Valider").click();

    cy.title().should("include", "Choisir votre mot de passe - ");
    cy.contains("Mot de passe").click();
    cy.contains("Recevoir un lien d’identification").click();
    cy.maildevGetMessageBySubject("Lien de connexion à ProConnect").then(
      (email) => {
        cy.maildevVisitMessageById(email.id);
        cy.contains(
          "Vous avez demandé un lien d'identification à ProConnect. Utilisez le bouton ci-dessous pour vous connecter instantanément.",
        );
        cy.contains("Se connecter").click();
        cy.maildevDeleteMessageById(email.id);
      },
    );

    cy.title().should("include", "Certification dirigeant -");
    cy.getByLabel("S’identifier avec FranceConnect").click();

    cy.title().should("include", "Connexion 🎭 FranceConnect 🎭");
    cy.contains("Je suis Angela Claire Louise DUBOIS").click();

    cy.title().should("include", "Déconnexion 🎭 FranceConnect 🎭");

    cy.title().should("include", "Rejoindre une organisation - ");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("83832482000011");
    cy.getByLabel(
      "Organisation correspondante au SIRET donné : Angela Gnesotto",
    ).click();

    cy.title().should("include", "Compte certifié - ");
    cy.contains("Vous êtes bien certifié !");
    cy.contains("Prénom Angela Claire Louise");
    cy.contains("Nom DUBOIS");
    cy.contains("Email professionnel wossewodda-3728@yopmail.com");
    cy.contains("Organisation Angela Gnesotto");
    cy.contains("Statut Compte certifié");
    cy.contains("Continuer").click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/certification-dirigeant"',
    );
    cy.contains('"email": "wossewodda-3728@yopmail.com",');
    cy.contains('"siret": "83832482000011",');
    cy.contains('"label": "Angela Gnesotto",');
  });
});
