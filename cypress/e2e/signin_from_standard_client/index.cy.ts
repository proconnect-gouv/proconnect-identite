//

describe("sign-in from standard client", () => {
  it("should seed the database once", function () {
    cy.seed();
  });

  it("should sign-in without org selection when having only one organization", function () {
    cy.visit("http://localhost:4000");
    cy.get("button.proconnect-button").click();

    cy.login("unused1@yopmail.com");

    cy.contains("standard-client");
    cy.contains("unused1@yopmail.com");
    cy.contains("Commune de lamalou-les-bains - Mairie");

    // then it should prompt for organization
    cy.get("button#select-organization").click();
    cy.contains("Votre organisation de rattachement");
    cy.get(".fr-grid-row .fr-col-12:first-child .fr-tile__link").click();
    cy.contains("standard-client");
    cy.contains("Commune de lamalou-les-bains - Mairie");

    // then it should update userinfo
    cy.contains("Jean Un");
    cy.get("button#update-userinfo").click();
    cy.contains("Renseigner son identité");
    cy.get('[name="family_name"]').type("Moustaki");
    cy.get('[type="submit"]').click();
    cy.contains("standard-client");
    cy.contains("Moustaki");
  });

  it("should sign-in with org selection when having two organization", function () {
    cy.visit("http://localhost:4000");
    cy.get("button.proconnect-button").click();

    cy.login("unused2@yopmail.com");

    cy.get(".fr-grid-row .fr-col-12:first-child .fr-tile__link").contains(
      "Commune de lamalou-les-bains - Mairie",
    );
    cy.get(".fr-grid-row .fr-col-12:last-child .fr-tile__link").contains(
      "Commune de clamart - Mairie",
    );

    cy.get(".fr-grid-row .fr-col-12:last-child .fr-tile__link").click();

    cy.contains("standard-client");
    cy.contains("unused2@yopmail.com");
    cy.contains("Commune de clamart - Mairie");

    // then it should prompt for organization
    cy.get("button#select-organization").click();
    cy.contains("Votre organisation de rattachement");
    cy.get(".fr-grid-row .fr-col-12:first-child .fr-tile__link").click();

    cy.contains("standard-client");
    cy.contains("Commune de lamalou-les-bains - Mairie");
  });

  it("should not prompt for password if a session is already opened", () => {
    cy.visit("/");
    cy.login("unused1@yopmail.com");

    cy.visit("http://localhost:4000");
    cy.get("button.proconnect-button").click();

    cy.contains("standard-client");
    cy.contains("unused1@yopmail.com");
  });
});
