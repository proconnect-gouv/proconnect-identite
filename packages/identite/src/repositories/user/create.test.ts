//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, mock, suite, test } from "node:test";
import { createUserFactory } from "./create.js";

//

const createUser = createUserFactory({ pg: pg as any });

suite("createUserFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should create the god-emperor of mankind", async () => {
    mock.timers.enable({ apis: ["Date"], now: new Date("4444-04-04") });

    const user = await createUser({ email: "god-emperor@mankind" });

    assert.deepEqual(user, {
      created_at: new Date("4444-04-04"),
      current_challenge: null,
      email: "god-emperor@mankind",
      email_verified: false,
      email_verified_at: null,
      encrypted_password: null,
      encrypted_totp_key: null,
      family_name: null,
      force_2fa: false,
      given_name: null,
      id: 1,
      job: null,
      last_sign_in_at: null,
      magic_link_sent_at: null,
      magic_link_token: null,
      needs_inclusionconnect_onboarding_help: false,
      needs_inclusionconnect_welcome_page: false,
      phone_number: null,
      reset_password_sent_at: null,
      reset_password_token: null,
      sign_in_count: 0,
      totp_key_verified_at: null,
      updated_at: new Date("4444-04-04"),
      verify_email_sent_at: null,
      verify_email_token: null,
    });
  });
});
