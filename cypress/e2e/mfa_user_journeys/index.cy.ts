describe("Double authentification : les parcours utilisateurs", () => {
  beforeEach(cy.seed);

  describe("Inès Haddad, sans double authentification", () => {
    it("Activer la double authentification depuis un fournisseur de services qui l'exige : configurer une application d'authentification (TOTP) avec « Je ne sais pas »", function () {
      cy.origin("http://localhost:3001", () => {
        cy.visit("/");
        cy.contains("Forcer une connexion a deux facteurs").click();
      });

      cy.login("pas-de-2e-facteur@example.org");

      cy.contains(
        "En plus du mot de passe, une étape de sécurité supplémentaire sera demandée à chaque nouvelle session sur Service de démonstration.",
      );
      cy.contains("Choisir votre méthode de connexion renforcée");
      cy.contains("Je ne sais pas").click();
      cy.contains("button", "Continuer").click();

      cy.contains("Travaillez-vous avec :");
      cy.contains("Autre").click();
      cy.contains("Continuer").click();

      cy.contains(
        "Avez-vous le droit d'installer des logiciels ou extensions de navigateur sur votre poste ?",
      );
      cy.contains("Non").click();
      cy.contains("Continuer").click();

      cy.contains("Pouvez-vous installer une application sur un smartphone ?");
      cy.contains("Oui").click();
      cy.contains("Continuer").click();

      cy.contains("Codes à usage unique");
      cy.contains("Continuer").click();

      cy.contains("Quel outil utilisez-vous ?");
      cy.contains("J'ai une application sur mon smartphone").click();
      cy.contains("Confirmer").click();

      cy.contains("Scannez le QR Code avec votre smartphone");
      cy.get('img[alt="Code QR à utiliser dans l’appli FreeOTP"]');

      cy.contains("Vous ne pouvez pas scanner le code ?").click();
      cy.contains(
        "Pour configurer manuellement votre application d’authentification mobile :",
      );
      cy.get("#humanReadableTotpKey").should("be.visible");

      cy.get("[name=totpToken]").type("123456");
      cy.get('[action="/users/totp-configuration"] [type="submit"]').click();
      cy.contains(
        "Erreur : le code que vous avez utilisé est invalide. Merci de recommencer.",
      );

      cy.fillAndSubmitTotpForm("/users/totp-configuration");

      cy.title().should("include", "Sauvegardez vos mots de secours");
      cy.contains("Générer les mots de secours").click();
      cy.title().should("include", "Sauvegarder vos mots de secours");
      cy.contains("label", "J’ai sauvegardé mes mots de secours").click();
      cy.contains("Continuer").click();

      cy.contains("Votre connexion renforcée est bien configurée");
      cy.contains("Continuer").click();

      cy.contains('"acr": "eidas0-mfa"');

      cy.maildevGetMessageBySubject("Connexion renforcée activée").then(
        (email) => {
          cy.maildevVisitMessageById(email.id);
          cy.contains(
            "Votre compte ProConnect pas-de-2e-facteur@example.org est à présent protégé par la connexion renforcée.",
          );
          cy.maildevDeleteMessageById(email.id);
        },
      );
    });

    it("Activer la double authentification depuis son compte : accéder à « Compte et connexion » puis choisir une méthode de validation supplémentaire", function () {
      cy.visit("/connection-and-account");
      cy.login("pas-de-2e-facteur@example.org");

      cy.title().should("include", "Compte et connexion");
      cy.contains("h2", "Connexion renforcée");
      cy.contains("Vous n'avez pas encore configuré la connexion renforcée.");
      cy.contains("Configurer la connexion renforcée").click();

      cy.contains("Choisir votre méthode de connexion renforcée");
      cy.contains("Code à usage unique");
      cy.contains("Clé d'accès (passkey)");
    });
  });

  describe("Antoine Mercier, avec une application TOTP et des mots de secours", () => {
    it("Se connecter avec la double authentification : avec une application TOTP", function () {
      cy.origin("http://localhost:3001", () => {
        cy.visit("/");
        cy.contains("Forcer une connexion a deux facteurs").click();
      });

      cy.login("avec-totp-et-mots-de-secours@example.org");

      cy.contains("Étape de connexion renforcée");
      cy.fillTotpFields();

      cy.contains('"acr": "eidas0-mfa"');
    });

    it("Retrouver l'accès à son compte : utiliser ses mots de secours, puis configurer une application d'authentification (TOTP) et de nouveaux mots de secours", function () {
      cy.origin("http://localhost:3001", () => {
        cy.visit("/");
        cy.contains("Forcer une connexion a deux facteurs").click();
      });

      cy.login("avec-totp-et-mots-de-secours@example.org");

      cy.contains("Étape de connexion renforcée");
      cy.contains("Vous n’avez pas accès à cette méthode ?").click();

      cy.title().should("include", "Utiliser vos mots de secours");
      cy.contains(
        "Cette action va supprimer vos méthodes de connexion renforcée et invalider vos mots de secours.",
      );
      cy.contains("label", "Mots de secours").click();
      cy.focused().type("balade comptoir lasagne verrou aimable totem");
      cy.contains("button", "Continuer").click();

      cy.contains("Votre compte est récupéré");
      cy.contains("vos 6 mots de secours ont été invalidés");
      cy.contains("Reconfigurer").click();

      cy.get('[name="password"]').type("password123");
      cy.get('[action="/users/sign-in"]  [type="submit"]')
        .contains("S’identifier")
        .click();

      cy.contains("Choisir votre méthode de connexion renforcée");
      cy.contains("Code à usage unique").click();
      cy.contains("button", "Continuer").click();

      cy.contains("Configurer votre outil TOTP");
      cy.contains("J'ai une application sur mon smartphone").click();
      cy.contains("Confirmer").click();

      cy.contains("Scannez le QR Code avec votre smartphone");
      cy.fillAndSubmitTotpForm("/users/totp-configuration");

      cy.title().should("include", "Sauvegardez vos mots de secours");
      cy.contains("Générer les mots de secours").click();
      cy.title().should("include", "Sauvegarder vos mots de secours");
      cy.contains("label", "J’ai sauvegardé mes mots de secours").click();
      cy.contains("Continuer").click();

      cy.contains("Votre connexion renforcée est bien configurée");
      cy.contains("Continuer").click();

      // TODO infinite redirect bug, to be fixed soon
      // cy.title().should("include", "Accueil");
    });

    it("Les mots de secours : leur consultation ou leur renouvellement depuis le compte, et les précautions de conservation", function () {
      cy.visit("/connection-and-account");
      cy.mfaLogin("avec-totp-et-mots-de-secours@example.org");

      cy.contains("Récupération du compte");
      cy.contains("Mots de secours");

      cy.contains("Vérifier mes mots de secours").click();
      cy.contains("label", "Vos 6 mots de secours").click();
      cy.focused().type("balade comptoir lasagne verrou aimable totem");
      cy.contains("button", "Vérifier").click();
      cy.contains("Vos mots de secours sont valides.");

      cy.visit("/connection-and-account");
      cy.contains("Régénérer mes mots de secours").click();
      cy.contains("dialog", "Régénérer vos mots de secours ?")
        .contains("button", "Régénérer")
        .click();

      cy.title().should("include", "Sauvegarder vos mots de secours");
      cy.getByLabel("Vos mots de secours")
        .invoke("text")
        .then((text) => text.trim().split(" "))
        .should("have.length", 6);
      cy.contains("Comment les conserver ?");
      cy.contains("En numérique");
      cy.contains("En papier");
      cy.contains("Vous ne pourrez plus les afficher une seconde fois");
      cy.contains("label", "J’ai sauvegardé mes mots de secours").click();
      cy.contains("Continuer").click();

      cy.maildevGetMessageBySubject("Mots de secours modifiés").then(
        (email) => {
          cy.maildevVisitMessageById(email.id);
          cy.contains(
            "Vos mots de secours ont été modifiés sur votre compte ProConnect Identité.",
          );
          cy.maildevDeleteMessageById(email.id);
        },
      );
    });
  });
});
