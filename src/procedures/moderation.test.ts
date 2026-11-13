import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { given, userActivity } from "../../testing";
import { moderationOpened } from "./moderation";

const procedures = { moderation: { opened: moderationOpened } };

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
