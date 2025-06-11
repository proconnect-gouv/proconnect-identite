//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { deleteEmailDomainsByVerificationTypesFactory } from "./delete-email-domains-by-verification-types.js";

//

const deleteEmailDomainsByVerificationTypes =
  deleteEmailDomainsByVerificationTypesFactory({
    pg: pg as any,
  });

suite("deleteEmailDomainsByVerificationTypesFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should delete domain verification type NULL and 'verified'", async () => {
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
        (1, 1, 'darkangels.world', NULL, TRUE, '3333-03-03', '3333-04-04'),
        (1, 1, 'darkangels.world', "verified", TRUE, '3333-03-03', '3333-04-04')
      ;
    `;

    const affectedRowCount = await deleteEmailDomainsByVerificationTypes({
      domain: "darkangels.world",
      organization_id: 1,
      domain_verification_types: [null, "verified"],
    });

    assert.equal(affectedRowCount, 2);
  });
});
