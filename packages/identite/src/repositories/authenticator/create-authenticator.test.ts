//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { createAuthenticatorFactory } from "./create-authenticator.js";

//

const createAuthenticator = createAuthenticatorFactory({ pg: pg as any });

suite("createAuthenticatorFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should insert and return the authenticator", async () => {
    await pg.sql`
      INSERT INTO users
        (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES
        (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'lion', 'el''jonson', 'i', 'primarque')
      ;
    `;

    const result = await createAuthenticator({
      user_id: 1,
      authenticator: {
        credential_id: "CRED1",
        credential_public_key: new Uint8Array([0]),
        counter: 0,
        credential_device_type: "singleDevice",
        credential_backed_up: false,
        transports: ["usb"],
        display_name: "Yardrean's Blade",
        last_used_at: null,
        usage_count: 0,
        user_verified: true,
      },
    });

    assert.equal(result.credential_id, "CRED1");
    assert.equal(result.user_id, 1);
  });
});
