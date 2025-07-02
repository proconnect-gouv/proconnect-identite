describe("sign-in with TOTP on untrusted browser", () => {
  it.only("should seed the database once", function () {
    cy.seed();
  });

  it("should sign-in with password and TOTP", function () {
    cy.visit("http://localhost:4000");
    cy.get("button.proconnect-button").click();

    cy.mfaLogin("unused1@yopmail.com");

    cy.contains('"amr": [\n    "pwd",\n    "totp",\n    "mfa"\n  ],');
  });

  it("should sign-in with password and no TOTP", function () {
    cy.visit("http://localhost:4000");
    cy.get("button.proconnect-button").click();

    cy.login("lion.eljonson@darkangels.world");

    cy.contains(
      "Information : pour garantir la sécurité de votre compte, nous avons besoin d’authentifier votre navigateur.",
    );

    cy.verifyEmail();

    cy.contains("standard-client");
  });

  it("should sign-in with password and TOTP when forced by SP", function () {
    cy.visit("http://localhost:4000");
    cy.get("button#force-2fa").click();

    cy.mfaLogin("lion.eljonson@darkangels.world");

    cy.contains('"amr": [\n    "pwd",\n    "totp",\n    "mfa"\n  ],');
  });

  it.only("should sign-in with TOTP when forced by SP, password only otherwise", function () {
    cy.visit("http://localhost:4000");
    cy.get("button.proconnect-button").click();

    cy.login("lion.eljonson@darkangels.world");

    cy.verifyEmail();

    cy.visit("http://localhost:3000");

    cy.contains("Jean Jean").click();

    cy.visit("http://localhost:4000");

    cy.get("button#force-2fa").click();

    cy.mfaLogin("lion.eljonson@darkangels.world");

    cy.contains('"amr": [\n    "pwd",\n    "totp",\n    "mfa"\n  ],');
  });

  it("should only show totp step when already logged", function () {
    cy.visit("http://localhost:4000");
    cy.get("button.proconnect-button").click();

    cy.login("lion.eljonson@darkangels.world");

    cy.verifyEmail();

    cy.contains("standard-client");

    cy.get("button#force-2fa").click();

    cy.contains("Valider avec la double authentification");

    cy.fillTotpFields();

    cy.contains('"amr": [\n    "pwd",\n    "totp",\n    "mfa"\n  ],');
  });

  it("should display error message", function () {
    cy.visit("/users/start-sign-in");

    cy.login("unused3@yopmail.com");

    cy.get("[name=totpToken]").type("123456");
    cy.get('[action="/users/2fa-sign-in-with-totp"] [type="submit"]').click();
    cy.contains("Code invalide.");
  });

  it("should show email verification renewal screen", function () {
    cy.visit("http://localhost:4000");
    cy.get("button.proconnect-button").click();

    cy.login("jul.treize@marseille.world");

    cy.contains(
      "pour garantir la sécurité de votre compte, votre adresse email doit être vérifiée régulièrement.",
    );

    cy.verifyEmail();

    cy.contains("Valider avec la double authentification");

    cy.fillTotpFields();

    cy.contains('"amr": [\n    "pwd",\n    "totp",\n    "mfa"\n  ],');
  });
});
