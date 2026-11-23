//

import { dirname } from "path";

//

export function seed() {
  return cy.task("seed", dirname(Cypress.spec.relative), {
    timeout: 4 * 60_000,
  });
}
