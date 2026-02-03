//

describe("join and moderation", () => {
  before(cy.seed);

  describe("existing user", () => {
    it("will be moderated when joining organization from the app", function () {
      cy.visit("/users/join-organization");

      cy.login("lion.eljonson@darkangels.world");

      cy.title().should("include", "Rejoindre une organisation -");
      cy.contains("SIRET de l’organisation que vous représentez").click();
      cy.focused().clear().type("66204244933106");
      cy.getByLabel(
        "Organisation correspondante au SIRET donné : Bnp paribas - Bnp paribas",
      ).click();

      cy.title().should("include", "Rattachement en cours -");
      cy.contains("Demande en cours");
      cy.contains(
        "Nous vérifions votre lien à l’organisation, vous recevrez un email de confirmation dès que votre compte sera validé.",
      );
    });

    it("will be moderated when login to an SP", function () {
      cy.origin("http://localhost:4000", () => {
        cy.visit("/");
        cy.title().should("include", "standard-client - ProConnect");
        cy.contains("S’identifier avec ProConnect").click();
      });

      cy.login("leman.russ@spacewolves.world");

      cy.title().should("include", "Rejoindre une organisation -");
      cy.contains("SIRET de l’organisation que vous représentez").click();
      cy.focused().clear().type("66204244914742");
      cy.getByLabel(
        "Organisation correspondante au SIRET donné : Bnp paribas",
      ).click();

      cy.title().should("include", "Rattachement en cours -");
      cy.contains("Demande en cours");
      cy.contains(
        "Nous vérifions votre lien à l’organisation, vous recevrez un email de confirmation dès que votre compte sera validé.",
      );
    });

    it("has a moderation ongoing but no userinfo yet (testing transitional period)", function () {
      cy.origin("http://localhost:4000", () => {
        cy.visit("/");
        cy.title().should("include", "standard-client - ProConnect");
        cy.contains("S’identifier avec ProConnect").click();
      });

      cy.login(
        "moderation-ongoing-and-no-userinfo+konrad.curze@nightlords.world",
      );

      cy.title().should("include", "Rejoindre une organisation -");
      cy.contains("SIRET de l’organisation que vous représentez").click();
      cy.focused().clear().type("66204244933106");
      cy.getByLabel(
        "Organisation correspondante au SIRET donné : Bnp paribas - Bnp paribas",
      ).click();

      cy.title().should("include", "Rattachement en cours - ProConnect");
      cy.contains("Demande en cours");
      cy.getByLabel("Corriger le nom").click();

      cy.title().should("include", "Renseigner votre identité -");
      cy.contains("Renseigner son identité");
      cy.contains("Prénom").click();
      cy.focused().clear().type("Rogal");
      cy.contains("Nom").click();
      cy.focused().clear().type("Dorn");
      cy.contains("Valider").click();

      cy.title().should("include", "Rejoindre une organisation -");
      cy.contains("SIRET de l’organisation que vous représentez").click();
      cy.focused().clear().type("66204244933106");
      cy.getByLabel(
        "Organisation correspondante au SIRET donné : Bnp paribas - Bnp paribas",
      ).click();

      cy.contains("Demande en cours");
      cy.contains(
        "Nous vérifions votre lien à l’organisation, vous recevrez un email de confirmation dès que votre compte sera validé.",
      );
    });
  });

  describe("new user", () => {
    it("will be moderated when joining organization from the app", function () {
      cy.visit("/users/join-organization");

      cy.magicLinkLogin("rogal.dorn@imperialfists.world");

      cy.title().should("include", "Rejoindre une organisation -");
      cy.contains("SIRET de l’organisation que vous représentez").click();
      cy.focused().clear().type("66204244933106");
      cy.getByLabel(
        "Organisation correspondante au SIRET donné : Bnp paribas - Bnp paribas",
      ).click();

      cy.title().should("include", "Renseigner votre identité -");
      cy.contains("Renseigner son identité");
      cy.contains("Prénom").click();
      cy.focused().clear().type("Rogal");
      cy.contains("Nom").click();
      cy.focused().clear().type("Dorn");
      cy.contains("Valider").click();

      cy.title().should("include", "Rattachement en cours -");
      cy.contains("Demande en cours");
      cy.contains(
        "Nous vérifions votre lien à l’organisation, vous recevrez un email de confirmation dès que votre compte sera validé.",
      );
    });

    it("will be moderated when login to an SP", function () {
      cy.origin("http://localhost:4000", () => {
        cy.visit("/");
        cy.title().should("include", "standard-client - ProConnect");
        cy.contains("S’identifier avec ProConnect").click();
      });

      cy.magicLinkLogin("konrad.curze@nightlords.world");

      cy.title().should("include", "Rejoindre une organisation -");
      cy.contains("SIRET de l’organisation que vous représentez").click();
      cy.focused().clear().type("66204244933106");
      cy.getByLabel(
        "Organisation correspondante au SIRET donné : Bnp paribas - Bnp paribas",
      ).click();

      cy.title().should("include", "Renseigner votre identité -");
      cy.contains("Renseigner son identité");
      cy.contains("Prénom").click();
      cy.focused().clear().type("Konrad");
      cy.contains("Nom").click();
      cy.focused().clear().type("Curze");
      cy.contains("Valider").click();

      cy.title().should("include", "Rattachement en cours -");
      cy.contains("Demande en cours");
      cy.contains(
        "Nous vérifions votre lien à l’organisation, vous recevrez un email de confirmation dès que votre compte sera validé.",
      );
    });
  });
});
