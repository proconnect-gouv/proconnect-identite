import * as schema from "@proconnect-gouv/proconnect.identite.database/drizzle";
import type { IdentiteDatabase } from "@proconnect-gouv/proconnect.identite.runtime";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { given, userActivity } from "../../testing";
import {
  moderationCancelled,
  moderationOpened,
  moderationReopened,
} from "./moderation";
import { userInfoChanged } from "./profile";

const procedures = {
  moderation: {
    cancelled: moderationCancelled,
    opened: moderationOpened,
    reopened: moderationReopened,
  },
  user: { info_changed: userInfoChanged },
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

describe("moderation.reopened", () => {
  it("✅ reopens a rejected moderation in a row pointing at its cause", async () => {
    const { db, journal, runtime } = await given({ procedures });
    await givenModeration(db, "rejected");
    const changed = await runtime.user.info_changed.mutate({
      family_name: "Valjean",
      user_id: 1,
    });
    assert.ok(changed.kind === "info_changed");
    const { activity_id } = changed;

    const outcome = await runtime.moderation.reopened.mutate({
      cause: "Edition des informations personnelles",
      cause_activity_id: activity_id,
      moderation_id: 1,
      user_email: "jean.valjean@republic.fr",
      user_id: 1,
    });

    assert.equal(outcome.kind, "moderation_reopened");
    const [, reopened] = await journal();
    assert.deepEqual(reopened, {
      ...userActivity(
        "moderation.reopened",
        {
          inputs: { cause: "Edition des informations personnelles" },
          outcome: { previous: { status: "rejected" } },
        },
        { moderation_id: 1, organization_id: 1 },
      ),
      cause_activity_id: activity_id,
    });
    const [{ comment, ...moderation }] = await db
      .select({
        comment: schema.moderations.comment,
        moderated_at: schema.moderations.moderated_at,
        moderated_by: schema.moderations.moderated_by,
        status: schema.moderations.status,
      })
      .from(schema.moderations);
    assert.match(
      comment ?? "",
      /^motif \| Réouvert le \d{4}-\d{2}-\d{2} par jean\.valjean@republic\.fr - Edition des informations personnelles$/,
    );
    assert.deepEqual(moderation, {
      moderated_at: null,
      moderated_by: null,
      status: "reopened",
    });
  });

  it("❎ leaves a moderation that is no longer rejected as it is", async () => {
    const { db, journal, runtime } = await given({ procedures });
    await givenModeration(db, "accepted");
    const changed = await runtime.user.info_changed.mutate({
      family_name: "Valjean",
      user_id: 1,
    });
    assert.ok(changed.kind === "info_changed");
    const { activity_id } = changed;

    const outcome = await runtime.moderation.reopened.mutate({
      cause: "Edition des informations personnelles",
      cause_activity_id: activity_id,
      moderation_id: 1,
      user_email: "jean.valjean@republic.fr",
      user_id: 1,
    });

    assert.equal(outcome.kind, "moderation_not_rejected");
    assert.deepEqual(
      (await journal()).map(({ action }) => action),
      ["user.info_changed"],
    );
    const [moderation] = await db
      .select({ status: schema.moderations.status })
      .from(schema.moderations);
    assert.equal(moderation?.status, "accepted");
  });
});

async function givenModeration(db: IdentiteDatabase, status: string) {
  await db.insert(schema.organizations).values({
    created_at: "4444-04-04",
    id: 1,
    siret: "11111111111111",
    updated_at: "4444-04-04",
  });
  await db.insert(schema.moderations).values({
    comment: "motif",
    id: 1,
    moderated_at: "4444-04-04",
    moderated_by: "moderator@example.com",
    organization_id: 1,
    status,
    type: "organization_join_block",
    user_id: 1,
  });
}
