//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { getAuthenticatorsByUserIdFactory } from "./get-authenticators-by-user-id.js";

//

const getAuthenticatorsByUserId = getAuthenticatorsByUserIdFactory({
  pg: pg as any,
});

suite("getAuthenticatorsByUserIdFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should return empty array when user has no authenticators", async () => {
    const authenticators = await getAuthenticatorsByUserId(1);

    assert.deepEqual(authenticators, []);
  });

  test("should return authenticators for a user", async () => {
    await pg.sql`
      INSERT INTO users
        (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES
        (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'lion', 'el''jonson', 'i', 'primarque')
      ;
    `;
    await pg.sql`
      INSERT INTO authenticators
        (credential_id, credential_public_key, counter, credential_backed_up, user_id, usage_count, user_verified)
      VALUES
        ('CRED1', '\\x00', 0, false, 1, 0, true)
      ;
    `;

    const authenticators = await getAuthenticatorsByUserId(1);

    assert.equal(authenticators.length, 1);
    assert.equal(authenticators[0]?.credential_id, "CRED1");
  });
});
