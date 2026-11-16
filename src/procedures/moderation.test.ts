import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { given, userActivity } from "../../testing";
import { moderationCancelled, moderationOpened } from "./moderation";

const procedures = {
  moderation: { cancelled: moderationCancelled, opened: moderationOpened },
};

describe("moderation.cancelled", () => {
  it("✅ deletes the moderation and journals what it was under the user", async () => {
    const { db, journal, runtime } = await given({ procedures });
    await db.insert(schema.organizations).values({
      created_at: "4444-04-04",
      id: 1,
      siret: "11111111111111",
      updated_at: "4444-04-04",
    });
    await db.insert(schema.moderations).values({
      id: 1,
      organization_id: 1,
      status: "pending",
      type: "organization_join_block",
      user_id: 1,
    });

    const outcome = await runtime.moderation.cancelled.mutate({
      moderation_id: 1,
    });

    assert.equal(outcome.kind, "moderation_cancelled");
    assert.deepEqual(await db.select().from(schema.moderations), []);
    assert.deepEqual(await journal(), [
      userActivity(
        "moderation.cancelled",
        {
          inputs: {},
          outcome: {
            previous: { status: "pending", type: "organization_join_block" },
          },
        },
        { moderation_id: 1, organization_id: 1 },
      ),
    ]);
  });

  it("❎ journals nothing when the moderation is already gone", async () => {
    const { journal, runtime } = await given({ procedures });

    const outcome = await runtime.moderation.cancelled.mutate({
      moderation_id: 42,
    });

    assert.equal(outcome.kind, "moderation_not_found");
    assert.deepEqual(await journal(), []);
  });
});

describe("moderation.opened", () => {
  it("✅ journals the request under the user, the organization and the moderation", async () => {
    const { db, journal, runtime } = await given({ procedures });
    await db.insert(schema.organizations).values({
      created_at: "4444-04-04",
      id: 1,
      siret: "11111111111111",
      updated_at: "4444-04-04",
    });

    await runtime.moderation.opened.mutate({
      organization_id: 1,
      sp_name: "Lasagnes",
      ticket_id: "session_42",
      type: "organization_join_block",
      user_id: 1,
    });

    assert.deepEqual(await journal(), [
      userActivity(
        "moderation.opened",
        {
          inputs: { sp_name: "Lasagnes", type: "organization_join_block" },
          outcome: {},
        },
        { moderation_id: 1, organization_id: 1 },
      ),
    ]);
  });
});
