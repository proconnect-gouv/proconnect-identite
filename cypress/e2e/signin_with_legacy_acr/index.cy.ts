describe("sign-in with a client not requiring any acr", () => {
  beforeEach(() => {
    cy.visit("http://localhost:4000");
    cy.setRequestedAcrs();
  });

  it("should sign-in an return the right acr value", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial1-aal1@yopmail.com");

    cy.contains('"acr": "eidas1"');
  });

  it("should sign-in an return the right acr value", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial2-aal1@yopmail.com");

    cy.contains('"acr": "eidas1"');
  });

  it("should sign-in an return the right acr value", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial1-aal2@yopmail.com");

    cy.contains('"acr": "eidas1"');
  });

  it("should sign-in an return the right acr value", function () {
    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial2-aal2@yopmail.com");

    cy.contains('"acr": "eidas1"');
  });
});

describe("sign-in with a client requiring eidas1", () => {
  it("should sign-in an return the eidas1 acr value", function () {
    cy.visit("http://localhost:4000");
    cy.setRequestedAcrs(["eidas1"]);

    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial1-aal1@yopmail.com");

    cy.contains('"acr": "eidas1"');
  });
});

describe("sign-in with a client requiring eidas1", () => {
  it("should sign-in an return the eidas1 acr value", function () {
    cy.visit("http://localhost:4000");
    cy.setRequestedAcrs(["eidas1"]);

    cy.get("button#custom-connection").click({ force: true });

    cy.login("ial1-aal1@yopmail.com");

    cy.contains('"acr": "eidas1"');
  });
});
