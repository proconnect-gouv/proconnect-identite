//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import { deleteEmailDomainsByVerificationTypesFactory } from "./delete-email-domains-by-verification-types.js";

//

const deleteEmailDomainsByVerificationTypes =
  deleteEmailDomainsByVerificationTypesFactory({
    pg: pg as any,
  });

describe("deleteEmailDomainsByVerificationTypesFactory", function () {
  before(migrate);
  beforeEach(emptyDatabase);

  it("should delete domain verification type NULL and 'verified'", async () => {
    await pg.sql`
      INSERT INTO organizations
        (id, siret, created_at, updated_at)
      VALUES
        (1, '66204244933106', '3333-03-03', '3333-04-04')
      ;
    `;

    await pg.sql`
      INSERT INTO email_domains
        (domain, organization_id, verification_type)
      VALUES
        ('darkangels.world', 1, NULL),
        ('darkangels.world', 1, 'verified')
      ;
    `;

    const result = await deleteEmailDomainsByVerificationTypes({
      domain: "darkangels.world",
      organization_id: 1,
      domain_verification_types: [null, "verified"],
    });

    assert.deepEqual(result, {
      affectedRows: 2,
      fields: [],
      rows: [],
    });
  });
});
