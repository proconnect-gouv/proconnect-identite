//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { findAuthenticatorFactory } from "./find-authenticator.js";

//

const findAuthenticator = findAuthenticatorFactory({ pg: pg as any });

suite("findAuthenticatorFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should return undefined when the authenticator does not exist", async () => {
    const authenticator = await findAuthenticator(1, "absent");

    assert.equal(authenticator, undefined);
  });

  test("should return the authenticator when it exists", async () => {
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

    const authenticator = await findAuthenticator(1, "CRED1");

    assert.equal(authenticator?.credential_id, "CRED1");
  });
});
