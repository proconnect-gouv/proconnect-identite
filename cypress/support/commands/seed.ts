//

import { dirname } from "path";

//

export function seed() {
  {
    const command = "npm run delete-database";
    cy.task("log", `$ ${command}`);
    cy.exec(command, { env: { ENABLE_DATABASE_DELETION: "True" } }).then(
      (result) => cy.task("log", result.stdout),
    );
  }
  {
    const command = "npm run migrate up";
    cy.task("log", `$ ${command}`);
    cy.exec(command).then((result) => cy.task("log", result.stdout));
  }
  {
    const scope = dirname(Cypress.spec.relative);
    const command = `npm run fixtures:load-ci -- ${scope}/fixtures.sql`;
    cy.task("log", `$ ${command}`);
    cy.exec(command).then((result) => cy.task("log", result.stdout));
  }
  {
    const command = "npm run update-organization-info -- 2000";
    cy.task("log", `$ ${command}`);
    cy.exec(command, { timeout: 10_000 }).then((result) =>
      cy.task("log", result.stdout),
    );
  }

  return cy.wrap(undefined);
}
