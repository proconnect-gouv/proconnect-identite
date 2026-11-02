//

import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import { eq } from "drizzle-orm";
import assert from "node:assert/strict";
import { before, beforeEach, describe, it } from "node:test";
import { db, emptyDatabase, migrate } from "#testing";
import { with_dates } from "../../repositories/dates";
import { updatePersonalInformations } from "./update-personal-informations";

//

async function seed_user() {
  await db.insert(schema.users).values({
    created_at: "4444-04-04",
    email: "jean.valjean@republic.fr",
    family_name: "Valjean",
    given_name: "Jean",
    id: 1,
    job: "Maire",
    phone_number: "0102030405",
    updated_at: "4444-04-04",
  });
}

async function read_user() {
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, 1),
  });
  assert.ok(user);
  return with_dates(user);
}

function read_activity_logs() {
  return db.query.activity_logs.findMany({
    columns: { created_at: false, id: false },
    orderBy: (table, { asc }) => asc(table.id),
  });
}

describe("updatePersonalInformations", () => {
  before(migrate);
  beforeEach(emptyDatabase);

  it("updates the information and journals the previous values", async () => {
    await seed_user();
    const previous = await read_user();

    const user = await updatePersonalInformations({
      db,
      information: { job: "Préfet" },
      user_id: 1,
    });

    const { updated_at, ...actual } = user;
    const { updated_at: previous_updated_at, ...expected } = {
      ...previous,
      job: "Préfet",
    };
    assert.deepEqual(actual, expected);
    assert.ok(updated_at instanceof Date);
    assert.notEqual(updated_at.getTime(), previous_updated_at.getTime());

    const current = await read_user();
    assert.deepEqual(
      { ...current, updated_at: null },
      { ...previous, job: "Préfet", updated_at: null },
    );

    assert.deepEqual(await read_activity_logs(), [
      {
        action: "user.info_changed",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context: {
          inputs: {
            family_name: "Valjean",
            given_name: "Jean",
            job: "Préfet",
            phone_number: "0102030405",
          },
          outcome: {
            previous: {
              family_name: "Valjean",
              given_name: "Jean",
              job: "Maire",
              phone_number: "0102030405",
            },
          },
        },
        interaction_cid: null,
        moderation_id: null,
        organization_id: null,
        user_id: 1,
      },
    ]);
  });

  it("writes nothing when the information does not change", async () => {
    await seed_user();
    const previous = await read_user();

    const user = await updatePersonalInformations({
      db,
      information: { given_name: "Jean" },
      user_id: 1,
    });

    assert.deepEqual(user, previous);
    assert.deepEqual(await read_user(), previous);
    assert.deepEqual(await read_activity_logs(), []);
  });
});
