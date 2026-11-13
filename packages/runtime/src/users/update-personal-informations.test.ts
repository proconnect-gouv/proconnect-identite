//

import { createIdentiteRuntime } from "#src/runtime";
import { createTestDatabase, readActivityLogs } from "#testing";
import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import assert from "node:assert/strict";
import { describe, it } from "node:test";

//

async function setup() {
  const db = await createTestDatabase();
  await db.insert(schema.users).values({
    created_at: new Date("4444-04-04"),
    email: "jean.valjean@republic.fr",
    id: 1,
    updated_at: new Date("4444-04-04"),
  });

  return {
    db,
    runtime: createIdentiteRuntime({ app: "proconnect-identite", db }).as({
      type: "user",
      user_id: 1,
    }),
  };
}

describe("updatePersonalInformations", () => {
  it("✅ changes the profile and journals the previous values", async () => {
    const { db, runtime } = await setup();

    const outcome = await runtime.updatePersonalInformations({
      information: {
        family_name: "Valjean",
        given_name: "Jean",
        job: "Maire",
        phone_number: null,
      },
      user_id: 1,
    });

    assert.deepEqual(outcome, {
      kind: "info_changed",
      activity_id: 1,
      next: {
        family_name: "Valjean",
        given_name: "Jean",
        job: "Maire",
        phone_number: null,
      },
      previous: {
        family_name: null,
        given_name: null,
        job: null,
        phone_number: null,
      },
    });
    assert.deepEqual(await readActivityLogs(db), [
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
            job: "Maire",
            phone_number: null,
          },
          outcome: {
            previous: {
              family_name: null,
              given_name: null,
              job: null,
              phone_number: null,
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

  it("❎ writes nothing when the profile does not change", async () => {
    const { db, runtime } = await setup();

    const outcome = await runtime.updatePersonalInformations({
      information: { given_name: null },
      user_id: 1,
    });

    assert.deepEqual(outcome, { kind: "info_unchanged", user_id: 1 });
    assert.deepEqual(await readActivityLogs(db), []);
  });

  it("❎ returns user_not_found and journals nothing", async () => {
    const { db, runtime } = await setup();

    const outcome = await runtime.updatePersonalInformations({
      information: { given_name: "Jean" },
      user_id: 42,
    });

    assert.deepEqual(outcome, { kind: "user_not_found", user_id: 42 });
    assert.deepEqual(await readActivityLogs(db), []);
  });
});
