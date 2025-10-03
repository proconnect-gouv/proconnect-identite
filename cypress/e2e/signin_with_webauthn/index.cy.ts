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
    cy.intercept("http://localhost:3000/**", (req) => {
      req.continue((res) => {
        if (res.headers["content-type"]?.includes("text/html")) {
          res.body = res.body.replace(
            "<head>",
            `<head><script>
              Object.defineProperty(navigator, "credentials", {
                configurable: true,
                value: {
                  create: async (options) => window.top.navigator.credentials.create(options),
                  get: async (options) => {
                    if (options?.mediation === "conditional") return null;
                    const serialized = JSON.parse(
                      JSON.stringify(options, (k, v) =>
                        k === "signal" || v instanceof AbortSignal
                          ? undefined
                          : ArrayBuffer.isView(v) || v instanceof ArrayBuffer
                            ? Array.from(new Uint8Array(v))
                            : v,
                      ),
                    );
                    if (serialized.publicKey) {
                      if (serialized.publicKey.challenge) {
                        serialized.publicKey.challenge = new Uint8Array(
                          serialized.publicKey.challenge,
                        );
                      }
                      if (serialized.publicKey.allowCredentials) {
                        serialized.publicKey.allowCredentials =
                          serialized.publicKey.allowCredentials.map((c) => ({
                            ...c,
                            id: new Uint8Array(c.id),
                          }));
                      }
                    }
                    return await window.top.navigator.credentials.get(serialized);
                  },
                },
              });

            </script>`,
          );
        }
      });
    });

    cy.visit("http://localhost:4000");

    cy.title().should("include", "standard-client - ProConnect");
    cy.contains("S’identifier avec ProConnect").click();

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

    cy.contains('"amr": [\n    "pop",\n    "mfa"\n  ],');
  });
});
