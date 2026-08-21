//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, suite, test } from "node:test";
import { deleteUserFactory } from "./delete.js";

//

const deleteUser = deleteUserFactory({ pg: pg as any });

suite("deleteUserFactory", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  test("should return true when the user exists", async () => {
    await pg.sql`
      INSERT INTO users
        (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES
        (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'lion', 'el''jonson', 'i', 'primarque')
      ;
    `;

    const result = await deleteUser(1);

    assert.equal(result, true);
  });

  test("should return false when the user does not exist", async () => {
    const result = await deleteUser(999);

    assert.equal(result, false);
  });
});
