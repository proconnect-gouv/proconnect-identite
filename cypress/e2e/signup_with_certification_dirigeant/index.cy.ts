// Some of these tests are described in this doc: https://docs.numerique.gouv.fr/docs/ba263c29-5478-4ee0-b6f8-004b61fe6433/

describe("Signup with a client requiring certification dirigeant", () => {
  before(cy.seed);

  beforeEach(() => {
    cy.visit("/");
    cy.origin("http://localhost:4000", () => {
      cy.visit("/");
      cy.contains("Forcer une connexion par certification dirigeant").click();
    });
  });

  it("should welcome Elia Alvernhe as dirigeant of JEREMIE COOK", () => {
    cy.title().should("include", "S'inscrire ou se connecter - ");
    cy.magicLinkLogin("elia.alvernhe@yopmail.com");

    cy.title().should("include", "Rejoindre une organisation - ");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("49430870300052");
    cy.getByLabel(
      "Organisation correspondante au SIRET donné : Jeremie Cook",
    ).click();

    cy.title().should("include", "Certification dirigeant -");
    cy.getByLabel("S’identifier avec FranceConnect").click();

    cy.title().should("include", "Connexion 🎭 FranceConnect 🎭");
    cy.contains("Je suis Elia Alvernhe").click();

    cy.title().should("include", "Déconnexion 🎭 FranceConnect 🎭");

    cy.title().should("include", "Compte certifié - ");
    cy.contains("Statut certifié 🎊");
    cy.contains("Prénom Elia");
    cy.contains("Nom Alvernhe");
    cy.contains("Email professionnel elia.alvernhe@yopmail.com");
    cy.contains("Continuer").click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/certification-dirigeant"',
    );
    cy.contains('"email": "elia.alvernhe@yopmail.com",');
    cy.contains('"siret": "49430870300052",');
    cy.contains('"label": "Jeremie Cook",');
  });

  it("should welcome Ulysse Tosi as dirigeant of Danone", () => {
    cy.title().should("include", "S'inscrire ou se connecter - ");
    cy.magicLinkLogin("ulysse.tosi@yopmail.com");

    cy.title().should("include", "Rejoindre une organisation - ");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("55203253400646");
    cy.getByLabel(
      "Organisation correspondante au SIRET donné : Danone",
    ).click();

    cy.title().should("include", "Certification dirigeant -");
    cy.getByLabel("S’identifier avec FranceConnect").click();

    cy.title().should("include", "Connexion 🎭 FranceConnect 🎭");
    cy.contains("Je suis Ulysse Tosi").click();

    cy.title().should("include", "Déconnexion 🎭 FranceConnect 🎭");

    cy.title().should("include", "Compte certifié - ");
    cy.contains("Statut certifié 🎊");
    cy.contains("Prénom Ulysse");
    cy.contains("Nom Tosi");
    cy.contains("Continuer").click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/certification-dirigeant"',
    );
    cy.contains('"email": "ulysse.tosi@yopmail.com",');
    cy.contains('"siret": "55203253400646",');
    cy.contains('"label": "Danone",');
  });

  it("should welcome Angela Claire Louise DUBOIS as dirigeant of Angela GNESOTTO", () => {
    cy.title().should("include", "S'inscrire ou se connecter - ");
    cy.magicLinkLogin("angela.83832482000011@yopmail.com");
    cy.title().should("include", "Rejoindre une organisation - ");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("83832482000011");
    cy.getByLabel(
      "Organisation correspondante au SIRET donné : Angela Gnesotto",
    ).click();

    cy.title().should("include", "Certification dirigeant -");
    cy.getByLabel("S’identifier avec FranceConnect").click();

    cy.title().should("include", "Connexion 🎭 FranceConnect 🎭");
    cy.contains("Je suis Angela Claire Louise DUBOIS").click();

    cy.title().should("include", "Déconnexion 🎭 FranceConnect 🎭");

    cy.title().should("include", "Compte certifié - ");
    cy.contains("Statut certifié 🎊");
    cy.contains("Prénom Angela Claire Louise");
    cy.contains("Nom DUBOIS");
    cy.contains("Email professionnel angela.83832482000011@yopmail.com");
    cy.contains("Continuer").click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/certification-dirigeant"',
    );
    cy.contains('"email": "angela.83832482000011@yopmail.com",');
    cy.contains('"siret": "83832482000011",');
    cy.contains('"label": "Angela Gnesotto",');
  });

  it("should come back to the certification dirigeant page if FranceConnect access denied", function () {
    cy.title().should("include", "S'inscrire ou se connecter - ");
    cy.magicLinkLogin("jean.michel@yopmail.com");

    cy.title().should("include", "Rejoindre une organisation - ");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("83832482000011");
    cy.getByLabel(
      "Organisation correspondante au SIRET donné : Angela Gnesotto",
    ).click();

    cy.title().should("include", "Certification dirigeant -");
    cy.getByLabel("S’identifier avec FranceConnect").click();

    cy.title().should("include", "Connexion 🎭 FranceConnect 🎭");
    cy.contains("Revenir sur votre fournisseur de service").click();

    cy.title().should("include", "Certification dirigeant -");
    cy.contains(
      "L'authentification FranceConnect a échoué. Veuillez réessayer.",
    );
  });
});

describe("Signup on each organizations of the same siren", () => {
  before(() => {
    cy.visit("/");
    cy.seed();
  });

  [
    { siret: "80761229600036" },
    { siret: "80761229600044" },
    { siret: "80761229600051" },
    { siret: "80761229600069" },
  ].forEach(({ siret }) => {
    it(`should welcome Angela Claire Louise DUBOIS as dirigeant of Thunnus thynnus iii (${siret})`, () => {
      cy.origin("http://localhost:4000", () => {
        cy.visit("/");
        cy.contains("Forcer une connexion par certification dirigeant").click();
      });

      cy.visit("/");
      cy.title().should("include", "S'inscrire ou se connecter - ");
      cy.magicLinkLogin(`angela.${siret}@yopmail.com`);

      cy.title().should("include", "Rejoindre une organisation - ");
      cy.contains("SIRET de l’organisation que vous représentez").click();
      cy.focused().clear().type(siret);
      cy.getByLabel(
        "Organisation correspondante au SIRET donné : Thunnus thynnus iii",
      ).click();

      cy.title().should("include", "Certification dirigeant -");
      cy.getByLabel("S’identifier avec FranceConnect").click();

      cy.title().should("include", "Connexion 🎭 FranceConnect 🎭");
      cy.contains("Je suis Angela Claire Louise DUBOIS").click();

      cy.title().should("include", "Déconnexion 🎭 FranceConnect 🎭");

      cy.title().should("include", "Compte certifié - ");
      cy.contains("Statut certifié 🎊");
      cy.contains("Prénom Angela Claire Louise");
      cy.contains("Nom DUBOIS");
      cy.contains(`Email professionnel angela.${siret}@yopmail.com`);
      cy.contains("Continuer").click();

      cy.title().should("equal", "standard-client - ProConnect");
      cy.contains(
        '"acr": "https://proconnect.gouv.fr/assurance/certification-dirigeant"',
      );
      cy.contains(`"email": "angela.${siret}@yopmail.com",`);
      cy.contains(`"siret": "${siret}",`);
      cy.contains('"label": "Thunnus thynnus iii",');
    });
  });
});

describe("❎ Bad match", () => {
  beforeEach(() => {
    cy.seed();
    cy.origin("http://localhost:4000", () => {
      cy.visit("/");
      cy.contains("Forcer une connexion par certification dirigeant").click();
    });
  });

  it("Adrian Volckaert is not a dirigeant of DINUM", () => {
    cy.title().should("include", "S'inscrire ou se connecter - ");
    cy.magicLinkLogin("adrian.volckaert@yopmail.com");

    cy.title().should("include", "Rejoindre une organisation - ");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("13002526500013");
    cy.getByLabel(
      "Organisation correspondante au SIRET donné : Direction interministerielle du numerique (DINUM)",
    ).click();

    cy.title().should("include", "Certification dirigeant -");
    cy.getByLabel("S’identifier avec FranceConnect").click();

    cy.title().should("include", "Connexion 🎭 FranceConnect 🎭");
    cy.contains("Je suis Adrian Volckaert").click();

    cy.title().should("include", "Certification impossible -");
    cy.contains(
      "La nature juridique de votre organisation n’est pas couverte par la certification ProConnect.",
    );
    cy.contains("Continuer sur le service").click();

    cy.title().should("include", "Error");
    cy.contains("AuthorizationResponseError");
    cy.contains("login_required");
  });

  it("Adrian Volckaert is not a dirigeant of Danone", () => {
    cy.title().should("include", "S'inscrire ou se connecter - ");
    cy.magicLinkLogin("adrian.volckaert@yopmail.com");

    cy.title().should("include", "Rejoindre une organisation - ");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("55203253400646");
    cy.getByLabel(
      "Organisation correspondante au SIRET donné : Danone",
    ).click();

    cy.title().should("include", "Certification dirigeant -");
    cy.getByLabel("S’identifier avec FranceConnect").click();

    cy.title().should("include", "Connexion 🎭 FranceConnect 🎭");
    cy.contains("Je suis Adrian Volckaert").click();

    cy.title().should("include", "Certification impossible -");
    cy.contains("Identité non trouvée ⚠️");
    cy.contains("Continuer").click();

    cy.title().should("include", "Error");
    cy.contains("AuthorizationResponseError");
    cy.contains("login_required");
  });

  it("Adrian Volckaert maybe a dirigeant of Herisson", () => {
    cy.title().should("include", "S'inscrire ou se connecter - ");
    cy.magicLinkLogin("adrian.volckaert@yopmail.com");

    cy.title().should("include", "Rejoindre une organisation - ");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().clear().type("79271377800019");
    cy.getByLabel(
      "Organisation correspondante au SIRET donné : Herisson",
    ).click();

    cy.title().should("include", "Certification dirigeant -");
    cy.getByLabel("S’identifier avec FranceConnect").click();

    cy.title().should("include", "Connexion 🎭 FranceConnect 🎭");
    cy.contains("Je suis Adrian Volckaert").click();

    cy.title().should("include", "Certification impossible -");
    cy.contains("Impossible de vous certifier ⚠️");
    cy.contains(
      "Des discordances ont été détectées entre votre identité FranceConnect (affichée ici) et celle connue du Registre National des Entreprises pour Herisson.",
    );

    cy.contains("Vérifier sur l’Annuaire des Entreprises");
    cy.contains("Comment corriger les données ?");

    cy.contains("Continuer").click();

    cy.title().should("include", "Error");
    cy.contains("AuthorizationResponseError");
    cy.contains("login_required");
  });
});
