//
describe("sign-in with webauthn on untrusted browser", () => {
  beforeEach(() => {
    Cypress.automation("remote:debugger:protocol", {
      command: "WebAuthn.disable",
    });
  });

  it("should seed the database once", function () {
    cy.seed();
  });

  it("should sign-in with webauthn", async function () {
    Cypress.automation("remote:debugger:protocol", {
      command: "WebAuthn.enable",
    });
    const authenticator: { authenticatorId: string } = await Cypress.automation(
      "remote:debugger:protocol",
      {
        command: "WebAuthn.addVirtualAuthenticator",
        params: {
          options: {
            hasResidentKey: true,
            hasUserVerification: true,
            isUserVerified: true,
            protocol: "ctap2",
            transport: "internal",
          },
        },
      },
    );

    Cypress.automation("remote:debugger:protocol", {
      command: "WebAuthn.addCredential",
      params: {
        authenticatorId: authenticator.authenticatorId,
        credential: {
          credentialId: "Bdf73ipOxFEpTjCr4FqGYnLsWAKU/s6eLh2a32GihKo=",
          isResidentCredential: true,
          privateKey:
            "MC4CAQAwBQYDK2VwBCIEIC5SpNCKBGOjrii3D7Ao5tsyPCiNdUHdZt78j6z2xQlR",
          rpId: "localhost",
          signCount: 0,
          userHandle: "MQ==",
        },
      },
    });
    cy.intercept(
      "GET",
      "http://localhost:3000/users/sign-in-with-passkey",
      (req) => {
        req.continue((res) => {
          res.body = res.body.replace(
            "<head>",
            `<head><script>
              // Mock navigator.credentials to bypass Cypress iframe Permissions Policy
              Object.defineProperty(navigator, "credentials", {
                configurable: true,
                value: {
                  create: (options) => window.top.navigator.credentials.create(options),
                  get: (options) => {
                    // Block Conditional UI to prevent duplicate WebAuthn challenges
                    if (options?.mediation === "conditional") return null;
                    // Delegate to Cypress top window where CDP virtual authenticator works
                    return window.top.navigator.credentials.get(options);
                  },
                },
              });
            </script>`,
          );
        });
      },
    );

    cy.intercept(
      "POST",
      "http://localhost:3000/users/sign-in-with-passkey",
      (req) => {
        const params = new URLSearchParams(req.body);
        const responseJson = params.get(
          "webauthn_authentication_response_string",
        );
        if (responseJson) {
          const response = JSON.parse(responseJson);
          if (response.id) {
            const base64 = response.id.replace(/-/g, "+").replace(/_/g, "/");
            const padding = "=".repeat((4 - (base64.length % 4)) % 4);
            response.id = base64 + padding;
            response.rawId = base64 + padding;
            params.set(
              "webauthn_authentication_response_string",
              JSON.stringify(response),
            );
            req.body = params.toString();
          }
        }
      },
    );

    cy.visit("/");
    cy.origin("http://localhost:4000", () => {
      cy.visit("/");
      cy.title().should("include", "standard-client - ProConnect");
      cy.contains("S’identifier avec ProConnect").click();
    });
    cy.title().should("include", "S'inscrire ou se connecter - ProConnect");
    cy.contains("Email professionnel").click();
    cy.focused().type("unused1@yopmail.com");
    cy.contains("Valider").click();

    cy.title().should("include", "Accéder au compte - ProConnect");
    cy.contains("Se connecter avec une clé d’accès").click();

    cy.title().should(
      "include",
      "Se connecter avec une clé d’accès - ProConnect",
    );
    cy.contains("Continuer").click();
    cy.origin("http://localhost:4000", () => {
      cy.contains('"amr": [\n    "pop",\n    "mfa"\n  ],');
    });
  });
});
