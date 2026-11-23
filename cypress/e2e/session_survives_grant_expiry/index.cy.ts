//

describe("session survives grant expiry", () => {
  const CLAMART_SIRET = "45334017600024";
  const DANONE_SIRET = "55203253400646";

  before(cy.seed);

  it("should not require re-login after the Grant record is gone, as long as the Session is still valid", () => {
    cy.visit("http://localhost:4000");
    cy.contains("S’identifier avec ProConnect").click();

    cy.title().should("include", "S'inscrire ou se connecter - ");
    cy.login("unused1@yopmail.com");

    cy.title().should("include", "Choisir une organisation -");
    cy.getByLabel("Clamart (choisir cette organisation)").click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains(`"siret": "${CLAMART_SIRET}"`);
    cy.getTestClientAccessToken().as("clamartAccessToken");

    // Select another organization in the ProConnect session, outside of any SP.
    // The standard client keeps Clamart as long as its grant lives.
    cy.visit("/users/select-organization");
    cy.title().should("include", "Choisir une organisation -");
    cy.getByLabel("Danone (choisir cette organisation)").click();

    cy.title().should("include", "Accueil - ProConnect");
    cy.contains("Votre compte ProConnect");

    cy.expireGrants();

    // A token issued under the expired grant is rejected with a clean 401.
    cy.get<string>("@clamartAccessToken").then((accessToken) =>
      cy
        .request({
          url: "/oauth/userinfo",
          headers: { Authorization: `Bearer ${accessToken}` },
          failOnStatusCode: false,
        })
        .then(({ status, body }) => {
          expect(status).to.equal(401);
          expect(body.error).to.equal("invalid_token");
        }),
    );

    cy.visit("http://localhost:4000");
    cy.contains("S’identifier avec ProConnect").click();

    // no login screen: the Session is still recognized even though its Grant is gone
    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains("standard-client");
    cy.contains('"email": "unused1@yopmail.com"');
    // The new grant takes the organization selected in the ProConnect session,
    // not the one the standard client had before its grant expired.
    cy.contains(`"siret": "${DANONE_SIRET}"`);
  });
});
