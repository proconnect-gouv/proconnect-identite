//

describe("trigger rate limiting by ip", () => {
  before(cy.seed);
  beforeEach(() => {
    // Clear rate-limiter credits
    cy.exec(
      "docker compose exec redis redis-cli --scan --pattern 'rate-limiter:*' | xargs -r docker compose exec redis redis-cli DEL",
    );
  });

  it("should trigger ip rate limiting when hitting 51 pages after a successful login", function () {
    cy.visit("http://localhost:4000");

    cy.get("button.proconnect-button").click();

    cy.login("rate-limit+user@yopmail.com");

    cy.title().should("equal", "standard-client - ProConnect");
    cy.contains("standard-client");

    // we already consumed 9 rate limiter credits during the login process
    for (let i = 1; i <= 60 - 9; i++) {
      cy.visit("/", { failOnStatusCode: false });
      cy.contains("Votre compte ProConnect");
    }

    cy.visit("/", { failOnStatusCode: false });
    cy.contains("Too Many Requests");
    cy.contains(
      "Merci de ne pas retenter de connexion dans l’immédiat et de réessayer dans une quinzaine de minutes.",
    );

    cy.contains("Retour à l’accueil").click();
  });

  it("should trigger ip rate limiting when a login is ongoing", function () {
    cy.visit("http://localhost:4000");

    cy.get("button.proconnect-button").click();

    cy.login("rate-limit+user2@yopmail.com");

    // we already consumed 8 rate limiter credits during the login process
    for (let i = 1; i <= 60 - 8; i++) {
      cy.visit("/");
      cy.contains("Votre compte ProConnect");
    }

    cy.visit("/", { failOnStatusCode: false });
    cy.contains("Too Many Requests");
    cy.contains(
      "Merci de ne pas retenter de connexion dans l’immédiat et de réessayer dans une quinzaine de minutes.",
    );

    cy.contains("Continuer sur le service").click();

    cy.url().should("include", "error=server_error");
    cy.url().should("include", "error_description=Too%20many%20requests");
  });

  it("should trigger IP rate limiting by hitting 404 errors", function () {
    for (let i = 1; i <= 60; i++) {
      cy.visit("http://localhost:3000/random", { failOnStatusCode: false });
      cy.contains("Page non trouvée");
    }

    cy.visit("http://localhost:3000/random", { failOnStatusCode: false });
    cy.contains("Too Many Requests");
    cy.contains(
      "Merci de ne pas retenter de connexion dans l’immédiat et de réessayer dans une quinzaine de minutes.",
    );

    cy.contains("Retour à l’accueil").click();
  });

  it("should trigger IP rate limiting by hitting 404 errors under /oauth", function () {
    for (let i = 1; i <= 60; i++) {
      cy.request(
        "http://localhost:3000/oauth/.well-known/openid-configuration",
      );
    }

    cy.request({
      url: "http://localhost:3000/oauth/.well-known/openid-configuration",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(429);
    });
  });

  it("should not trigger IP rate limiting by hitting 404 errors under /api", function () {
    for (let i = 1; i <= 100; i++) {
      cy.visit("http://localhost:3000/api/random", { failOnStatusCode: false });
      cy.contains("Page non trouvée");
    }

    cy.visit("http://localhost:3000/api/random", { failOnStatusCode: false });
    cy.contains("Page non trouvée");
  });
});
