//

import type { ContextsOf } from "#src/activity";
import type { IdentiteTransaction } from "#src/database";
import { createIdentiteRuntime } from "#src/runtime";
import { createTestDatabase, readActivityLogs } from "#testing";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import * as z from "zod";

//

const hyyypertool_activities = {
  "moderation.commented": z.object({
    inputs: z.object({
      comment: z.string(),
    }),
    outcome: z.object({
      moderation_id: z.number(),
    }),
  }),
};

type HyyypertoolActivityContexts = ContextsOf<typeof hyyypertool_activities>;

const darkangels_commented = {
  action: "moderation.commented" as const,
  context: {
    inputs: { comment: "darkangels.world looks legit" },
    outcome: { moderation_id: 7 },
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
    }).as({ type: "moderator", sub: "moderator+comments-darkangels.world" }),
  };
}

describe("record", () => {
  it("✅ journals the caller's own action under its actor, in the caller's transaction", async () => {
    const { db, moderator } = await setup();

    const outcome = await db.transaction((tx) =>
      moderator.record(tx, darkangels_commented),
    );

    assert.deepEqual(outcome, { activity_id: 1 });
    assert.deepEqual(await readActivityLogs(db), [
      {
        action: "moderation.commented",
        actor_ref: "moderator+comments-darkangels.world",
        actor_type: "moderator",
        app: "hyyypertool",
        cause_activity_id: null,
        context: darkangels_commented.context,
        interaction_cid: null,
        moderation_id: null,
        organization_id: 1,
        user_id: null,
      },
    ]);
  });

  it("🚫 does not compile another owner's action, a mismatched context, the bare database or an overlapping owner", async () => {
    const { db } = await setup();
    const { record } = createIdentiteRuntime<HyyypertoolActivityContexts>({
      app: "hyyypertool",
      db,
    }).as({ type: "moderator", sub: "moderator" });

    void ((tx: IdentiteTransaction) =>
      record(tx, {
        // @ts-expect-error domain.verified belongs to the runtime, only changeEmailDomainVerification writes it
        action: "domain.verified",
        context: darkangels_commented.context,
      }));

    void ((tx: IdentiteTransaction) =>
      record(tx, {
        action: "moderation.commented",
        // @ts-expect-error the context does not match moderation.commented
        context: { inputs: { comment: "darkangels.world" }, outcome: {} },
      }));

    void (() =>
      // @ts-expect-error the bare database is not a transaction
      record(db, darkangels_commented));

    type OverlappingContexts = {
      "domain.verified": HyyypertoolActivityContexts["moderation.commented"];
    };
    // @ts-expect-error domain.verified is already defined by the runtime
    void createIdentiteRuntime<OverlappingContexts>({ app: "hyyypertool", db });

    void ((tx: IdentiteTransaction) =>
      createIdentiteRuntime({ app: "proconnect-identite", db })
        .as({ type: "app", job: "join.official_contact" })
        // @ts-expect-error proconnect-identite has no app-only action to record
        .record(tx, darkangels_commented));
  });
});
