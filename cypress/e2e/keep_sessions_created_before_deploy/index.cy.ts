//

// Sessions written before the deploy hold a user without the columns
// added by the deploy's migrations.
const removeRecoveryWordsIncentiveSeenAtFromStoredSessions = `docker compose exec -T redis sh -c '
  for key in $(redis-cli --scan --pattern "mcp:session:*"); do
    redis-cli GET "$key" \\
      | sed -E "s/,?\\"recovery_words_incentive_seen_at\\":(\\"[^\\"]*\\"|null)//" \\
      | redis-cli -x SET "$key" > /dev/null
  done
'`;

const getStoredSessions = `docker compose exec -T redis sh -c '
  for key in $(redis-cli --scan --pattern "mcp:session:*"); do
    redis-cli GET "$key"
  done
'`;

describe("keep sessions created before a deploy", () => {
  before(cy.seed);

  it("should stay signed in when the session lacks a newly added user column", function () {
    cy.visit("/manage-organizations");
    cy.login("signed-in-before-deploy@yopmail.com");

    cy.contains("Vos organisations de rattachement");

    cy.exec(getStoredSessions)
      .its("stdout")
      .should("include", '"recovery_words_incentive_seen_at"');

    cy.exec(removeRecoveryWordsIncentiveSeenAtFromStoredSessions);

    cy.exec(getStoredSessions)
      .its("stdout")
      .should("include", "signed-in-before-deploy@yopmail.com")
      .and("not.include", '"recovery_words_incentive_seen_at"');

    cy.reload();

    cy.contains("Vos organisations de rattachement");
    cy.contains("Commune de lamalou-les-bains - Mairie");
  });
});
