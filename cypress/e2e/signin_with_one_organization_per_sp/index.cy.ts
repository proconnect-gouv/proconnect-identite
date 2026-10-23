//

const EMAIL = "certified-franceconnected+dirigeant@yopmail.com";
const CLAMART_SIRET = "45334017600024";
const DANONE_SIRET = "55203253400646";
const CERTIFICATION_DIRIGEANT_ACR =
  "https://proconnect.gouv.fr/assurance/certification-dirigeant";

// The acr claim is only added to the ID token when the SP requests it.
const ID_TOKEN_CLAIMS = {
  id_token: { amr: { essential: true }, acr: { essential: true } },
};

const connectToStandardClient = () => {
  cy.visit("http://localhost:4000");
  cy.updateCustomParams((customParams) => ({
    ...customParams,
    claims: ID_TOKEN_CLAIMS,
  }));
  cy.get("button#custom-connection").click({ force: true });
};

// The federation client sends a login_hint for another user by default.
const connectToFederationClient = () => {
  cy.visit("http://localhost:4001");
  cy.updateCustomParams((customParams) => ({
    ...customParams,
    login_hint: EMAIL,
    claims: ID_TOKEN_CLAIMS,
  }));
  cy.get("button#custom-connection").click({ force: true });
};

const selectOrganizationOutsideOfAnySp = (label: string) => {
  cy.visit("/users/select-organization");
  cy.title().should("include", "Choisir une organisation -");
  cy.getByLabel(`${label} (choisir cette organisation)`).click();
  cy.title().should("not.include", "Choisir une organisation -");
};

describe("sign-in with one organization per SP", () => {
  before(cy.seed);

  it("should keep the organization of each SP", function () {
    connectToFederationClient();
    cy.contains("Renseignez votre mot de passe").click();
    cy.focused().type("password123");
    cy.contains("S’identifier").click();

    cy.title().should("include", "Choisir une organisation -");
    cy.getByLabel("Clamart (choisir cette organisation)").click();

    cy.title().should("equal", "proconnect-federation-client - ProConnect");
    cy.contains(`"siret": "${CLAMART_SIRET}"`);

    // The standard client has no organization yet: it gets the one selected
    // in the ProConnect session, then the user changes it.
    cy.visit("http://localhost:4000");
    cy.contains("S’identifier avec ProConnect").click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains(`"siret": "${CLAMART_SIRET}"`);

    cy.contains("button", "Changer d’organisation").click();
    cy.title().should("include", "Choisir une organisation -");
    cy.getByLabel("Danone (choisir cette organisation)").click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains(`"siret": "${DANONE_SIRET}"`);

    // The federation client still gets its own organization, without prompt.
    connectToFederationClient();

    cy.title().should("equal", "proconnect-federation-client - ProConnect");
    cy.contains(`"siret": "${CLAMART_SIRET}"`);
  });

  it("should keep the certified organization when another one is selected outside of the SP", function () {
    cy.visit("http://localhost:4000");
    cy.contains("Forcer une connexion par certification dirigeant").click();
    cy.login(EMAIL);

    cy.title().should("include", "Choisir une organisation -");
    cy.getDescribed("Clamart").within(() => {
      cy.contains("certifié");
    });
    cy.getByLabel("Clamart (choisir cette organisation)").click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains(`"siret": "${CLAMART_SIRET}"`);
    cy.contains(`"acr": "${CERTIFICATION_DIRIGEANT_ACR}"`);

    selectOrganizationOutsideOfAnySp("Danone");

    // A default connection must not return the Danone claims with the
    // certification dirigeant acr obtained for Clamart.
    connectToStandardClient();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains(`"siret": "${CLAMART_SIRET}"`);
    cy.contains(`"acr": "${CERTIFICATION_DIRIGEANT_ACR}"`);
  });

  it("should prompt for the organization again when another SP changed the session acr", function () {
    connectToFederationClient();
    cy.contains("Renseignez votre mot de passe").click();
    cy.focused().type("password123");
    cy.contains("S’identifier").click();

    cy.title().should("include", "Choisir une organisation -");
    cy.getByLabel("Danone (choisir cette organisation)").click();

    cy.title().should("equal", "proconnect-federation-client - ProConnect");
    cy.contains(`"siret": "${DANONE_SIRET}"`);
    cy.contains('"acr": "eidas1"');

    selectOrganizationOutsideOfAnySp("Clamart");

    // Another SP re-authenticates the session with the certification
    // dirigeant acr, for Clamart.
    cy.visit("http://localhost:4000");
    cy.contains("Forcer une connexion par certification dirigeant").click();

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains(`"siret": "${CLAMART_SIRET}"`);
    cy.contains(`"acr": "${CERTIFICATION_DIRIGEANT_ACR}"`);

    // The acr stored for the federation client (eidas1, for Danone) no longer
    // matches the session acr: the organization is resolved again, from the
    // organization selected in the ProConnect session (Clamart), and the acr
    // is recomputed for it. Without this check, the federation client would
    // get the Danone claims with the certification dirigeant acr.
    connectToFederationClient();

    cy.title().should("equal", "proconnect-federation-client - ProConnect");
    cy.contains(`"siret": "${CLAMART_SIRET}"`);
    cy.contains('"acr": "eidas1"');
    cy.contains(CERTIFICATION_DIRIGEANT_ACR).should("not.exist");
  });
});
