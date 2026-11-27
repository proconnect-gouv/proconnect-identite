//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { renameAuthenticatorFactory } from "./rename-authenticator.js";

//

const renameAuthenticator = renameAuthenticatorFactory({ pg: pg as any });

suite("renameAuthenticatorFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  beforeEach(async () => {
    await pg.sql`
      INSERT INTO users
        (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES
        (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'lion', 'el''jonson', 'i', 'primarque'),
        (2, 'perturabo@ironwarriors.world', '4444-04-04', '4444-04-04', 'perturabo', '', 'i', 'primarque')
      ;
    `;
    await pg.sql`
      INSERT INTO authenticators
        (credential_id, credential_public_key, counter, credential_backed_up, user_id, usage_count, user_verified, display_name)
      VALUES
        ('CRED1', '\\x00', 42, false, 1, 7, true, 'iCloud Keychain')
      ;
    `;
  });

  test("should rename the authenticator without touching its counters", async () => {
    const authenticator = await renameAuthenticator(1, "CRED1", "iPhone perso");

    assert.equal(authenticator?.display_name, "iPhone perso");
    assert.equal(authenticator?.counter, 42);
    assert.equal(authenticator?.usage_count, 7);
  });

  test("should reset the name to null", async () => {
    const authenticator = await renameAuthenticator(1, "CRED1", null);

    assert.equal(authenticator?.display_name, null);
  });

  test("should not rename another user's authenticator", async () => {
    const authenticator = await renameAuthenticator(2, "CRED1", "piraté");

    assert.equal(authenticator, undefined);
  });
});
