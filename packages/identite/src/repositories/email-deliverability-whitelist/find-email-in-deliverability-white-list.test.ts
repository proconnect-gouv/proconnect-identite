//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { findEmailInDeliverabilityWhiteListFactory } from "./find-email-in-deliverability-white-list.js";

//

const findEmailInDeliverabilityWhiteList =
  findEmailInDeliverabilityWhiteListFactory({ pg: pg as any });

suite("findEmailInDeliverabilityWhiteListFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should return undefined when the domain is not whitelisted", async () => {
    const result = await findEmailInDeliverabilityWhiteList(
      "lion@darkangels.world",
    );

    assert.equal(result, undefined);
  });

  test("should return the whitelist entry when the domain matches", async () => {
    await pg.sql`
      INSERT INTO email_deliverability_whitelist
        (problematic_email, email_domain)
      VALUES
        ('lion@darkangels.world', 'darkangels.world')
      ;
    `;

    const result = await findEmailInDeliverabilityWhiteList(
      "lion@darkangels.world",
    );

    assert.deepEqual(result, {
      problematic_email: "lion@darkangels.world",
      email_domain: "darkangels.world",
      verified_at: result?.verified_at,
      verified_by: null,
    });
  });
});
