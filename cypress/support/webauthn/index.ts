//

import type { VirtualAuthenticatorOptions } from "./types";

declare global {
  namespace Cypress {
    interface Chainable {
      addVirtualAuthenticator: typeof addVirtualAuthenticator;

      /**
       * Gets the first credential from the virtual authenticator.
       * @example
       * cy.get("@authenticator").getFirstCertification();
       */
      getFirstCertification: () => ReturnType<typeof getFirstCertification>;
    }
  }
}

//

Cypress.Commands.add("addVirtualAuthenticator", addVirtualAuthenticator);
Cypress.Commands.add(
  "getFirstCertification",
  { prevSubject: true },
  getFirstCertification,
);

//

/**
 * Adds a virtual authenticator for WebAuthn testing.
 * @example
 * cy.addVirtualAuthenticator({
 *   protocol: "ctap2",
 *   transport: "internal",
 *   hasResidentKey: true,
 *   hasUserVerification: true,
 *   isUserVerified: true,
 * }).as("authenticator");
 */
function addVirtualAuthenticator(options: VirtualAuthenticatorOptions) {
  return cy.wrap(
    Cypress.automation("remote:debugger:protocol", {
      command: "WebAuthn.disable",
      params: {},
    })
      .then(() => {
        return Cypress.automation("remote:debugger:protocol", {
          command: "WebAuthn.enable",
          params: {},
        });
      })
      .then(() => {
        return Cypress.automation("remote:debugger:protocol", {
          command: "WebAuthn.addVirtualAuthenticator",
          params: {
            options,
          },
        });
      })
      .then((result) => {
        return result.authenticatorId as string;
      }),
  );
}

function getFirstCertification(authenticatorId: string) {
  return cy
    .then<{ credentials: { credentialId: string }[] }>(() =>
      Cypress.automation("remote:debugger:protocol", {
        command: "WebAuthn.getCredentials",
        params: { authenticatorId },
      }),
    )
    .then(({ credentials }) => {
      return credentials[0];
    });
}

//

export {};
