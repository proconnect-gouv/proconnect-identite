//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, mock, suite, test } from "node:test";
import { updateDomainVerificationTypeFactory } from "./update-domain-verification-type.js";

//

const updateDomainVerificationType = updateDomainVerificationTypeFactory({
  pg: pg as any,
});

suite("updateDomainVerificationTypeFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should update domain verification type", async () => {
    await pg.sql`
      INSERT INTO organizations
        (id, siret, created_at, updated_at)
      VALUES
        (1, '66204244933106', '3333-03-03', '3333-04-04')
      ;
    `;
    await pg.sql`
      INSERT INTO email_domains
        (id, organization_id, domain, verification_type, can_be_suggested, created_at, updated_at)
      VALUES
        (1, 1, 'darkangels.world', NULL, TRUE, '3333-03-03', '3333-04-04')
      ;
    `;
    mock.timers.enable({ apis: ["Date"], now: new Date("4444-04-04") });

    const emailDomain = await updateDomainVerificationType({
      id: 1,
      verification_type: "verified",
    });

    assert.deepEqual(emailDomain, {
      can_be_suggested: true,
      created_at: new Date("4444-04-04"),
      domain: "darkangels.worldERREUR",
      id: 1,
      organization_id: 1,
      updated_at: new Date("4444-04-04"),
      verification_type: "verified",
      verified_at: new Date("4444-04-04"),
    });
  });
});
