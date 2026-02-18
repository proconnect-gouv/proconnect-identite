//

describe("sign-in with suggestion", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("should sign-up and be suggested the Ministere des armees organization", function () {
    // Visit the signup page
    cy.visit("/users/start-sign-in");

    cy.get('[name="login"]').type("user@intradef.gouv.fr");
    cy.get('[type="submit"]').click();

    cy.get('[name="password"]').type(
      "This super secret password is hidden well!",
    );
    cy.get('[action="/users/sign-up"]  [type="submit"]').click();

    // Check that the website is waiting for the user to verify their email
    cy.get("#verify-email > div > p").contains("user@intradef.gouv.fr");

    cy.verifyEmail();

    // Fill the user's personal information
    cy.get('[name="given_name"]').type("Loïs");
    cy.get('[name="family_name"]').type("Lane");
    cy.get('[type="submit"]').click();

    // Check that the ministere des armees is suggested
    cy.url().should("include", "users/organization-suggestions");
    cy.get("#submit-join-organization-1").contains("Ministere des armees");
  });

  it("should sign-up with siret_hint and be suggested corresponding organization", function () {
    cy.visit("http://localhost:4001");
    cy.updateCustomParams((customParams) => ({
      ...customParams,
      siret_hint: "21340126800130",
    }));
    cy.contains("Connexion personnalisée").click({ force: true });

    cy.get('[name="password"]').type(
      "This super secret password is hidden well!",
    );
    cy.get('[action="/users/sign-up"]  [type="submit"]').click();

    cy.verifyEmail();

    // Fill the user's personal information
    cy.get('[name="given_name"]').type("Loïs");
    cy.get('[name="family_name"]').type("Lane");
    cy.get('[type="submit"]').click();

    cy.url().should("include", "users/join-organization");
    cy.get('input[name="siret"]').should("have.value", "21340126800130");
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

    cy.url().should("include", "users/join-organization");
    cy.get('input[name="siret"]').should("have.value", "21340126800130");
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

    cy.url().should("include", "users/join-organization");
    cy.get('input[name="siret"]').should("have.value", "66204244933106");
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

    cy.url().should("include", "http://localhost:4001/");
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

    cy.url().should("include", "users/join-organization");
    cy.get('input[name="siret"]').should("have.value", "21340126800130");
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
