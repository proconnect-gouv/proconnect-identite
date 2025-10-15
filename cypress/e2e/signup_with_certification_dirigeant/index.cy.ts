describe("Signup with a client requiring certification dirigeant", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4000");
    cy.contains("Forcer une connexion par certification dirigeant").click();
  });

  it("should seed the database once", function () {
    cy.seed();
  });

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
        cy.origin("http://localhost:1080", () => {
          cy.contains(
            "Vous avez demandé un lien d'identification à ProConnect. Utilisez le bouton ci-dessous pour vous connecter instantanément.",
          );
          cy.contains("Se connecter")
            .get("a")
            .invoke("attr", "target", "")
            .click();
        });
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
        cy.origin("http://localhost:1080", () => {
          cy.contains(
            "Vous avez demandé un lien d'identification à ProConnect. Utilisez le bouton ci-dessous pour vous connecter instantanément.",
          );
          cy.contains("Se connecter")
            .get("a")
            .invoke("attr", "target", "")
            .click();
        });
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
        cy.origin("http://localhost:1080", () => {
          cy.contains(
            "Vous avez demandé un lien d'identification à ProConnect. Utilisez le bouton ci-dessous pour vous connecter instantanément.",
          );
          cy.contains("Se connecter")
            .get("a")
            .invoke("attr", "target", "")
            .click();
        });
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

  it("should come back to the certification dirigeant page if FranceConnect access denied", function () {
    cy.visit("http://localhost:4000");
    cy.contains("Forcer une connexion par certification dirigeant").click();

    cy.title().should("include", "S'inscrire ou se connecter - ");
    cy.contains("Email professionnel").click();
    cy.focused().type("jean.michel@yopmail.com");
    cy.contains("Valider").click();

    cy.title().should("include", "Choisir votre mot de passe - ");
    cy.contains("Mot de passe").click();
    cy.contains("Recevoir un lien d’identification").click();
    cy.maildevGetMessageBySubject("Lien de connexion à ProConnect").then(
      (email) => {
        cy.maildevVisitMessageById(email.id);
        cy.origin("http://localhost:1080", () => {
          cy.contains(
            "Vous avez demandé un lien d'identification à ProConnect. Utilisez le bouton ci-dessous pour vous connecter instantanément.",
          );
          cy.contains("Se connecter")
            .get("a")
            .invoke("attr", "target", "")
            .click();
        });
        cy.maildevDeleteMessageById(email.id);
      },
    );

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
