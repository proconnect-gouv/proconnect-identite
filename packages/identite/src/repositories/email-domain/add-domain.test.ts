//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, mock, suite, test } from "node:test";
import { addDomainFactory } from "./add-domain.js";

//

const addDomain = addDomainFactory({ pg: pg as any });

suite("addDomainFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should add domain", async () => {
    await pg.sql`
      INSERT INTO organizations
        (id, siret, created_at, updated_at)
      VALUES
        (1, '66204244933106', '3333-03-03', '3333-04-04')
      ;
    `;
    mock.timers.enable({ apis: ["Date"], now: new Date("4444-04-04") });

    const emailDomain = await addDomain({
      domain: "darkangels.world",
      organization_id: 1,
      verification_type: "verified",
    });

    assert.deepEqual(emailDomain, {
      can_be_suggested: true,
      created_at: new Date("4444-04-04"),
      domain: "darkangels.world",
      id: 1,
      organization_id: 1,
      updated_at: new Date("4444-04-04"),
      verification_type: "verified",
      verified_at: new Date("4444-04-04"),
    });
  });
});
