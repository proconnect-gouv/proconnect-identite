//

// Simulate the expiry of every oidc-provider Grant by deleting their records
// from Redis, leaving the Sessions untouched (see panva/node-oidc-provider#1202:
// Grant expiration must not tear down the Session). Grants of other browser
// sessions go too: only use it when they don't matter for the rest of the spec.
export function expireGrants() {
  const command =
    "docker compose exec redis redis-cli --scan --pattern 'oidc:Grant:*' | xargs -r docker compose exec redis redis-cli DEL";
  cy.task("log", `$ ${command}`);
  return cy.exec(command).then(({ stdout }) => {
    expect(
      Number(stdout.trim()),
      "number of deleted Grant records",
    ).to.be.greaterThan(0);
  });
}
