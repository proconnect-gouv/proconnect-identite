//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { deleteAllAuthenticatorsByUserIdFactory } from "./delete-all-authenticators-by-user-id.js";

//

const deleteAllAuthenticatorsByUserId = deleteAllAuthenticatorsByUserIdFactory({
  pg: pg as any,
});

suite("deleteAllAuthenticatorsByUserIdFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should delete all the authenticators of the user only", async () => {
    await pg.sql`
      INSERT INTO users
        (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES
        (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'lion', 'el''jonson', 'i', 'primarque'),
        (2, 'rogal.dorn@imperialfists.world', '4444-04-04', '4444-04-04', 'rogal', 'dorn', 'i', 'primarque')
      ;
    `;
    await pg.sql`
      INSERT INTO authenticators
        (credential_id, credential_public_key, counter, credential_backed_up, user_id, usage_count, user_verified)
      VALUES
        ('CRED1', '\\x00', 0, false, 1, 0, true),
        ('CRED2', '\\x00', 0, false, 1, 0, true),
        ('CRED3', '\\x00', 0, false, 2, 0, true)
      ;
    `;

    const result = await deleteAllAuthenticatorsByUserId(1);

    assert.equal(result, true);
    const { rows } = await pg.query(
      "SELECT credential_id FROM authenticators ORDER BY credential_id",
    );
    assert.deepEqual(rows, [{ credential_id: "CRED3" }]);
  });

  test("should return false when the user has no authenticator", async () => {
    const result = await deleteAllAuthenticatorsByUserId(1);

    assert.equal(result, false);
  });
});
