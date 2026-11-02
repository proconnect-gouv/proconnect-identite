//

import type { ContextsOf } from "#src/activity";
import { createIdentiteRuntime } from "#src/runtime";
import { createTestDatabase, readActivityLogs } from "#testing";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as z from "zod";

//

const hyyypertool_activities = {
  "domain.refused": z.object({
    inputs: z.object({
      domain: z.string(),
      verification_type: z.literal("refused"),
    }),
    outcome: z.object({
      email_domain_id: z.number(),
      replaced_verification_types: z.array(z.string()),
    }),
  }),
};

type HyyypertoolActivityContexts = ContextsOf<typeof hyyypertool_activities>;

const darkangels_refused = {
  action: "domain.refused" as const,
  context: {
    inputs: {
      domain: "darkangels.world",
      verification_type: "refused" as const,
    },
    outcome: {
      email_domain_id: 7,
      replaced_verification_types: ["not_verified_yet"],
    },
  },
  organization_id: 1,
};

async function setup() {
  const db = await createTestDatabase();

  return {
    db,
    moderator: createIdentiteRuntime<HyyypertoolActivityContexts>({
      app: "hyyypertool",
      db,
    }).as({ type: "moderator", sub: "moderator+refuses-darkangels.world" }),
  };
}

describe("record", () => {
  it("✅ journals the caller's own action under its actor, in the caller's transaction", async () => {
    const { db, moderator } = await setup();

    const outcome = await db.transaction((tx) =>
      moderator.record(tx, darkangels_refused),
    );

    assert.deepEqual(outcome, { activity_id: 1 });
    assert.deepEqual(await readActivityLogs(db), [
      {
        action: "domain.refused",
        actor_ref: "moderator+refuses-darkangels.world",
        actor_type: "moderator",
        app: "hyyypertool",
        cause_activity_id: null,
        context: darkangels_refused.context,
        interaction_cid: null,
        moderation_id: null,
        organization_id: 1,
        user_id: null,
      },
    ]);
  });

  it("✅ lets the identite app record a shared action from its own use case", async () => {
    const { db } = await setup();
    const context = {
      inputs: {
        family_name: "El'Jonson",
        given_name: "Lion",
        job: "Primarque",
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
    };

    const outcome = await db.transaction((tx) =>
      createIdentiteRuntime({ app: "proconnect-identite", db })
        .as({ type: "user", user_id: 1 })
        .record(tx, { action: "user.info_changed", context, user_id: 1 }),
    );

    assert.deepEqual(outcome, { activity_id: 1 });
    assert.deepEqual(await readActivityLogs(db), [
      {
        action: "user.info_changed",
        actor_ref: "1",
        actor_type: "user",
        app: "proconnect-identite",
        cause_activity_id: null,
        context,
        interaction_cid: null,
        moderation_id: null,
        organization_id: null,
        user_id: 1,
      },
    ]);
  });
});
