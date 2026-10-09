//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { findByResetPasswordTokenFactory } from "./find-by-reset-password-token.js";

//

const findByResetPasswordToken = findByResetPasswordTokenFactory({
  pg: pg as any,
});

suite("findByResetPasswordTokenFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should find a user by reset_password_token", async () => {
    await pg.sql`
      INSERT INTO users
        (id, email, created_at, updated_at, given_name, family_name, phone_number, job, reset_password_token)
      VALUES
        (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'lion', 'el''jonson', 'i', 'primarque', 'TOKEN')
      ;
    `;

    const user = await findByResetPasswordToken("TOKEN");

    assert.equal(user?.id, 1);
  });

  test("should return undefined when the token does not exist", async () => {
    const user = await findByResetPasswordToken("absent");

    assert.equal(user, undefined);
  });
});
