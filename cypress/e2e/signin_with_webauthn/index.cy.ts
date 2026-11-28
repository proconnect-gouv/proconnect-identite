describe("setup the passkey", () => {
  before(cy.seed);

  it("should add ctap2 internal passkey authentication", function () {
    cy.addVirtualAuthenticator({
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
    }).as("authenticator");

    cy.visit("/connection-and-account");
    cy.login("lion.eljonson@darkangels.world");

    cy.title().should("include", "Compte et connexion");
    cy.contains("Configurer la connexion renforcée").click();

    cy.title().should("include", "Connexion renforcée - ProConnect");
    cy.contains("Choisir votre méthode de connexion renforcée");
    cy.contains("Clé d'accès").click();
    cy.contains("Continuer").click();

    cy.title().should("include", "Sauvegardez vos mots de secours");
    cy.contains("Générer les mots de secours").click();
    cy.title().should("include", "Sauvegarder vos mots de secours");
    cy.contains("label", "J’ai sauvegardé mes mots de secours").click();
    cy.contains("Continuer").click();

    cy.title().should(
      "include",
      "Votre connexion renforcée est bien configurée",
    );
    cy.contains("Votre connexion renforcée est bien configurée");
    cy.contains("Continuer").click();

    cy.title().should("include", "Compte et connexion");

    cy.get("@authenticator").getFirstCertification().as("credential");

    cy.get<{ credentialId: string }>("@credential").then(({ credentialId }) => {
      cy.contains(
        `Clé ${credentialId
          // @see src/managers/webauthn.ts#getUserAuthenticators
          .substring(0, 10)
          // @see src/services/base64.ts#encodeBase64URL
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "")}`,
      );
    });
  });
});

describe("use the passkey", () => {
  beforeEach(() => {
    // Adds a delay to auto-login to allow Cypress to read the page before triggering authentication.
    cy.intercept(
      "GET",
      "/api/webauthn/generate-authentication-options-for-first-factor",
      (req) =>
        req.on("response", (res) => {
          res.setDelay(1000);
        }),
    );
  });

  it("should sign-in with passkey from PCI", function () {
    cy.visit("/");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.contains("Email professionnel").click();
    cy.focused().type("lion.eljonson@darkangels.world");
    cy.contains("Continuer").click();

    cy.title().should("include", "Accéder au compte - ProConnect");
    cy.contains("Se connecter avec une clé d’accès");

    cy.title().should("include", "Accueil - ProConnect");
  });

  it("should sign-in with passkey even when someone else types the same email meanwhile", function () {
    // Hold Lion's challenge on its way back to his browser, once the server
    // has issued it, so someone else can act before Lion signs it.
    const challengeIssued = Promise.withResolvers<void>();
    const someoneElseDone = Promise.withResolvers<void>();
    cy.intercept(
      "GET",
      "/api/webauthn/generate-authentication-options-for-first-factor",
      (req) => {
        req.on("response", () => {
          challengeIssued.resolve();
          return someoneElseDone.promise;
        });
      },
    );

    // Lion starts a passkey sign-in
    cy.visit("/");
    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.contains("Email professionnel").click();
    cy.focused().type("lion.eljonson@darkangels.world");
    cy.contains("Continuer").click();
    cy.wrap(challengeIssued.promise);

    cy.getCookie("session").then((lionSession) => {
      // Someone else, in a new session, types Lion's email
      cy.clearCookies();
      cy.request("/users/start-sign-in").then(({ body }) => {
        const [, _csrf] = /name="_csrf" value="([^"]+)"/.exec(body) ?? [];
        cy.request({
          body: { _csrf, login: "lion.eljonson@darkangels.world" },
          form: true,
          method: "POST",
          url: "/users/start-sign-in",
        });
      });
      cy.request(
        "/api/webauthn/generate-authentication-options-for-first-factor",
      );

      // Back in Lion's browser, the challenge arrives and gets signed
      cy.setCookie("session", lionSession!.value, { httpOnly: true });
      cy.then(() => someoneElseDone.resolve());
    });

    cy.title().should("include", "Accueil - ProConnect");
  });

  it("should sign-in with passkey from service provider", function () {
    cy.origin("http://localhost:4000", () => {
      cy.visit("/");
      cy.title().should("include", "standard-client - ProConnect");
      cy.contains("S’identifier avec ProConnect").click();
    });

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.contains("Email professionnel").click();
    cy.focused().type("lion.eljonson@darkangels.world");
    cy.contains("Continuer").click();

    cy.title().should("include", "Accéder au compte - ProConnect");
    cy.contains("Se connecter avec une clé d’accès");

    cy.origin("http://localhost:4000", () => {
      cy.title().should("include", "standard-client - ProConnect");
      cy.contains('"amr": [\n    "pop",\n    "mfa"\n  ],');

      cy.contains("Se déconnecter").click();
    });
  });

  it("should sign-in with passkey from service provider that force 2FA", function () {
    cy.origin("http://localhost:4000", () => {
      cy.visit("/");
      cy.title().should("include", "standard-client - ProConnect");
      cy.contains("Forcer une connexion a deux facteurs").click();
    });

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.contains("Email professionnel").click();
    cy.focused().type("lion.eljonson@darkangels.world");
    cy.contains("Continuer").click();

    cy.title().should("include", "Accéder au compte - ProConnect");
    cy.contains("Se connecter avec une clé d’accès");

    cy.origin("http://localhost:4000", () => {
      cy.title().should("include", "standard-client - ProConnect");
      cy.contains('"amr": [\n    "pop",\n    "mfa"\n  ],');
      cy.contains('"acr": "eidas0-mfa"');
    });
  });

  it("should change user 2fa preference", function () {
    cy.visit("/connection-and-account");

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.contains("Email professionnel").click();
    cy.focused().type("lion.eljonson@darkangels.world");
    cy.contains("Continuer").click();

    cy.contains("Se connecter avec une clé d’accès");

    cy.title().should("include", "Compte et connexion");
    cy.contains("Sur tous les sites").click();
    cy.contains("Valider").click();

    cy.contains("La connexion renforcée a été activée sur tous les sites.");

    // Logout
    cy.contains("Lion El'Jonson").click();
  });

  it("should sign-in with passkey when user has 2FA forced", function () {
    cy.origin("http://localhost:4000", () => {
      cy.visit("/");
      cy.title().should("include", "standard-client - ProConnect");
      cy.contains("S’identifier avec ProConnect").click();
    });

    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.contains("Email professionnel").click();
    cy.focused().type("lion.eljonson@darkangels.world");
    cy.contains("Continuer").click();

    cy.title().should("include", "Accéder au compte - ProConnect");
    cy.contains("Se connecter avec une clé d’accès");

    cy.origin("http://localhost:4000", () => {
      cy.title().should("include", "standard-client - ProConnect");
      cy.contains('"amr": [\n    "pop",\n    "mfa"\n  ],');
    });
  });
});
