//

describe("sign-in with suggestion", () => {
  before(cy.seed);

  it("should sign-up and be suggested the Ministere des armees organization", function () {
    // Visit the signup page
    cy.visit("/users/start-sign-in");

    cy.title().should("equal", "S'inscrire ou se connecter - ProConnect");
    cy.contains("Email professionnel").click();
    cy.focused().type("user@intradef.gouv.fr");
    cy.contains("Continuer").click();

    cy.title().should("equal", "Choisir un mot de passe - ProConnect");
    cy.contains("Mot de passe").click();
    cy.focused().type("This super secret password is hidden well!");
    cy.contains("Continuer").click();

    cy.title().should("equal", "Vérifier votre email - ProConnect");
    cy.contains("Vérifiez les emails reçus par user@intradef.gouv.fr.");

    cy.verifyEmail();

    cy.title().should("equal", "Accueil - ProConnect");
    cy.contains("Organisations").click();
    cy.contains("Rejoindre une organisation").click();

    // Check that the ministere des armees is suggested
    cy.title().should(
      "equal",
      "Votre organisation de rattachement - ProConnect",
    );
    cy.contains("Ministere des armees").click();

    cy.title().should("equal", "Renseigner votre identité - ProConnect");
    cy.contains("Prénom").click();
    cy.focused().clear().type("Loïs");
    cy.contains("Nom").click();
    cy.focused().clear().type("Lane");
    cy.contains("Continuer").click();

    cy.title().should("equal", "Rattachement en cours - ProConnect");
  });

  it("should sign-up with siret_hint and be suggested corresponding organization", function () {
    cy.visit("http://localhost:4001");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      siret_hint: "21340126800130",
    }));
    cy.contains("Connexion personnalisée").click({ force: true });

    cy.title().should("equal", "Choisir un mot de passe - ProConnect");
    cy.contains("Mot de passe").click();
    cy.focused().type("This super secret password is hidden well!");
    cy.contains("Continuer").click();

    cy.verifyEmail();

    cy.title().should("equal", "Rejoindre une organisation - ProConnect");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().should("have.value", "21340126800130");
    cy.contains("Commune de lamalou-les-bains - Mairie").click();

    cy.title().should("equal", "Renseigner votre identité - ProConnect");
    cy.contains("Prénom").click();
    cy.focused().clear().type("Loïs");
    cy.contains("Nom").click();
    cy.focused().clear().type("Lane");
    cy.contains("Continuer").click();

    cy.title().should("equal", "Compte créé - ProConnect");
    cy.contains("Continuer").click();

    cy.title().should("equal", "proconnect-federation-client - ProConnect");
    cy.contains('"usual_name": "Lane"');
    cy.contains('"given_name": "Loïs"');
    cy.contains('"email": "unused1@yopmail.com"');
    cy.contains('"siret": "21340126800130"');
  });

  it("should sign-in with siret_hint and be suggested corresponding organization if not already present", function () {
    cy.visit("http://localhost:4001");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      login_hint: undefined,
      siret_hint: "21340126800130",
    }));
    cy.contains("Connexion personnalisée").click({ force: true });

    cy.login("lion.eljonson@darkangels.world");

    cy.title().should("equal", "Rejoindre une organisation - ProConnect");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().should("have.value", "21340126800130");
  });

  it("should sign-in with siret_hint with multiple organizations and be suggested corresponding organization if not already present", function () {
    cy.visit("http://localhost:4001");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      login_hint: undefined,
      siret_hint: "66204244933106",
    }));
    cy.contains("Connexion personnalisée").click({ force: true });

    cy.login("rogal.dorn@imperialfists.world");

    cy.title().should("equal", "Rejoindre une organisation - ProConnect");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().should("have.value", "66204244933106");
  });

  it("should sign-in with siret_hint and select corresponding organization if already present", function () {
    cy.visit("http://localhost:4001");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      login_hint: undefined,
      siret_hint: "21340126800130",
    }));
    cy.contains("Connexion personnalisée").click({ force: true });

    cy.login("konrad.curze@nightlords.world");

    cy.title().should("equal", "proconnect-federation-client - ProConnect");
    cy.contains('"siret": "21340126800130"');
  });

  it("should sign-in without siret_hint, select an organization, then sign-in with siret_hint of another organization and be suggested that organization", function () {
    // First sign-in without siret_hint
    cy.visit("http://localhost:4001");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      login_hint: undefined,
      siret_hint: undefined,
    }));
    cy.contains("Connexion personnalisée").click({ force: true });

    cy.login("jane.doe@yopmail.com");

    cy.visit("http://localhost:4000");

    cy.updateCustomParams((customParams) => ({
      ...customParams,
      login_hint: undefined,
      siret_hint: "21340126800130",
    }));

    cy.contains("Connexion personnalisée").click({ force: true });

    cy.title().should("equal", "Rejoindre une organisation - ProConnect");
    cy.contains("SIRET de l’organisation que vous représentez").click();
    cy.focused().should("have.value", "21340126800130");
  });
});

describe("sign-in with suggestion and certification", () => {
  before(cy.seed);

  it("sould sign-in with and suggest a certification dirigeant on EMMAUS SOLIDARITE", function () {
    cy.visit("http://localhost:4000");

    cy.title().should("equal", "standard-client - ProConnect");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      siret_hint: "39234600300198",
    }));
    cy.setRequestedAcrs([
      "https://proconnect.gouv.fr/assurance/certification-dirigeant",
    ]);
    cy.get("button#custom-connection").click({ force: true });

    cy.title().should("equal", "S'inscrire ou se connecter - ProConnect");
    cy.login("lion.eljonson@darkangels.world");

    cy.title().should("equal", "Rejoindre une organisation - ProConnect");
    cy.contains("Papillon");
    cy.contains("Enregistrer").click();

    cy.title().should("equal", "Certification dirigeant - ProConnect");
    cy.contains("Certifier votre statut");
    cy.getByLabel("S’identifier avec FranceConnect").click();

    cy.title().should("include", "🎭 FranceConnect 🎭");
    cy.contains("Je suis Ulysse Tosi").click();

    cy.title().should("equal", "Compte certifié - ProConnect");
    cy.contains("Vous êtes bien certifié en tant que dirigeant de Papillon.");
    cy.contains("Continuer").click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains('"siret": "39234600300198"');
    cy.contains(
      '"acr": "https://proconnect.gouv.fr/assurance/certification-dirigeant"',
    );
  });
});
