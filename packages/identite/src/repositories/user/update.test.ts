//

import { emptyDatabase, migrate, pg } from "#testing";
import assert from "node:assert/strict";
import { before, beforeEach, it, suite } from "node:test";
import { updateUserFactory } from "./update.js";

//

const updateUser = updateUserFactory({ pg: pg as any });

suite(updateUserFactory.name, () => {
  before(migrate);
  beforeEach(emptyDatabase);

  it("should update the user job", async () => {
    await pg.sql`
      INSERT INTO users
        (id, email, created_at, updated_at, given_name, family_name, phone_number, job)
      VALUES
        (1, 'lion.eljonson@darkangels.world', '4444-04-04', '4444-04-04', 'Lion', 'El''Jonson', 'I', 'Primarque');
    `;
    const user = await updateUser(1, { job: "Chevalier de l'Ordre" });
    assert.equal(user.job, "Chevalier de l'Ordre");
  });
});
