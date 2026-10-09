//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { updateAuthenticatorFactory } from "./update-authenticator.js";

//

const updateAuthenticator = updateAuthenticatorFactory({ pg: pg as any });

suite("updateAuthenticatorFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should update and return the authenticator", async () => {
    await pg.sql`
      INSERT INTO users
        (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES
        (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'lion', 'el''jonson', 'i', 'primarque')
      ;
    `;
    await pg.sql`
      INSERT INTO authenticators
        (credential_id, credential_public_key, counter, credential_backed_up, user_id, usage_count, user_verified, last_used_at)
      VALUES
        ('CRED1', '\\x00', 0, false, 1, 0, true, '4444-04-04')
      ;
    `;

    const result = await updateAuthenticator("CRED1", {
      counter: 7,
      last_used_at: new Date("4444-04-05"),
      usage_count: 3,
    });

    assert.equal(result.counter, 7);
    assert.equal(result.usage_count, 3);
  });
});
