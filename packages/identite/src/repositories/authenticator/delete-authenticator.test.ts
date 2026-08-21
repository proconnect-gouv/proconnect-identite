//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { deleteAuthenticatorFactory } from "./delete-authenticator.js";

//

const deleteAuthenticator = deleteAuthenticatorFactory({ pg: pg as any });

suite("deleteAuthenticatorFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should return true when the authenticator exists", async () => {
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

    const result = await deleteAuthenticator(1, "CRED1");

    assert.equal(result, true);
  });

  test("should return false when the authenticator does not exist", async () => {
    const result = await deleteAuthenticator(1, "absent");

    assert.equal(result, false);
  });
});
