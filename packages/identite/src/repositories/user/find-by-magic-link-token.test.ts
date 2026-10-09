//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { findByMagicLinkTokenFactory } from "./find-by-magic-link-token.js";

//

const findByMagicLinkToken = findByMagicLinkTokenFactory({ pg: pg as any });

suite("findByMagicLinkTokenFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should find a user by magic_link_token", async () => {
    await pg.sql`
      INSERT INTO users
        (id, email, created_at, updated_at, given_name, family_name, phone_number, job, magic_link_token)
      VALUES
        (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'lion', 'el''jonson', 'i', 'primarque', 'TOKEN')
      ;
    `;

    const user = await findByMagicLinkToken("TOKEN");

    assert.equal(user?.id, 1);
  });

  test("should return undefined when the token does not exist", async () => {
    const user = await findByMagicLinkToken("absent");

    assert.equal(user, undefined);
  });
});
