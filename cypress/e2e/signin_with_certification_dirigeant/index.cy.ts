describe("sign-in with a client requiring certification dirigeant", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4000");
    cy.contains("Forcer une connexion par certification dirigeant").click();
  });

  it("should sign-in as the executive of an organization", function () {
    cy.login("certified-franceconnected+dirigeant@yopmail.com");

    cy.title().should("include", "Certification dirigeant -");
    cy.contains("Certifier votre statut");
    cy.contains("Continuer").click();

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

    cy.title().should("include", "Certification dirigeant -");
    cy.contains("Certifier votre statut");
    cy.contains("Continuer").click();

    cy.title().should("include", "Choisir une organisation -");
    cy.getDescribed("Clamart").within(() => {
      cy.contains("certifié").should("not.exist");
    });
    cy.getByLabel("Clamart (choisir cette organisation)").click();

    cy.title().should("include", "Certification impossible -");
    cy.contains("Nous n’arrivons pas à certifier votre compte.");
    cy.contains("Continuer").click();

    cy.title().should("include", "Error");
    cy.contains(
      "AuthorizationResponseError: authorization response from the server is an error",
    );
  });

  it("Jean is not certified for ONEDOES.DRAW.DOUBLEACE", function () {
    cy.login("franceconnected+dirigeant@unipersonnelle.com");

    cy.title().should("include", "Certification dirigeant -");
    cy.contains("Certifier votre statut");
    cy.contains("Continuer").click();

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
    cy.contains(
      "AuthorizationResponseError: authorization response from the server is an error",
    );
  });

  it("should re-FranceConnect expired Douglas Le Gris Duteil as an executive of ONEDOES.DRAW.DOUBLEACE", function () {
    cy.login("outdated-franceconnected+douglasduteil@mail.com");

    cy.title().should("include", "Certification dirigeant -");
    cy.contains("Certifier votre statut");
    cy.getByLabel("S’identifier avec FranceConnect").click();

    cy.title().should("include", "🎭 FranceConnect 🎭");
    cy.contains("Je suis Douglas Le Gris Duteil").click();

    cy.title().should("include", "Rejoindre une organisation");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("82869625200018");
    cy.getByLabel(
      "Organisation correspondante au SIRET donné : Douglas Duteil",
    ).click();

    cy.title().should("include", "Compte certifié -");
    cy.contains("Vous êtes bien certifié !");
    cy.contains("Douglas Le Gris");
    cy.contains("Duteil");
    cy.contains("outdated-franceconnected+douglasduteil@mail.com");
    cy.contains("HyyyperProConnectDev4000");
    cy.contains("Douglas Duteil");
    cy.contains("Compte certifié");
    cy.contains("Continuer").click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/certification-dirigeant"',
    );
  });

  it("should FranceConnect and match Douglas Le Frais as an executive of ONEDOES.DRAW.DOUBLEACE", function () {
    cy.login("fresh+douglasduteil@mail.com");

    cy.title().should("include", "Certification dirigeant -");
    cy.contains("Certifier votre statut");
    cy.getByLabel("S’identifier avec FranceConnect").click();

    cy.title().should("include", "🎭 FranceConnect 🎭");
    cy.contains("Je suis Douglas Le Gris Duteil").click();

    cy.title().should("include", "Rejoindre une organisation");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("82869625200018");
    cy.getByLabel(
      "Organisation correspondante au SIRET donné : Douglas Duteil",
    ).click();

    cy.title().should("include", "Compte certifié -");
    cy.contains("Vous êtes bien certifié !");
    cy.contains("Prénom Douglas Le Gris");
    cy.contains("Nom Duteil");
    cy.contains("Email professionnel fresh+douglasduteil@mail.com");
    cy.contains("Rôle HyyyperProConnectDev4000");
    cy.contains("Organisation Douglas Duteil");
    cy.contains("Statut Compte certifié");
    cy.contains("Continuer").click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/certification-dirigeant"',
    );
  });

  it("should try to re-certify expired certificated FranceConnect user", function () {
    cy.login("outdated-certified-franceconnected+dirigeant@unipersonnelle.com");

    cy.title().should("include", "Certification dirigeant -");
    cy.contains("Certifier votre statut");
    cy.contains("Continuer").click();

    cy.title().should("include", "Choisir une organisation -");
    cy.getByLabel("Clamart (choisir cette organisation)").click();

    cy.title().should("include", "Certification impossible -");
    cy.contains("Nous n’arrivons pas à certifier votre compte.");
    cy.contains("Continuer").click();

    cy.title().should("include", "Error");
    cy.contains(
      "AuthorizationResponseError: authorization response from the server is an error",
    );
  });
});

describe("connected user should go through the certification flow", function () {
  it("with valid FranceConnect user", function () {
    cy.visit("/");
    cy.login("certified-franceconnected+dirigeant@yopmail.com");

    cy.visit("http://localhost:4000");
    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains("Forcer une connexion par certification dirigeant").click();

    cy.title().should("include", "Certification dirigeant - ");
    cy.contains("Continuer").click();

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
});

describe.only("Signup with a client requiring certification dirigeant", () => {
  it("shuold welcome Elia Alvernhe as dirigeant of JEREMIE COOK", () => {
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

    cy.title().should("include", "Renseigner votre identité -");
    cy.seeInField("Prénom", "Elia");
    cy.seeInField("Nom", "Alvernhe");
    cy.seeInField("Numéro de téléphone professionnel", "");
    cy.seeInField("Profession ou rôle au sein de votre organisation", "");
    cy.contains("Profession ou rôle au sein de votre organisation").click();
    cy.focused().type("Dirigeante");
    cy.contains("Valider").click();

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
    cy.contains("Rôle Dirigeante");
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
});
